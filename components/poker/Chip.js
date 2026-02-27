import { formatChips } from '../../lib/poker/utils'

export default function Chip({ value, count = 1, size = 'md' }) {
  const chipConfig = {
    10: { color: 'bg-blue-500', borderColor: 'border-blue-700', textColor: 'text-white' },
    50: { color: 'bg-purple-500', borderColor: 'border-purple-700', textColor: 'text-white' },
    100: { color: 'bg-emerald-500', borderColor: 'border-emerald-700', textColor: 'text-white' },
    500: { color: 'bg-amber-500', borderColor: 'border-amber-700', textColor: 'text-white' },
    1000: { color: 'bg-gray-800', borderColor: 'border-gray-950', textColor: 'text-white' }
  }

  const config = chipConfig[value] || chipConfig[10]

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-16 h-16 text-lg' : 'w-12 h-12 text-sm'

  return (
    <div className={`
      relative rounded-full ${config.color} ${config.borderColor} border-4
      ${sizeClass}
      flex items-center justify-center
      font-bold ${config.textColor}
      shadow-lg
      cursor-pointer
      transition-transform duration-150
      hover:scale-110
      active:scale-95
    `}>
      <div className="flex items-center gap-1">
        {count > 1 && <span className="text-xs opacity-75">×</span>}
        <span>{formatChips(value)}</span>
      </div>

      {/* 芯片边缘装饰 */}
      <div className={`absolute inset-0 rounded-full border-2 border-white/20`}></div>
      <div className={`absolute inset-1 rounded-full border border-white/30`}></div>
    </div>
  )
}
