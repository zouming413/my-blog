import { useState } from 'react'
import { ACTIONS } from '../../lib/poker/constants'
import { formatChips } from '../../lib/poker/utils'

export default function GameControls({
  onAction,
  currentBet,
  toCall,
  playerChips,
  minRaise,
  isPlayerTurn,
  canCheck,
  phase
}) {
  const [showRaiseOptions, setShowRaiseOptions] = useState(false)

  if (!isPlayerTurn || phase === 'showdown') {
    return (
      <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500">
        <div className="text-sm">
          {phase === 'showdown' ? '摊牌阶段' : '等待其他玩家...'}
        </div>
      </div>
    )
  }

  const handleFold = () => {
    setShowRaiseOptions(false)
    onAction({ type: ACTIONS.FOLD, amount: 0 })
  }

  const handleCheck = () => {
    setShowRaiseOptions(false)
    onAction({ type: ACTIONS.CHECK, amount: 0 })
  }

  const handleCall = () => {
    setShowRaiseOptions(false)
    onAction({ type: ACTIONS.CALL, amount: toCall })
  }

  const handleRaise = (amount) => {
    setShowRaiseOptions(false)
    onAction({ type: ACTIONS.RAISE, amount })
  }

  const handleAllIn = () => {
    setShowRaiseOptions(false)
    onAction({ type: ACTIONS.ALL_IN, amount: playerChips })
  }

  // 计算加注选项
  const minTotalBet = toCall + minRaise
  const raiseOptions = [
    { label: '最小加注', value: minTotalBet, desc: formatChips(minTotalBet) },
    { label: '2倍', value: Math.min(toCall + minRaise * 2, playerChips), desc: formatChips(Math.min(toCall + minRaise * 2, playerChips)) },
    { label: '3倍', value: Math.min(toCall + minRaise * 3, playerChips), desc: formatChips(Math.min(toCall + minRaise * 3, playerChips)) },
    { label: '半底池', value: Math.min(Math.floor((currentBet * 2 + playerChips) / 2), playerChips), desc: formatChips(Math.floor((currentBet * 2 + playerChips) / 2)) },
    { label: '全底池', value: Math.min(currentBet * 2 + playerChips, playerChips), desc: formatChips(currentBet * 2 + playerChips) },
  ]

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
      {showRaiseOptions ? (
        // 加注金额选择界面
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">选择加注金额</h3>
            <button
              onClick={() => setShowRaiseOptions(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {raiseOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleRaise(option.value)}
                disabled={option.value > playerChips || option.value <= toCall}
                className="px-3 py-3 bg-amber-50 border-2 border-amber-300 rounded-lg hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
              >
                <div className="text-xs text-amber-700">{option.label}</div>
                <div className="text-lg font-bold text-amber-900">{option.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRaiseOptions(false)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
        </div>
      ) : (
        // 正常控制按钮
        <div className="grid grid-cols-2 gap-2">
          {/* 弃牌按钮 */}
          <button
            onClick={handleFold}
            className="px-4 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors"
          >
            弃牌
          </button>

          {/* 过牌/跟注按钮 */}
          {canCheck ? (
            <button
              onClick={handleCheck}
              className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              过牌
            </button>
          ) : (
            <button
              onClick={handleCall}
              disabled={toCall > playerChips}
              className="px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              跟注 {toCall > 0 && <span className="text-sm">({formatChips(toCall)})</span>}
            </button>
          )}

          {/* 加注按钮 */}
          <button
            onClick={() => setShowRaiseOptions(true)}
            disabled={playerChips <= toCall}
            className="px-4 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed col-span-2"
          >
            加注
          </button>

          {/* 全押按钮 */}
          <button
            onClick={handleAllIn}
            className="px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors col-span-2"
          >
            全押 ({formatChips(playerChips)})
          </button>
        </div>
      )}

      {/* 信息显示 */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 flex justify-between">
        <span>当前下注: {formatChips(currentBet)}</span>
        <span>你的筹码: {formatChips(playerChips)}</span>
      </div>
    </div>
  )
}
