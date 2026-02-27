'use client'

import { useState, useEffect } from 'react'
import { ACTIONS } from '../../lib/poker/constants'
import { formatChips } from '../../lib/poker/utils'
import Card from './Card'
import PlayerArea from './PlayerArea'
import Pot from './Pot'
import GameControls from './GameControls'

export default function OnlinePokerTable({
  socket,
  roomId,
  playerId,
  playerName,
  initialPlayers,
  onExit
}) {
  const [gamePhase, setGamePhase] = useState('idle')
  const [players, setPlayers] = useState(initialPlayers)
  const [communityCards, setCommunityCards] = useState([])
  const [pot, setPot] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [winner, setWinner] = useState(null)
  const [yourCards, setYourCards] = useState([])
  const [revealedCards, setRevealedCards] = useState({}) // 摊牌阶段显示的牌

  useEffect(() => {
    // 监听新玩家加入
    socket.on('player-joined', ({ player, players: newPlayers }) => {
      setPlayers(newPlayers)
    })

    // 监听玩家准备变化
    socket.on('player-ready-changed', ({ playerId, isReady }) => {
      setPlayers(prev => prev.map(p =>
        p.id === playerId ? { ...p, isReady } : p
      ))
    })

    // 监听房间满员
    socket.on('room-full', ({ players: roomPlayers }) => {
      setPlayers(roomPlayers)
    })

    // 监听游戏开始
    socket.on('game-started', ({
      gamePhase,
      communityCards,
      pot,
      currentBet,
      currentPlayerIndex,
      players: gamePlayers,
      yourCards: cards
    }) => {
      setGamePhase(gamePhase)
      setCommunityCards(communityCards)
      setPot(pot)
      setCurrentBet(currentBet)
      setCurrentPlayerIndex(currentPlayerIndex)
      setPlayers(gamePlayers)
      setYourCards(cards)
      setWinner(null)
      setRevealedCards({})
    })

    // 监听当前玩家变化
    socket.on('current-player-changed', ({ playerIndex }) => {
      setCurrentPlayerIndex(playerIndex)
    })

    // 监听玩家行动
    socket.on('player-acted', ({
      playerId,
      action,
      pot: newPot,
      currentBet: newBet,
      players: updatedPlayers
    }) => {
      setPlayers(updatedPlayers)
      setPot(newPot)
      setCurrentBet(newBet)
    })

    // 监听阶段变化
    socket.on('phase-changed', ({
      gamePhase: newPhase,
      communityCards: newCards,
      pot: newPot,
      currentBet: newBet,
      currentPlayerIndex: newIndex,
      players: updatedPlayers
    }) => {
      setGamePhase(newPhase)
      setCommunityCards(newCards)
      setPot(newPot)
      setCurrentBet(newBet)
      setCurrentPlayerIndex(newIndex)
      setPlayers(updatedPlayers)
    })

    // 监听摊牌
    socket.on('show-cards', ({ playerId, cards }) => {
      setRevealedCards(prev => ({ ...prev, [playerId]: cards }))
    })

    // 监听游戏结束
    socket.on('game-ended', ({ winner: winners, players: finalPlayers }) => {
      setPlayers(finalPlayers)
      setWinner(winners)
      setGamePhase('showdown')
    })

    // 监听玩家离开
    socket.on('player-left', ({ socketId }) => {
      setPlayers(prev => prev.filter(p => p.socketId !== socketId))
    })

    return () => {
      socket.off('player-joined')
      socket.off('player-ready-changed')
      socket.off('room-full')
      socket.off('game-started')
      socket.off('current-player-changed')
      socket.off('player-acted')
      socket.off('phase-changed')
      socket.off('show-cards')
      socket.off('game-ended')
      socket.off('player-left')
    }
  }, [socket])

  const handleReady = () => {
    socket.emit('player-ready')
  }

  const handlePlayerAction = ({ type, amount }) => {
    socket.emit('player-action', { type, amount })
  }

  const currentPlayer = players[currentPlayerIndex]
  const you = players.find(p => p.id === playerId)
  const isYourTurn = currentPlayer?.id === playerId
  const toCall = isYourTurn ? (currentBet - (you?.currentRoundBet || 0)) : 0
  const canCheck = toCall === 0

  // 获取玩家应该看到的牌
  const getPlayerCards = (player) => {
    if (player.id === playerId) {
      // 自己的牌永远可以看到
      return yourCards
    } else if (revealedCards[player.id]) {
      // 摊牌阶段显示的牌
      return revealedCards[player.id]
    } else if (gamePhase === 'showdown' && !player.folded) {
      // 摊牌阶段，但还没收到 show-cards 事件
      return revealedCards[player.id] || []
    }
    return []
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* 顶部信息栏 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">德州扑克</h1>
          <p className="text-purple-200 text-sm mt-1">Texas Hold'em Poker</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="px-6 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl">
            <span className="text-purple-200 text-sm">房间号: </span>
            <span className="text-white font-bold text-2xl ml-2">{roomId}</span>
          </div>
          <button
            onClick={onExit || (() => window.location.reload())}
            className="px-6 py-3 bg-red-500/20 border border-red-400/50 text-red-200 rounded-xl hover:bg-red-500/30 transition-all font-medium"
          >
            退出房间
          </button>
        </div>
      </div>

      {/* 等待玩家准备 */}
      {gamePhase === 'idle' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">等待玩家准备</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  player.isReady
                    ? 'border-green-400 bg-green-500/20'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="font-semibold text-white">{player.name}</div>
                <div className="text-sm text-purple-200 mt-1">
                  {player.isReady ? '✅ 已准备' : '⏳ 等待中'}
                </div>
              </div>
            ))}
          </div>

          {you && !you.isReady && (
            <div className="text-center">
              <button
                onClick={handleReady}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                准备开始
              </button>
            </div>
          )}
        </div>
      )}

      {/* 牌桌 */}
      <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-8 shadow-2xl border-8 border-amber-900">
        {/* 其他玩家区域 */}
        <div className="flex justify-around mb-8">
          {players.filter(p => p.id !== playerId).map((player) => (
            <div key={player.id} className="w-64">
              <PlayerArea
                player={{
                  ...player,
                  holeCards: getPlayerCards(player)
                }}
                isCurrent={currentPlayer?.id === player.id}
                showCards={getPlayerCards(player).length > 0}
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
          {gamePhase !== 'idle' && (
            <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl border border-white/20">
              <span className="text-white font-medium text-lg">
                {getPhaseText(gamePhase)}
              </span>
            </div>
          )}

          {/* 获胜者显示 */}
          {winner && gamePhase === 'showdown' && (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-4 rounded-xl shadow-lg">
              <span className="text-gray-900 font-bold text-lg">
                🎉 {winner.length > 1
                  ? `平局！${winner.map(w => w.name).join(' 和 ')}`
                  : `${winner[0].name} 获胜！`}
              </span>
            </div>
          )}
        </div>

        {/* 你的区域 */}
        {you && (
          <div className="flex flex-col items-center gap-4">
            <PlayerArea
              player={{
                ...you,
                holeCards: yourCards
              }}
              isCurrent={isYourTurn}
              showCards={true}
              position="bottom"
            />

            {/* 游戏控制 */}
            {you && !you.folded && gamePhase !== 'idle' && gamePhase !== 'showdown' && (
              <div className="w-full max-w-md">
                <GameControls
                  onAction={handlePlayerAction}
                  currentBet={currentBet}
                  toCall={toCall}
                  playerChips={you.chips}
                  minRaise={20}
                  isPlayerTurn={isYourTurn}
                  canCheck={canCheck}
                  phase={gamePhase}
                />
              </div>
            )}

            {/* 再来一局 */}
            {gamePhase === 'showdown' && (
              <button
                onClick={handleReady}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                🔄 再来一局
              </button>
            )}
          </div>
        )}
      </div>
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
