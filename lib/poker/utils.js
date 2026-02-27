// 格式化筹码显示
export function formatChips(amount) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toString()
}

// 创建一副牌
export function createDeck() {
  const { SUITS, RANKS } = require('./constants')
  const deck = []

  Object.values(SUITS).forEach(suit => {
    RANKS.forEach((rank, index) => {
      deck.push({
        suit,
        rank,
        value: index + 2, // 2=2, ..., A=14
        id: `${suit.name}-${rank}`
      })
    })
  })

  return deck
}

// 洗牌（Fisher-Yates 算法）
export function shuffleDeck(deck) {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 发牌
export function dealCards(deck, count) {
  return deck.splice(0, count)
}

// 延迟函数（用于动画）
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 保存到本地存储
export function saveToLocalStorage(key, data) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }
}

// 从本地存储读取
export function loadFromLocalStorage(key, defaultValue = null) {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return defaultValue
    }
  }
  return defaultValue
}

// 生成唯一ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 计算当前时间
export function getCurrentTime() {
  return new Date().toISOString()
}

// 格式化时间显示
export function formatTime(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 验证牌型
export function isValidCard(card) {
  return card && card.suit && card.rank && card.value
}

// 比较两个牌的大小
export function compareCards(card1, card2) {
  return card1.value - card2.value
}

// 排序手牌（按点数从大到小）
export function sortCards(cards) {
  return [...cards].sort((a, b) => b.value - a.value)
}

// 获取牌的颜色样式
export function getCardColor(suit) {
  return suit.color === 'red' ? 'text-red-600' : 'text-gray-900'
}

// 检查是否所有玩家都已行动
export function hasAllPlayersActed(players) {
  return players.every(p => p.hasActed || p.folded)
}

// 计算底池总额
export function calculateTotalPot(players) {
  return players.reduce((total, player) => total + player.currentRoundBet, 0)
}

// 检查游戏是否结束
export function isGameOver(players) {
  const activePlayers = players.filter(p => !p.folded)
  return activePlayers.length <= 1
}

// 获取获胜者
export function getWinner(players) {
  const activePlayers = players.filter(p => !p.folded)
  if (activePlayers.length === 1) {
    return activePlayers[0]
  }
  return null // 需要比牌
}

// 创建游戏记录
export function createGameRecord(gameData) {
  return {
    id: generateId(),
    timestamp: getCurrentTime(),
    ...gameData
  }
}

// 保存游戏记录
export function saveGameRecord(record) {
  const history = loadFromLocalStorage('poker_game_history', [])
  history.unshift(record) // 最新的在最前面
  // 只保留最近100条记录
  if (history.length > 100) {
    history.pop()
  }
  saveToLocalStorage('poker_game_history', history)
}
