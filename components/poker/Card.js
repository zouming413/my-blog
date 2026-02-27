import { getCardColor } from '../../lib/poker/utils'

export default function Card({ card, hidden = false, size = 'md' }) {
  if (hidden) {
    return (
      <div className={`
        relative rounded-lg shadow-md
        ${size === 'sm' ? 'w-10 h-14' : size === 'lg' ? 'w-20 h-28' : 'w-14 h-20'}
        bg-gradient-to-br from-blue-800 to-blue-900
        border-2 border-blue-950
        flex items-center justify-center
      `}>
        <div className="text-white opacity-50 text-2xl">🂠</div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className={`
        rounded-lg border-2 border-dashed border-gray-300
        ${size === 'sm' ? 'w-10 h-14' : size === 'lg' ? 'w-20 h-28' : 'w-14 h-20'}
        bg-gray-100
      `}></div>
    )
  }

  const colorClass = getCardColor(card.suit)

  return (
    <div className={`
      relative bg-white rounded-lg shadow-md
      ${size === 'sm' ? 'w-10 h-14 text-xs' : size === 'lg' ? 'w-20 h-28 text-2xl' : 'w-14 h-20 text-sm'}
      border border-gray-300
      flex flex-col items-center justify-center
      transition-transform duration-200
      hover:scale-105
    `}>
      {/* 左上角 */}
      <div className={`absolute top-1 left-1 ${colorClass} font-bold leading-none`}>
        <div>{card.rank}</div>
        <div className="text-lg">{card.suit.symbol}</div>
      </div>

      {/* 中间大花色 */}
      <div className={`${colorClass} text-3xl md:text-4xl`}>
        {card.suit.symbol}
      </div>

      {/* 右下角（旋转180度） */}
      <div className={`absolute bottom-1 right-1 ${colorClass} font-bold leading-none transform rotate-180`}>
        <div>{card.rank}</div>
        <div className="text-lg">{card.suit.symbol}</div>
      </div>
    </div>
  )
}
