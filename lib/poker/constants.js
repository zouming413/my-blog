// 扑克花色
export const SUITS = {
  SPADES: { symbol: '♠', name: 'spades', color: 'black' },
  HEARTS: { symbol: '♥', name: 'hearts', color: 'red' },
  CLUBS: { symbol: '♣', name: 'clubs', color: 'black' },
  DIAMONDS: { symbol: '♦', name: 'diamonds', color: 'red' }
}

// 扑克点数
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

// 牌型等级（从高到低）
export const HAND_RANKINGS = {
  ROYAL_FLUSH: { rank: 10, name: '皇家同花顺' },
  STRAIGHT_FLUSH: { rank: 9, name: '同花顺' },
  FOUR_OF_A_KIND: { rank: 8, name: '四条' },
  FULL_HOUSE: { rank: 7, name: '葫芦' },
  FLUSH: { rank: 6, name: '同花' },
  STRAIGHT: { rank: 5, name: '顺子' },
  THREE_OF_A_KIND: { rank: 4, name: '三条' },
  TWO_PAIR: { rank: 3, name: '两对' },
  ONE_PAIR: { rank: 2, name: '一对' },
  HIGH_CARD: { rank: 1, name: '高牌' }
}

// 游戏阶段
export const GAME_PHASES = {
  IDLE: 'idle',           // 空闲
  PRE_FLOP: 'pre-flop',   // 翻牌前
  FLOP: 'flop',          // 翻牌
  TURN: 'turn',          // 转牌
  RIVER: 'river',        // 河牌
  SHOWDOWN: 'showdown'   // 摊牌
}

// 玩家操作
export const ACTIONS = {
  FOLD: 'fold',       // 弃牌
  CHECK: 'check',     // 过牌
  CALL: 'call',       // 跟注
  RAISE: 'raise',     // 加注
  ALL_IN: 'all-in'    // 全押
}

// 筹码面额
export const CHIP_DENOMINATIONS = [
  { value: 10, color: '#3b82f6', label: '10' },
  { value: 50, color: '#8b5cf6', label: '50' },
  { value: 100, color: '#10b981', label: '100' },
  { value: 500, color: '#f59e0b', label: '500' },
  { value: 1000, color: '#1f2937', label: '1K' }
]

// 游戏配置
export const GAME_CONFIG = {
  STARTING_CHIPS: 1000,    // 初始筹码
  SMALL_BLIND: 10,         // 小盲注
  BIG_BLIND: 20,           // 大盲注
  MIN_PLAYERS: 2,          // 最少玩家数
  MAX_PLAYERS: 10,         // 最多玩家数
  AI_COUNT: 2,             // AI 玩家数量
  BUY_IN_AMOUNT: 1000      // 买入金额
}

// AI 难度
export const AI_DIFFICULTY = {
  EASY: 'easy',       // 简单（保守）
  MEDIUM: 'medium',   // 中等
  HARD: 'hard'        // 困难（激进）
}

// 本地存储键名
export const STORAGE_KEYS = {
  GAME_HISTORY: 'poker_game_history',
  PLAYER_STATS: 'poker_player_stats',
  CURRENT_GAME: 'poker_current_game'
}
