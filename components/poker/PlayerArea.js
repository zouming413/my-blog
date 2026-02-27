import Card from './Card'
import { formatChips } from '../../lib/poker/utils'

export default function PlayerArea({ player, isCurrent = false, showCards = false, position = 'bottom' }) {
  if (!player) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-100/50">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    )
  }

  const { id, name, chips, holeCards, folded, currentRoundBet, lastAction, isAI } = player

  if (folded) {
    return (
      <div className={`
        flex flex-col items-center gap-2 p-4
        rounded-xl border-2 border-dashed border-gray-300
        bg-gray-100/50
        ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}>
        <div className="text-sm font-medium text-gray-600">{name}</div>
        <div className="text-xs text-gray-500">已弃牌</div>
      </div>
    )
  }

  const positionClass = position === 'top' ? 'flex-col' : 'flex-col'

  return (
    <div className={`
      flex ${positionClass} items-center gap-3 p-4
      rounded-xl border-2 bg-white shadow-lg
      ${isCurrent ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
      transition-all duration-200
    `}>
      {/* 玩家信息 */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{name}</span>
            {isAI && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">AI</span>
            )}
            {isCurrent && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">行动中</span>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            筹码: <span className="font-bold text-gray-900">{formatChips(chips)}</span>
          </div>
          {currentRoundBet > 0 && (
            <div className="text-xs text-amber-600 mt-0.5">
              本轮下注: {formatChips(currentRoundBet)}
            </div>
          )}
          {lastAction && (
            <div className="text-xs text-blue-600 mt-0.5">
              {getActionText(lastAction)}
            </div>
          )}
        </div>
      </div>

      {/* 手牌 */}
      <div className="flex gap-2 justify-center">
        {holeCards.length === 0 ? (
          <>
            <Card hidden />
            <Card hidden />
          </>
        ) : (
          holeCards.map((card, index) => (
            <Card
              key={`${id}-${index}`}
              card={showCards ? card : null}
              hidden={!showCards}
              size="md"
            />
          ))
        )}
      </div>
    </div>
  )
}

function getActionText(action) {
  const actionMap = {
    'fold': '弃牌',
    'check': '过牌',
    'call': '跟注',
    'raise': '加注',
    'all-in': '全押'
  }
  return actionMap[action] || action
}
