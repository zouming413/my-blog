'use client'

import { useState } from 'react'

export default function GameSetup({ onStart }) {
  const [playerCount, setPlayerCount] = useState(1) // 1个真人 或 2个真人
  const [startingChips, setStartingChips] = useState(1000)
  const [customChips, setCustomChips] = useState('')

  const handleStart = () => {
    const chips = customChips ? parseInt(customChips) : startingChips
    if (isNaN(chips) || chips < 100) {
      alert('筹码数量必须至少为100')
      return
    }
    onStart({ playerCount, startingChips: chips })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card rounded-2xl p-8 bg-white shadow-lg border-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">游戏设置</h2>

        {/* 选择玩家数量 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            玩家数量
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPlayerCount(1)}
              className={`p-6 rounded-xl border-2 transition-all ${
                playerCount === 1
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold text-gray-900">1个真人 + 2个AI</div>
              <div className="text-sm text-gray-600 mt-1">单人对战AI</div>
            </button>

            <button
              onClick={() => setPlayerCount(2)}
              className={`p-6 rounded-xl border-2 transition-all ${
                playerCount === 2
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">👤👤</div>
              <div className="font-semibold text-gray-900">2个真人 + 1个AI</div>
              <div className="text-sm text-gray-600 mt-1">双人对战</div>
            </button>
          </div>
        </div>

        {/* 选择初始筹码 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            初始筹码
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { value: 500, label: '500' },
              { value: 1000, label: '1K' },
              { value: 2000, label: '2K' },
              { value: 5000, label: '5K' },
              { value: 10000, label: '10K' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setStartingChips(option.value)
                  setCustomChips('')
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  startingChips === option.value && !customChips
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <div className="font-bold text-gray-900">{option.label}</div>
              </button>
            ))}
          </div>

          {/* 自定义筹码 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              或输入自定义金额（最少100）
            </label>
            <input
              type="number"
              value={customChips}
              onChange={(e) => {
                setCustomChips(e.target.value)
                if (e.target.value) setStartingChips(parseInt(e.target.value))
              }}
              placeholder="输入筹码数量"
              min="100"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </div>

        {/* 开始游戏按钮 */}
        <button
          onClick={handleStart}
          className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          开始游戏
        </button>
      </div>
    </div>
  )
}
