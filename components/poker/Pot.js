import { formatChips } from '../../lib/poker/utils'
import { CHIP_DENOMINATIONS } from '../../lib/poker/constants'

export default function Pot({ amount, playerCount = 0 }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl px-6 py-4 shadow-lg border-2 border-amber-200">
        <div className="text-center">
          <div className="text-sm text-amber-700 font-medium mb-1">底池</div>
          <div className="text-3xl font-bold text-amber-900">{formatChips(amount)}</div>
          {playerCount > 0 && (
            <div className="text-xs text-amber-600 mt-1">
              {playerCount} 名玩家
            </div>
          )}
        </div>
      </div>

      {/* 装饰性筹码堆 */}
      <div className="flex gap-1 opacity-50">
        {CHIP_DENOMINATIONS.slice(0, 3).map(denom => (
          <div
            key={denom.value}
            className={`w-4 h-4 rounded-full ${denom.color} border-2 border-white/30`}
          />
        ))}
      </div>
    </div>
  )
}
