import { useEffect, useState } from 'react'
import { formatTime } from '../../lib/poker/utils'

export default function HistoryModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (isOpen) {
      const savedHistory = localStorage.getItem('poker_game_history')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">游戏记录</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">🎴</div>
              <p>还没有游戏记录</p>
              <p className="text-sm mt-2">开始一局游戏来记录你的成绩吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl border-2 ${
                    record.result === 'win'
                      ? 'bg-green-50 border-green-200'
                      : record.result === 'lose'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {record.result === 'win' ? '🎉 胜利' : record.result === 'lose' ? '😢 失败' : '🤝 平局'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatTime(record.timestamp)}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      record.chipChange > 0 ? 'text-green-600' : record.chipChange < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {record.chipChange > 0 ? '+' : ''}{record.chipChange}
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <div>最终筹码: <span className="font-semibold">{record.finalChips}</span></div>
                    {record.handRank && (
                      <div>牌型: <span className="font-semibold">{record.handRank}</span></div>
                    )}
                    {record.winners && record.winners.length > 0 && (
                      <div>获胜者: <span className="font-semibold">{record.winners.join(', ')}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            共 {history.length} 条记录
          </div>
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('确定要清空所有游戏记录吗？')) {
                  localStorage.removeItem('poker_game_history')
                  setHistory([])
                }
              }}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              清空记录
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
