'use client'

import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import PokerTable from '../../components/poker/PokerTable'
import OnlinePokerTable from '../../components/poker/OnlinePokerTable'

export default function PokerPage() {
  const [mode, setMode] = useState(null) // null, 'local', 'online'
  const [onlineGame, setOnlineGame] = useState(null)
  const [gamePhase, setGamePhase] = useState('lobby') // 'lobby', 'playing', 'gameover'

  // 联机游戏状态
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [lobbyMode, setLobbyMode] = useState('create') // 'create' or 'join'
  const [playerCount, setPlayerCount] = useState(2)
  const [startingChips, setStartingChips] = useState(1000)
  const [error, setError] = useState('')

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('请输入你的名字')
      return
    }

    const socket = io()

    socket.on('connect', () => {
      socket.emit('create-room', { playerName, playerCount, startingChips })
    })

    socket.on('room-created', ({ roomId: newRoomId, playerId, players }) => {
      setOnlineGame({
        socket,
        roomId: newRoomId,
        playerId,
        playerName,
        players
      })
      setGamePhase('playing')
      setError('')
    })

    socket.on('error', ({ message }) => {
      setError(message)
    })

    socket.on('connect_error', () => {
      setError('连接服务器失败，请确保服务器正在运行')
    })
  }

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('请输入你的名字')
      return
    }

    if (!roomId.trim()) {
      setError('请输入房间号')
      return
    }

    const socket = io()

    socket.on('connect', () => {
      socket.emit('join-room', { roomId, playerName })
    })

    socket.on('player-joined', ({ player, players }) => {
      setOnlineGame({
        socket,
        roomId,
        playerId: player.id,
        playerName,
        players
      })
      setGamePhase('playing')
      setError('')
    })

    socket.on('error', ({ message }) => {
      setError(message)
    })

    socket.on('connect_error', () => {
      setError('连接服务器失败，请确保服务器正在运行')
    })
  }

  const handleBackToLobby = () => {
    setGamePhase('lobby')
    setOnlineGame(null)
    setPlayerName('')
    setRoomId('')
    setError('')
  }

  const handleExitGame = () => {
    if (onlineGame?.socket) {
      onlineGame.socket.disconnect()
    }
    setMode(null)
    setGamePhase('lobby')
    setOnlineGame(null)
    setPlayerName('')
    setRoomId('')
    setError('')
  }

  // 本地游戏
  if (mode === 'local') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => setMode(null)}
            className="mb-6 px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <PokerTable />
        </div>
      </div>
    )
  }

  // 联机游戏进行中
  if (mode === 'online' && gamePhase === 'playing' && onlineGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <OnlinePokerTable
          socket={onlineGame.socket}
          roomId={onlineGame.roomId}
          playerId={onlineGame.playerId}
          playerName={onlineGame.playerName}
          initialPlayers={onlineGame.players}
          onExit={handleExitGame}
        />
      </div>
    )
  }

  // 主界面
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            🃏 德州扑克
          </h1>
          <p className="text-xl text-purple-200">Texas Hold'em Poker</p>
        </div>

        {/* 模式选择卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 本地游戏 */}
          <button
            onClick={() => setMode('local')}
            className="group relative p-8 bg-white/5 backdrop-blur rounded-3xl border-2 border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
          >
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
              🎮
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">本地游戏</h3>
            <p className="text-purple-200">
              与AI对手对战，练习牌技
            </p>
            <div className="mt-4 flex items-center text-purple-300 text-sm">
              <span>立即开始</span>
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* 线上联机 */}
          <button
            onClick={() => setMode('online')}
            className="group relative p-8 bg-white/5 backdrop-blur rounded-3xl border-2 border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
          >
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
              🌐
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">线上联机</h3>
            <p className="text-purple-200">
              创建或加入房间，与朋友在线对战
            </p>
            <div className="mt-4 flex items-center text-purple-300 text-sm">
              <span>创建房间</span>
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* 联机游戏设置面板 */}
        {mode === 'online' && gamePhase === 'lobby' && (
          <div className="animate-fadeIn">
            {/* 返回按钮 */}
            <button
              onClick={() => setMode(null)}
              className="mb-6 px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>返回</span>
            </button>

            {/* 大厅卡片 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">线上对战</h2>

              {/* 玩家名字 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  你的名字
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="输入你的名字"
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none text-white placeholder-purple-300"
                />
              </div>

              {/* 创建/加入切换 */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setLobbyMode('create')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    lobbyMode === 'create'
                      ? 'border-blue-400 bg-blue-500/20 text-white'
                      : 'border-white/20 hover:border-white/30 bg-white/5 text-purple-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🎮</div>
                  <div className="font-semibold">创建房间</div>
                </button>

                <button
                  onClick={() => setLobbyMode('join')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    lobbyMode === 'join'
                      ? 'border-green-400 bg-green-500/20 text-white'
                      : 'border-white/20 hover:border-white/30 bg-white/5 text-purple-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🚪</div>
                  <div className="font-semibold">加入房间</div>
                </button>
              </div>

              {lobbyMode === 'create' ? (
                // 创建房间选项
                <>
                  {/* 玩家数量 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      玩家数量
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[2, 3, 4].map(count => (
                        <button
                          key={count}
                          onClick={() => setPlayerCount(count)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            playerCount === count
                              ? 'border-purple-400 bg-purple-500/20 text-white'
                              : 'border-white/20 hover:border-white/30 bg-white/5 text-purple-200'
                          }`}
                        >
                          <div className="font-bold text-lg">{count}人</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 初始筹码 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      初始筹码
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1000, 2000, 5000, 10000].map(chips => (
                        <button
                          key={chips}
                          onClick={() => setStartingChips(chips)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            startingChips === chips
                              ? 'border-amber-400 bg-amber-500/20 text-white'
                              : 'border-white/20 hover:border-white/30 bg-white/5 text-purple-200'
                          }`}
                        >
                          <div className="font-bold">{chips >= 1000 ? chips/1000 + 'K' : chips}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    创建房间
                  </button>
                </>
              ) : (
                // 加入房间选项
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      房间号
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="输入4位房间号"
                      maxLength={4}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none text-center text-3xl font-mono tracking-widest text-white placeholder-purple-300"
                    />
                  </div>

                  <button
                    onClick={handleJoinRoom}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    加入房间
                  </button>
                </>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border-2 border-red-400/50 rounded-xl">
                  <p className="text-red-200 text-center">{error}</p>
                </div>
              )}

              {/* 说明 */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-purple-200 text-center">
                  💡 创建房间后，将房间号分享给朋友即可开始游戏
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
