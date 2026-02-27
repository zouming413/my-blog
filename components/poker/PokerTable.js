'use client'

import React, { useState, useEffect, useRef } from 'react'
import Deck from '../../lib/poker/deck'
import { GAME_CONFIG, GAME_PHASES, ACTIONS } from '../../lib/poker/constants'
import { createAIPlayer, aiDecision } from '../../lib/poker/ai'
import { evaluateHand, determineWinner } from '../../lib/poker/handRank'
import { delay, saveGameRecord } from '../../lib/poker/utils'
import Card from './Card'
import PlayerArea from './PlayerArea'
import Pot from './Pot'
import GameControls from './GameControls'
import HistoryModal from './HistoryModal'
import GameSetup from './GameSetup'

export default function PokerTable() {
  // 游戏状态
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.IDLE)
  const [players, setPlayers] = useState([])
  const playersRef = useRef([])
  const [communityCards, setCommunityCards] = useState([])
  const [pot, setPot] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [deck, setDeck] = useState(null)
  const [winner, setWinner] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [showSetup, setShowSetup] = useState(true)
  const [setupConfig, setSetupConfig] = useState({ playerCount: 1, startingChips: 1000 })

  // 同步 players 状态到 ref
  useEffect(() => {
    playersRef.current = players
  }, [players])

  // AI 玩家自动行动
  useEffect(() => {
    if (gamePhase === GAME_PHASES.IDLE || gamePhase === GAME_PHASES.SHOWDOWN) return

    const currentPlayer = players[currentPlayerIndex]
    if (currentPlayer && currentPlayer.isAI && !currentPlayer.folded) {
      // 使用 setTimeout 确保 DOM 更新完成
      const timer = setTimeout(() => {
        handleAIAction(currentPlayer)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayerIndex, gamePhase, players])

  const handleGameSetup = ({ playerCount, startingChips }) => {
    setSetupConfig({ playerCount, startingChips })
    setShowSetup(false)
    initGame()
  }

  const initGame = () => {
    // 根据配置初始化游戏
    const { playerCount, startingChips } = setupConfig

    // 创建玩家1
    const humanPlayer1 = {
      id: 'player1',
      name: playerCount >= 1 ? '玩家 1' : '你',
      isAI: false,
      chips: startingChips,
      holeCards: [],
      folded: false,
      currentRoundBet: 0,
      hasActed: false,
      lastAction: null
    }

    let playersList = [humanPlayer1]

    // 如果是2个真人玩家
    if (playerCount === 2) {
      const humanPlayer2 = {
        id: 'player2',
        name: '玩家 2',
        isAI: false,
        chips: startingChips,
        holeCards: [],
        folded: false,
        currentRoundBet: 0,
        hasActed: false,
        lastAction: null
      }
      playersList.push(humanPlayer2)
    }

    // 添加AI玩家
    const aiCount = playerCount === 2 ? 1 : 2
    if (aiCount >= 1) {
      const ai1 = createAIPlayer(`ai${playerCount + 1}`, `AI 玩家 1`, 'easy', startingChips)
      playersList.push(ai1)
    }
    if (aiCount >= 2) {
      const ai2 = createAIPlayer(`ai${playerCount + 2}`, `AI 玩家 2`, 'easy', startingChips)
      playersList.push(ai2)
    }

    setPlayers(playersList)
    setGamePhase(GAME_PHASES.IDLE)
    setCommunityCards([])
    setPot(0)
    setCurrentBet(0)
    setCurrentPlayerIndex(0)
    setWinner(null)
    setGameResult(null)
  }

  const startGame = () => {
    const newDeck = new Deck()
    setDeck(newDeck)

    // 发底牌并重置状态
    const updatedPlayers = players.map(p => ({
      ...p,
      holeCards: newDeck.deal(2),
      folded: false,
      currentRoundBet: 0,
      hasActed: false,
      lastAction: null
    }))

    setCommunityCards([])
    setPot(0)
    setCurrentBet(0)

    // 下盲注
    const smallBlindAmount = GAME_CONFIG.SMALL_BLIND
    const bigBlindAmount = GAME_CONFIG.BIG_BLIND

    updatedPlayers[1].chips -= smallBlindAmount
    updatedPlayers[1].currentRoundBet = smallBlindAmount
    updatedPlayers[2].chips -= bigBlindAmount
    updatedPlayers[2].currentRoundBet = bigBlindAmount

    setPlayers(updatedPlayers)
    setPot(smallBlindAmount + bigBlindAmount)
    setCurrentBet(bigBlindAmount)

    setGamePhase(GAME_PHASES.PRE_FLOP)
    setCurrentPlayerIndex(0) // 玩家先行动
  }

  const handlePlayerAction = ({ type, amount }) => {
    const updatedPlayers = [...players]
    const player = updatedPlayers[currentPlayerIndex]
    let newPot = pot
    let newCurrentBet = currentBet

    switch (type) {
      case ACTIONS.FOLD:
        player.folded = true
        player.lastAction = ACTIONS.FOLD
        break

      case ACTIONS.CHECK:
        player.lastAction = ACTIONS.CHECK
        player.hasActed = true
        break

      case ACTIONS.CALL:
        const callAmount = Math.min(amount, player.chips)
        player.chips -= callAmount
        player.currentRoundBet += callAmount
        player.lastAction = ACTIONS.CALL
        player.hasActed = true
        newPot += callAmount
        break

      case ACTIONS.RAISE:
        const raiseAmount = Math.min(amount, player.chips)
        player.chips -= raiseAmount
        player.currentRoundBet += raiseAmount
        player.lastAction = ACTIONS.RAISE
        player.hasActed = true
        newPot += raiseAmount
        newCurrentBet = player.currentRoundBet
        // 重置其他玩家的 hasActed
        updatedPlayers.forEach((p, i) => {
          if (i !== currentPlayerIndex) p.hasActed = false
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
          updatedPlayers.forEach((p, i) => {
            if (i !== currentPlayerIndex) p.hasActed = false
          })
        }
        break
    }

    setPlayers(updatedPlayers)
    setPot(newPot)
    setCurrentBet(newCurrentBet)

    // 等待状态更新后再调用 nextPlayer
    setTimeout(() => {
      nextPlayer(updatedPlayers, newCurrentBet)
    }, 50)
  }

  const handleAIAction = async (aiPlayer) => {
    console.log('🤖 AI 行动:', aiPlayer.name)
    await delay(1000) // 思考时间

    // 从 ref 中获取最新的玩家数据
    const latestPlayers = playersRef.current
    const playerIndex = latestPlayers.findIndex(p => p.id === aiPlayer.id)
    const latestPlayer = latestPlayers[playerIndex]

    const toCall = currentBet - latestPlayer.currentRoundBet
    console.log('  - toCall:', toCall)
    console.log('  - currentBet:', currentBet)
    console.log('  - aiPlayer.currentRoundBet:', latestPlayer.currentRoundBet)

    const decision = aiDecision(
      latestPlayer,
      latestPlayer.holeCards,
      communityCards,
      pot,
      currentBet,
      toCall,
      latestPlayer.difficulty
    )

    console.log('  - AI 决策:', decision)

    // 直接修改玩家数组
    const updatedPlayers = [...latestPlayers]
    const actingPlayer = updatedPlayers[playerIndex]
    let newPot = pot
    let newCurrentBet = currentBet

    switch (decision.action) {
      case ACTIONS.FOLD:
        actingPlayer.folded = true
        actingPlayer.lastAction = ACTIONS.FOLD
        break

      case ACTIONS.CHECK:
        actingPlayer.lastAction = ACTIONS.CHECK
        actingPlayer.hasActed = true
        break

      case ACTIONS.CALL:
        const callAmount = Math.min(decision.amount, actingPlayer.chips)
        actingPlayer.chips -= callAmount
        actingPlayer.currentRoundBet += callAmount
        actingPlayer.lastAction = ACTIONS.CALL
        actingPlayer.hasActed = true
        newPot += callAmount
        break

      case ACTIONS.RAISE:
        const raiseAmount = Math.min(decision.amount, actingPlayer.chips)
        actingPlayer.chips -= raiseAmount
        actingPlayer.currentRoundBet += raiseAmount
        actingPlayer.lastAction = ACTIONS.RAISE
        actingPlayer.hasActed = true
        newPot += raiseAmount
        newCurrentBet = actingPlayer.currentRoundBet
        updatedPlayers.forEach((p, i) => {
          if (i !== playerIndex) p.hasActed = false
        })
        break

      case ACTIONS.ALL_IN:
        const allInAmount = actingPlayer.chips
        actingPlayer.currentRoundBet += allInAmount
        actingPlayer.chips = 0
        actingPlayer.lastAction = ACTIONS.ALL_IN
        actingPlayer.hasActed = true
        newPot += allInAmount
        if (actingPlayer.currentRoundBet > newCurrentBet) {
          newCurrentBet = actingPlayer.currentRoundBet
          updatedPlayers.forEach((p, i) => {
            if (i !== playerIndex) p.hasActed = false
          })
        }
        break
    }

    setPlayers(updatedPlayers)
    setPot(newPot)
    setCurrentBet(newCurrentBet)

    setTimeout(() => {
      nextPlayer(updatedPlayers, newCurrentBet)
    }, 50)
  }

  const nextPlayer = (currentPlayers, latestCurrentBet) => {
    // 检查是否只剩一个玩家
    const activePlayers = currentPlayers.filter(p => !p.folded)
    if (activePlayers.length === 1) {
      endGame(activePlayers[0])
      return
    }

    // 检查是否所有玩家都已行动且下注相等
    const allActed = activePlayers.every(p => p.hasActed)
    const allBetsEqual = activePlayers.every(p => p.currentRoundBet === latestCurrentBet || p.chips === 0)

    console.log('=== nextPlayer check ===')
    console.log('gamePhase:', gamePhase)
    console.log('allActed:', allActed)
    console.log('allBetsEqual:', allBetsEqual)
    console.log('latestCurrentBet:', latestCurrentBet)

    activePlayers.forEach((p, i) => {
      console.log(`玩家 ${i}: ${p.name}`)
      console.log(`  - hasActed: ${p.hasActed}`)
      console.log(`  - currentRoundBet: ${p.currentRoundBet}`)
      console.log(`  - betEqual: ${p.currentRoundBet === latestCurrentBet}`)
    })

    if (allActed && allBetsEqual) {
      // 进入下一阶段
      console.log('✅ 进入下一阶段:', gamePhase)
      nextPhase()
      return
    }

    // 找下一个未弃牌的玩家
    let nextIndex = (currentPlayerIndex + 1) % currentPlayers.length
    let loopCount = 0
    while (currentPlayers[nextIndex].folded && loopCount < currentPlayers.length) {
      nextIndex = (nextIndex + 1) % currentPlayers.length
      loopCount++
    }

    console.log('next player:', currentPlayers[nextIndex].name)
    console.log('=====================\n')
    setCurrentPlayerIndex(nextIndex)
  }

  const nextPhase = () => {
    const updatedPlayers = players.map(p => ({
      ...p,
      currentRoundBet: 0,
      hasActed: false,
      lastAction: null
    }))

    let newCommunityCards = [...communityCards]

    switch (gamePhase) {
      case GAME_PHASES.PRE_FLOP:
        // 翻牌 - 发3张公共牌
        if (deck) {
          const flop = deck.deal(3)
          newCommunityCards = flop
        }
        setGamePhase(GAME_PHASES.FLOP)
        break

      case GAME_PHASES.FLOP:
        // 转牌 - 发1张
        if (deck) {
          const turn = deck.deal(1)
          newCommunityCards = [...communityCards, ...turn]
        }
        setGamePhase(GAME_PHASES.TURN)
        break

      case GAME_PHASES.TURN:
        // 河牌 - 发1张
        if (deck) {
          const river = deck.deal(1)
          newCommunityCards = [...communityCards, ...river]
        }
        setGamePhase(GAME_PHASES.RIVER)
        break

      case GAME_PHASES.RIVER:
        // 摊牌
        setGamePhase(GAME_PHASES.SHOWDOWN)
        setPlayers(updatedPlayers)
        setCurrentBet(0)
        setCurrentPlayerIndex(0)
        showdown()
        return
    }

    setPlayers(updatedPlayers)
    setCurrentBet(0)
    setCurrentPlayerIndex(0)
    setCommunityCards(newCommunityCards)
  }

  const showdown = () => {
    const winners = determineWinner(players, communityCards)

    if (Array.isArray(winners)) {
      // 平局，分底池
      const share = Math.floor(pot / winners.length)
      const updated = players.map(p => {
        if (winners.includes(p)) {
          p.chips += share
        }
        return p
      })
      setPlayers(updated)
      setWinner(winners)
      saveGameResult(winners, 'tie', share)
    } else {
      // 单个获胜者
      const updated = players.map(p => {
        if (p.id === winners.id) {
          p.chips += pot
        }
        return p
      })
      setPlayers(updated)
      setWinner([winners])
      saveGameResult([winners], winners.id === 'player' ? 'win' : 'lose', pot)
    }
  }

  const endGame = (winner) => {
    const updated = players.map(p => {
      if (p.id === winner.id) {
        p.chips += pot
      }
      return p
    })
    setPlayers(updated)
    setWinner([winner])
    setGamePhase(GAME_PHASES.SHOWDOWN)
    saveGameResult([winner], winner.id === 'player' ? 'win' : 'lose', pot)
  }

  const saveGameResult = (winners, result, amount) => {
    const player = players.find(p => p.id === 'player')
    const chipChange = result === 'win' ? amount : result === 'lose' ? -amount : 0

    let handRank = null
    if (player && !player.folded) {
      const evaluation = evaluateHand(player.holeCards, communityCards)
      handRank = evaluation.name
    }

    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      result,
      finalChips: player?.chips || 0,
      chipChange,
      handRank,
      winners: winners.map(w => w.name)
    }

    saveGameRecord(record)
    setGameResult(record)
  }

  const currentPlayer = players[currentPlayerIndex]
  const humanPlayers = players.filter(p => !p.isAI)

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 游戏设置界面 */}
      {showSetup ? (
        <GameSetup onStart={handleGameSetup} />
      ) : (
        <React.Fragment>
          {/* 顶部操作栏 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">德州扑克</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                📜 记录
              </button>
              {gamePhase === GAME_PHASES.IDLE || gamePhase === GAME_PHASES.SHOWDOWN ? (
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {gamePhase === GAME_PHASES.SHOWDOWN ? '再来一局' : '开始游戏'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    initGame()
                    setShowSetup(true)
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  结束游戏
                </button>
              )}
            </div>
          </div>

      {/* 牌桌 */}
      <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-8 shadow-2xl border-8 border-amber-900">
        {/* AI 玩家区域 */}
        <div className="flex justify-around mb-8">
          {players.filter(p => p.isAI).map((player, index) => (
            <div key={player.id} className="w-64">
              <PlayerArea
                player={player}
                isCurrent={currentPlayer?.id === player.id}
                showCards={gamePhase === GAME_PHASES.SHOWDOWN}
                position="top"
              />
            </div>
          ))}
        </div>

        {/* 中间区域：底池和公共牌 */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <Pot amount={pot} playerCount={players.filter(p => !p.folded).length} />

          {/* 公共牌 */}
          <div className="flex gap-3 bg-green-950/50 rounded-xl p-4">
            {[0, 1, 2, 3, 4].map(index => (
              <Card
                key={index}
                card={communityCards[index]}
                hidden={!communityCards[index]}
                size="lg"
              />
            ))}
          </div>

          {/* 游戏阶段显示 */}
          {gamePhase !== GAME_PHASES.IDLE && (
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
              <span className="text-white font-medium">
                {getPhaseText(gamePhase)}
              </span>
            </div>
          )}

          {/* 获胜者显示 */}
          {winner && gamePhase === GAME_PHASES.SHOWDOWN && (
            <div className="bg-yellow-400 px-6 py-3 rounded-xl shadow-lg">
              <span className="text-gray-900 font-bold text-lg">
                {winner.length > 1
                  ? `平局！${winner.map(w => w.name).join(' 和 ')}`
                  : `${winner[0].name} 获胜！`}
              </span>
            </div>
          )}
        </div>

        {/* 玩家区域 */}
        <div className="flex flex-col items-center gap-6">
          {/* 真人玩家区域 */}
          {humanPlayers.map((player, index) => {
            const isCurrentPlayerTurn = currentPlayer?.id === player.id
            const playerToCall = isCurrentPlayerTurn ? (currentBet - player.currentRoundBet) : 0
            const playerCanCheck = playerToCall === 0

            // 只有当前行动的真人玩家能看到自己的底牌，摊牌阶段所有人都能看到
            const shouldShowCards = isCurrentPlayerTurn || gamePhase === GAME_PHASES.SHOWDOWN

            return (
              <div key={player.id} className="w-full max-w-2xl">
                <PlayerArea
                  player={player}
                  isCurrent={isCurrentPlayerTurn}
                  showCards={shouldShowCards}
                  position="bottom"
                />

                {/* 游戏控制 - 只显示给当前行动的真人玩家 */}
                {isCurrentPlayerTurn && !player.folded && (
                  <div className="w-full max-w-md mt-4">
                    <GameControls
                      onAction={handlePlayerAction}
                      currentBet={currentBet}
                      toCall={playerToCall}
                      playerChips={player.chips}
                      minRaise={GAME_CONFIG.BIG_BLIND}
                      isPlayerTurn={isCurrentPlayerTurn}
                      canCheck={playerCanCheck}
                      phase={gamePhase}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 游戏记录弹窗 */}
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </React.Fragment>
      )}
    </div>
  )
}

function getPhaseText(phase) {
  const phaseMap = {
    'idle': '准备开始',
    'pre-flop': '翻牌前',
    'flop': '翻牌',
    'turn': '转牌',
    'river': '河牌',
    'showdown': '摊牌'
  }
  return phaseMap[phase] || phase
}
