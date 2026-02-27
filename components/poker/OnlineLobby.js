'use client'

import { useState } from 'react'
import { io } from 'socket.io-client'

export default function OnlineLobby({ onJoinRoom }) {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [mode, setMode] = useState('create') // 'create' or 'join'
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
      socket.emit('create-room', { playerCount, startingChips })
    })

    socket.on('room-created', ({ roomId: newRoomId, playerId, players }) => {
      onJoinRoom({
        socket,
        roomId: newRoomId,
        playerId,
        playerName,
        players
      })
    })

    socket.on('error', ({ message }) => {
      setError(message)
    })

    socket.on('connect_error', (err) => {
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
      onJoinRoom({
        socket,
        roomId,
        playerId: player.id,
        playerName,
        players
      })
    })

    socket.on('error', ({ message }) => {
      setError(message)
    })

    socket.on('connect_error', (err) => {
      setError('连接服务器失败，请确保服务器正在运行')
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card rounded-2xl p-8 bg-white shadow-lg border-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">线上德州扑克</h2>

        {/* 玩家名字输入 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            你的名字
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="输入你的名字"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>

        {/* 模式选择 */}
        <div className="mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                mode === 'create'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <div className="text-xl mb-1">🎮</div>
              <div className="font-semibold text-gray-900">创建房间</div>
            </button>

            <button
              onClick={() => setMode('join')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                mode === 'join'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <div className="text-xl mb-1">🚪</div>
              <div className="font-semibold text-gray-900">加入房间</div>
            </button>
          </div>

          {mode === 'create' ? (
            // 创建房间选项
            <>
              {/* 玩家数量 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  玩家数量
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[2, 3, 4].map(count => (
                    <button
                      key={count}
                      onClick={() => setPlayerCount(count)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        playerCount === count
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{count}人</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 初始筹码 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  初始筹码
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[1000, 2000, 5000, 10000].map(chips => (
                    <button
                      key={chips}
                      onClick={() => setStartingChips(chips)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        startingChips === chips
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{chips >= 1000 ? chips/1000 + 'K' : chips}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                创建房间
              </button>
            </>
          ) : (
            // 加入房间选项
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房间号
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="输入4位房间号"
                  maxLength={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <button
                onClick={handleJoinRoom}
                className="w-full px-6 py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 transition-colors"
              >
                加入房间
              </button>
            </>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* 说明 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            💡 提示：创建房间后，将房间号分享给朋友即可开始游戏
          </p>
        </div>
      </div>
    </div>
  )
}
