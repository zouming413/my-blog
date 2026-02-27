const { Server } = require('socket.io')

// 服务端常量定义
const ACTIONS = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  RAISE: 'raise',
  ALL_IN: 'all-in'
}

const GAME_PHASES = {
  IDLE: 'idle',
  PRE_FLOP: 'pre-flop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown'
}

const GAME_CONFIG = {
  SMALL_BLIND: 10,
  BIG_BLIND: 20
}

// 服务端手牌评估逻辑
const SUITS = {
  SPADES: { symbol: '♠', name: 'spades', color: 'black' },
  HEARTS: { symbol: '♥', name: 'hearts', color: 'red' },
  CLUBS: { symbol: '♣', name: 'clubs', color: 'black' },
  DIAMONDS: { symbol: '♦', name: 'diamonds', color: 'red' }
}

const SUIT_ARRAY = [SUITS.SPADES, SUITS.HEARTS, SUITS.CLUBS, SUITS.DIAMONDS]
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

function evaluateHand(holeCards, communityCards) {
  const allCards = [...holeCards, ...communityCards]
  const ranks = allCards.map(c => c.rank)
  const suits = allCards.map(c => c.suit)

  // 统计
  const rankCounts = {}
  const suitCounts = {}
  ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1)
  suits.forEach(s => {
    const suitName = s.name || s
    suitCounts[suitName] = (suitCounts[suitName] || 0) + 1
  })

  const counts = Object.values(rankCounts).sort((a, b) => b - a)
  const isFlush = Object.values(suitCounts).some(c => c >= 5)

  // 检查顺子
  const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  const uniqueRanks = [...new Set(ranks)]
  let isStraight = false
  for (let i = 0; i <= rankOrder.length - 5; i++) {
    const window = rankOrder.slice(i, i + 5)
    if (window.every(r => uniqueRanks.includes(r))) {
      isStraight = true
      break
    }
  }

  // 评估
  if (isFlush && isStraight) return { rank: 9, name: '同花顺' }
  if (counts[0] === 4) return { rank: 8, name: '四条' }
  if (counts[0] === 3 && counts[1] === 2) return { rank: 7, name: '葫芦' }
  if (isFlush) return { rank: 6, name: '同花' }
  if (isStraight) return { rank: 5, name: '顺子' }
  if (counts[0] === 3) return { rank: 4, name: '三条' }
  if (counts[0] === 2 && counts[1] === 2) return { rank: 3, name: '两对' }
  if (counts[0] === 2) return { rank: 2, name: '一对' }
  return { rank: 1, name: '高牌' }
}

function determineWinner(players, communityCards) {
  let bestPlayer = null
  let bestRank = 0
  let winners = []

  players.forEach(player => {
    if (player.folded) return
    const evaluation = evaluateHand(player.holeCards, communityCards)
    player.handRank = evaluation.rank

    if (evaluation.rank > bestRank) {
      bestRank = evaluation.rank
      winners = [player]
    } else if (evaluation.rank === bestRank) {
      winners.push(player)
    }
  })

  if (winners.length === 1) {
    return winners[0]
  }
  return winners
}

// 房间管理器
class RoomManager {
  constructor() {
    this.rooms = new Map() // roomId -> roomData
    this.playerRooms = new Map() // socketId -> roomId
  }

  // 创建房间
  createRoom(roomId, config) {
    const room = {
      id: roomId,
      config: {
        playerCount: config.playerCount || 2,
        startingChips: config.startingChips || 1000
      },
      players: [],
      gamePhase: 'idle',
      deck: null,
      communityCards: [],
      pot: 0,
      currentBet: 0,
      currentPlayerIndex: 0,
      winner: null
    }

    this.rooms.set(roomId, room)
    return room
  }

  // 获取房间
  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  // 删除房间
  deleteRoom(roomId) {
    // 移除所有玩家的房间映射
    const room = this.rooms.get(roomId)
    if (room) {
      room.players.forEach(player => {
        this.playerRooms.delete(player.socketId)
      })
    }
    this.rooms.delete(roomId)
  }

  // 玩家加入房间
  joinRoom(roomId, socketId, playerData) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    if (room.players.length >= room.config.playerCount) {
      return { error: '房间已满' }
    }

    const player = {
      socketId,
      id: playerData.id,
      name: playerData.name,
      chips: room.config.startingChips,
      holeCards: [],
      folded: false,
      currentRoundBet: 0,
      hasActed: false,
      lastAction: null,
      isReady: false
    }

    room.players.push(player)
    this.playerRooms.set(socketId, roomId)

    return { player, room }
  }

  // 玩家离开房间
  leaveRoom(socketId) {
    const roomId = this.playerRooms.get(socketId)
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (!room) return null

    // 移除玩家
    room.players = room.players.filter(p => p.socketId !== socketId)
    this.playerRooms.delete(socketId)

    // 如果房间空了，删除房间
    if (room.players.length === 0) {
      this.deleteRoom(roomId)
    }

    return room
  }

  // 获取玩家所在的房间
  getPlayerRoom(socketId) {
    const roomId = this.playerRooms.get(socketId)
    return roomId ? this.rooms.get(roomId) : null
  }

  // 获取房间内的玩家
  getPlayerInRoom(socketId) {
    const room = this.getPlayerRoom(socketId)
    if (!room) return null

    return room.players.find(p => p.socketId === socketId)
  }
}

const roomManager = new RoomManager()

// 创建 Socket.io 服务器
function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  })

  io.on('connection', (socket) => {
    console.log('玩家连接:', socket.id)

    // 创建房间
    socket.on('create-room', (config) => {
      // 生成4位房间号
      const roomId = Math.floor(1000 + Math.random() * 9000).toString()

      const room = roomManager.createRoom(roomId, config)

      // 创建者作为第一个玩家加入，使用配置中的名字
      const playerData = {
        id: `player-${socket.id}`,
        name: config.playerName || `玩家 ${room.players.length + 1}`
      }

      const result = roomManager.joinRoom(roomId, socket.id, playerData)

      socket.join(roomId)

      socket.emit('room-created', {
        roomId,
        playerId: result.player.id,
        players: getPublicPlayers(room)
      })

      console.log(`房间 ${roomId} 已创建`)
    })

    // 加入房间
    socket.on('join-room', ({ roomId, playerName }) => {
      const room = roomManager.getRoom(roomId)

      if (!room) {
        socket.emit('error', { message: '房间不存在' })
        return
      }

      if (room.players.length >= room.config.playerCount) {
        socket.emit('error', { message: '房间已满' })
        return
      }

      const playerData = {
        id: `player-${socket.id}`,
        name: playerName || `玩家 ${room.players.length + 1}`
      }

      const result = roomManager.joinRoom(roomId, socket.id, playerData)

      if (result.error) {
        socket.emit('error', { message: result.error })
        return
      }

      socket.join(roomId)

      // 通知所有人有新玩家加入
      io.to(roomId).emit('player-joined', {
        player: getPublicPlayer(result.player),
        players: getPublicPlayers(room)
      })

      // 检查房间是否已满
      if (room.players.length === room.config.playerCount) {
        io.to(roomId).emit('room-full', {
          players: getPublicPlayers(room)
        })
      }
    })

    // 玩家准备
    socket.on('player-ready', () => {
      const room = roomManager.getPlayerRoom(socket.id)
      if (!room) return

      const player = room.players.find(p => p.socketId === socket.id)
      if (!player) return

      player.isReady = true

      // 通知所有人
      io.to(room.id).emit('player-ready-changed', {
        playerId: player.id,
        isReady: true
      })

      // 检查是否所有玩家都准备好了
      const allReady = room.players.every(p => p.isReady)
      if (allReady && room.players.length >= 2) {
        // 开始游戏
        startGame(room, io)
      }
    })

    // 玩家行动
    socket.on('player-action', (actionData) => {
      const room = roomManager.getPlayerRoom(socket.id)
      if (!room) return

      const playerIndex = room.players.findIndex(p => p.socketId === socket.id)
      if (playerIndex === -1) return

      handlePlayerAction(room, playerIndex, actionData, io)
    })

    // 断开连接
    socket.on('disconnect', () => {
      console.log('玩家断开连接:', socket.id)

      const room = roomManager.leaveRoom(socket.id)
      if (room) {
        // 通知房间内其他玩家
        socket.to(room.id).emit('player-left', {
          socketId: socket.id
        })

        // 如果房间空了，删除
        if (room.players.length === 0) {
          roomManager.deleteRoom(room.id)
          console.log(`房间 ${room.id} 已删除`)
        }
      }
    })
  })

  return io
}

// 获取公开的玩家信息（不包含底牌）
function getPublicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    chips: player.chips,
    folded: player.folded,
    currentRoundBet: player.currentRoundBet,
    lastAction: player.lastAction,
    isReady: player.isReady
    // 不包含 holeCards
  }
}

// 获取所有公开的玩家信息
function getPublicPlayers(room) {
  return room.players.map(p => getPublicPlayer(p))
}

// 开始游戏
function startGame(room, io) {
  // 创建牌组
  let cards = []
  for (let suit of SUIT_ARRAY) {
    for (let rank of RANKS) {
      cards.push({ suit, rank })
    }
  }

  // 洗牌
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  room.deck = {
    cards,
    deal(count) {
      return this.cards.splice(0, count)
    },
    dealOne() {
      return this.cards.shift()
    }
  }
  room.communityCards = []
  room.pot = 0
  room.currentBet = 0
  room.winner = null
  room.gamePhase = GAME_PHASES.PRE_FLOP

  // 发底牌
  room.players.forEach(player => {
    player.holeCards = room.deck.deal(2)
    player.folded = false
    player.currentRoundBet = 0
    player.hasActed = false
    player.lastAction = null
  })

  // 下盲注
  const smallBlindAmount = GAME_CONFIG.SMALL_BLIND
  const bigBlindAmount = GAME_CONFIG.BIG_BLIND

  // 根据玩家数量决定盲注位置
  if (room.players.length === 2) {
    // 2人游戏：玩家1下大小盲注
    room.players[1].chips -= smallBlindAmount
    room.players[1].currentRoundBet = smallBlindAmount
    room.players[1].chips -= bigBlindAmount
    room.players[1].currentRoundBet += bigBlindAmount
    room.pot = smallBlindAmount + bigBlindAmount
  } else {
    // 3+人游戏：玩家1下小盲，玩家2下大盲
    room.players[1].chips -= smallBlindAmount
    room.players[1].currentRoundBet = smallBlindAmount
    room.players[2].chips -= bigBlindAmount
    room.players[2].currentRoundBet = bigBlindAmount
    room.pot = smallBlindAmount + bigBlindAmount
  }
  room.currentBet = bigBlindAmount
  room.currentPlayerIndex = 0

  // 重置准备状态
  room.players.forEach(p => p.isReady = false)

  // 广播游戏开始
  room.players.forEach(player => {
    const publicPlayers = getPublicPlayers(room)

    io.to(player.socketId).emit('game-started', {
      gamePhase: room.gamePhase,
      communityCards: room.communityCards,
      pot: room.pot,
      currentBet: room.currentBet,
      currentPlayerIndex: room.currentPlayerIndex,
      players: publicPlayers,
      // 只发送这个玩家的底牌
      yourCards: player.holeCards
    })
  })

  // 广播当前玩家
  io.to(room.id).emit('current-player-changed', {
    playerIndex: room.currentPlayerIndex
  })
}

// 处理玩家行动
function handlePlayerAction(room, playerIndex, actionData, io) {
  const player = room.players[playerIndex]

  let newPot = room.pot
  let newCurrentBet = room.currentBet

  switch (actionData.type) {
    case ACTIONS.FOLD:
      player.folded = true
      player.lastAction = ACTIONS.FOLD
      break

    case ACTIONS.CHECK:
      player.lastAction = ACTIONS.CHECK
      player.hasActed = true
      break

    case ACTIONS.CALL:
      const callAmount = Math.min(actionData.amount, player.chips)
      player.chips -= callAmount
      player.currentRoundBet += callAmount
      player.lastAction = ACTIONS.CALL
      player.hasActed = true
      newPot += callAmount
      break

    case ACTIONS.RAISE:
      const raiseAmount = Math.min(actionData.amount, player.chips)
      player.chips -= raiseAmount
      player.currentRoundBet += raiseAmount
      player.lastAction = ACTIONS.RAISE
      player.hasActed = true
      newPot += raiseAmount
      newCurrentBet = player.currentRoundBet
      // 重置其他玩家的 hasActed
      room.players.forEach((p, i) => {
        if (i !== playerIndex) p.hasActed = false
      })
      break

    case ACTIONS.ALL_IN:
      const allInAmount = player.chips
      player.currentRoundBet += allInAmount
      player.chips = 0
      player.lastAction = ACTIONS.ALL_IN
      player.hasActed = true
      newPot += allInAmount
      if (player.currentRoundBet > newCurrentBet) {
        newCurrentBet = player.currentRoundBet
        room.players.forEach((p, i) => {
          if (i !== playerIndex) p.hasActed = false
        })
      }
      break
  }

  room.pot = newPot
  room.currentBet = newCurrentBet

  // 广播玩家行动
  io.to(room.id).emit('player-acted', {
    playerId: player.id,
    action: actionData.type,
    amount: actionData.amount || 0,
    pot: room.pot,
    currentBet: room.currentBet,
    players: getPublicPlayers(room)
  })

  // 检查游戏是否结束
  const activePlayers = room.players.filter(p => !p.folded)
  if (activePlayers.length === 1) {
    endGame(room, activePlayers[0], io)
    return
  }

  // 检查是否进入下一阶段
  const allActed = activePlayers.every(p => p.hasActed)
  const allBetsEqual = activePlayers.every(p => p.currentRoundBet === room.currentBet || p.chips === 0)

  if (allActed && allBetsEqual) {
    nextPhase(room, io)
  } else {
    // 下一个玩家
    nextPlayer(room, io)
  }
}

// 下一个玩家
function nextPlayer(room, io) {
  let nextIndex = (room.currentPlayerIndex + 1) % room.players.length
  let loopCount = 0

  while (room.players[nextIndex].folded && loopCount < room.players.length) {
    nextIndex = (nextIndex + 1) % room.players.length
    loopCount++
  }

  room.currentPlayerIndex = nextIndex

  io.to(room.id).emit('current-player-changed', {
    playerIndex: nextIndex
  })
}

// 进入下一阶段
function nextPhase(room, io) {
  room.players.forEach(p => {
    p.currentRoundBet = 0
    p.hasActed = false
    p.lastAction = null
  })

  let newCommunityCards = [...room.communityCards]

  switch (room.gamePhase) {
    case GAME_PHASES.PRE_FLOP:
      const flop = room.deck.deal(3)
      newCommunityCards = flop
      room.gamePhase = GAME_PHASES.FLOP
      break

    case GAME_PHASES.FLOP:
      const turn = room.deck.deal(1)
      newCommunityCards = [...room.communityCards, ...turn]
      room.gamePhase = GAME_PHASES.TURN
      break

    case GAME_PHASES.TURN:
      const river = room.deck.deal(1)
      newCommunityCards = [...room.communityCards, ...river]
      room.gamePhase = GAME_PHASES.RIVER
      break

    case GAME_PHASES.RIVER:
      room.gamePhase = GAME_PHASES.SHOWDOWN
      room.currentBet = 0
      room.currentPlayerIndex = 0
      showdown(room, io)
      return
  }

  room.communityCards = newCommunityCards
  room.currentBet = 0
  room.currentPlayerIndex = 0

  // 广播新阶段
  io.to(room.id).emit('phase-changed', {
    gamePhase: room.gamePhase,
    communityCards: room.communityCards,
    pot: room.pot,
    currentBet: room.currentBet,
    currentPlayerIndex: room.currentPlayerIndex,
    players: getPublicPlayers(room)
  })
}

// 摊牌
function showdown(room, io) {
  // 为每个玩家发送底牌
  room.players.forEach(player => {
    if (!player.folded) {
      io.to(player.socketId).emit('show-cards', {
        playerId: player.id,
        cards: player.holeCards
      })
    }
  })

  const winners = determineWinner(room.players, room.communityCards)

  if (Array.isArray(winners)) {
    // 平局 - 分配底池
    const share = Math.floor(room.pot / winners.length)
    winners.forEach(winner => {
      winner.chips += share
    })
    room.winner = winners
  } else {
    // 单个获胜者 - winners 就是获胜玩家对象
    winners.chips += room.pot
    room.winner = [winners]
  }

  // 广播结果
  io.to(room.id).emit('game-ended', {
    winner: room.winner.map(w => ({
      id: w.id,
      name: w.name
    })),
    players: getPublicPlayers(room)
  })
}

// 游戏结束（有人弃牌）
function endGame(room, winner, io) {
  winner.chips += room.pot
  room.winner = [winner]
  room.gamePhase = 'showdown'

  io.to(room.id).emit('game-ended', {
    winner: [{
      id: winner.id,
      name: winner.name
    }],
    players: getPublicPlayers(room)
  })
}

module.exports = { createSocketServer, roomManager }
