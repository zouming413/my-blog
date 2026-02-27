import { ACTIONS, AI_DIFFICULTY } from './constants'
import { evaluateHand } from './handRank'

/**
 * AI 决策函数
 * @param {Object} aiPlayer - AI 玩家信息
 * @param {Array} holeCards - AI 的底牌
 * @param {Array} communityCards - 公共牌
 * @param {Number} pot - 当前底池
 * @param {Number} currentBet - 当前最高下注
 * @param {Number} toCall - 需要跟注的金额
 * @param {String} difficulty - AI 难度
 * @returns {Object} { action: string, amount: number }
 */
export function aiDecision(aiPlayer, holeCards, communityCards, pot, currentBet, toCall, difficulty = AI_DIFFICULTY.EASY) {
  const chips = aiPlayer.chips
  const evaluation = evaluateHand(holeCards, communityCards)

  // 根据难度选择决策策略
  switch (difficulty) {
    case AI_DIFFICULTY.EASY:
      return easyAI(evaluation, chips, toCall, currentBet, pot)
    case AI_DIFFICULTY.MEDIUM:
      return mediumAI(evaluation, chips, toCall, currentBet, pot)
    case AI_DIFFICULTY.HARD:
      return hardAI(evaluation, chips, toCall, currentBet, pot, holeCards, communityCards)
    default:
      return easyAI(evaluation, chips, toCall, currentBet, pot)
  }
}

/**
 * 简单 AI - 保守策略
 */
function easyAI(evaluation, chips, toCall, currentBet, pot) {
  const handStrength = evaluation.rankValue

  // 需要全押才能跟注
  if (toCall >= chips) {
    // 只有好牌才全押
    if (handStrength >= 4) { // 三条或更好
      return { action: ACTIONS.CALL, amount: chips }
    }
    return { action: ACTIONS.FOLD, amount: 0 }
  }

  // 翻牌前
  if (!evaluation || !evaluation.cards || evaluation.cards.length < 5) {
    // 随机决策
    const random = Math.random()
    if (random < 0.3) {
      return { action: ACTIONS.FOLD, amount: 0 }
    } else if (random < 0.7) {
      return toCall === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.CALL, amount: toCall }
    } else {
      return { action: ACTIONS.CALL, amount: toCall }
    }
  }

  // 翻牌后
  if (handStrength >= 4) {
    // 三条或更好 - 跟注或加注
    if (Math.random() < 0.3 && toCall < chips * 0.5) {
      const raiseAmount = Math.min(toCall * 2, chips * 0.3, currentBet * 2)
      return { action: ACTIONS.RAISE, amount: raiseAmount }
    }
    return { action: ACTIONS.CALL, amount: toCall }
  } else if (handStrength >= 2) {
    // 一对或两对 - 跟注
    return toCall === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.CALL, amount: toCall }
  } else {
    // 高牌 - 大部分情况弃牌
    if (toCall === 0) {
      return { action: ACTIONS.CHECK, amount: 0 }
    }
    if (toCall > pot * 0.3) {
      return { action: ACTIONS.FOLD, amount: 0 }
    }
    return { action: ACTIONS.CALL, amount: toCall }
  }
}

/**
 * 中等 AI - 平衡策略
 */
function mediumAI(evaluation, chips, toCall, currentBet, pot) {
  const handStrength = evaluation.rankValue
  const potOdds = toCall / (pot + toCall)

  // 计算手牌胜率（简化版）
  const winProbability = (handStrength / 10) * 0.6 + Math.random() * 0.4

  // 翻牌前 - 根据底牌质量决策
  if (!evaluation || !evaluation.cards || evaluation.cards.length < 5) {
    const card1 = evaluation.cards?.[0]
    const card2 = evaluation.cards?.[1]

    if (card1 && card2) {
      // 高牌对子
      if (card1.value === card2.value && card1.value >= 10) {
        return toCall === 0 ? { action: ACTIONS.RAISE, amount: Math.min(pot * 0.5, chips) } : { action: ACTIONS.CALL, amount: toCall }
      }
      // 高张
      if (card1.value >= 12 && card2.value >= 12) {
        return toCall <= pot * 0.2 ? { action: ACTIONS.CALL, amount: toCall } : { action: ACTIONS.FOLD, amount: 0 }
      }
    }

    // 随机性决策
    if (Math.random() < 0.2) {
      return { action: ACTIONS.FOLD, amount: 0 }
    }
    return toCall === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.CALL, amount: toCall }
  }

  // 翻牌后 - 根据牌力和赔率决策
  if (winProbability > potOdds) {
    // 值得跟注
    if (handStrength >= 4 && Math.random() < 0.4) {
      // 好牌时加注
      const raiseAmount = Math.min(toCall * 2 + pot * 0.5, chips * 0.5)
      return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
    }
    return toCall === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.CALL, amount: toCall }
  } else {
    // 不值得
    if (toCall === 0) {
      return { action: ACTIONS.CHECK, amount: 0 }
    }
    if (toCall > pot * 0.5) {
      return { action: ACTIONS.FOLD, amount: 0 }
    }
    // 偶尔诈唬
    if (Math.random() < 0.15) {
      return { action: ACTIONS.CALL, amount: toCall }
    }
    return { action: ACTIONS.FOLD, amount: 0 }
  }
}

/**
 * 困难 AI - 激进策略
 */
function hardAI(evaluation, chips, toCall, currentBet, pot, holeCards, communityCards) {
  const handStrength = evaluation.rankValue

  // 翻牌前 - 更激进的加注
  if (!evaluation || !evaluation.cards || evaluation.cards.length < 5) {
    const card1 = evaluation.cards?.[0]
    const card2 = evaluation.cards?.[1]

    if (card1 && card2) {
      // 对子
      if (card1.value === card2.value) {
        if (card1.value >= 10) {
          const raiseAmount = Math.min(pot * 0.75, chips * 0.4)
          return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
        }
        return toCall <= pot * 0.3 ? { action: ACTIONS.RAISE, amount: Math.floor(pot * 0.5) } : { action: ACTIONS.CALL, amount: toCall }
      }
      // 高张
      if (card1.value >= 12 || card2.value >= 12) {
        if (Math.random() < 0.6) {
          const raiseAmount = Math.min(toCall + pot * 0.3, chips * 0.3)
          return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
        }
        return { action: ACTIONS.CALL, amount: toCall }
      }
    }

    // 偶尔诈唬加注
    if (Math.random() < 0.25 && toCall < chips * 0.2) {
      const raiseAmount = Math.min(toCall * 2, chips * 0.2)
      return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
    }

    return toCall === 0 ? { action: ACTIONS.CHECK, amount: 0 } : { action: ACTIONS.CALL, amount: toCall }
  }

  // 翻牌后
  if (handStrength >= 6) {
    // 同花或更好 - 大幅加注
    if (Math.random() < 0.7) {
      const raiseAmount = Math.min(toCall * 3 + pot, chips * 0.6)
      return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
    }
    return { action: ACTIONS.CALL, amount: toCall }
  } else if (handStrength >= 4) {
    // 三条 - 加注
    if (Math.random() < 0.5) {
      const raiseAmount = Math.min(toCall * 2 + pot * 0.5, chips * 0.4)
      return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
    }
    return { action: ACTIONS.CALL, amount: toCall }
  } else if (handStrength >= 2) {
    // 一对或两对
    if (toCall <= pot * 0.4) {
      if (Math.random() < 0.3) {
        const raiseAmount = Math.min(toCall * 2, chips * 0.3)
        return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
      }
      return { action: ACTIONS.CALL, amount: toCall }
    } else if (toCall <= pot * 0.7) {
      return Math.random() < 0.7 ? { action: ACTIONS.CALL, amount: toCall } : { action: ACTIONS.FOLD, amount: 0 }
    } else {
      return Math.random() < 0.3 ? { action: ACTIONS.CALL, amount: toCall } : { action: ACTIONS.FOLD, amount: 0 }
    }
  } else {
    // 高牌
    if (toCall === 0) {
      // 偶尔诈唬
      if (Math.random() < 0.2) {
        const raiseAmount = Math.min(pot * 0.5, chips * 0.2)
        return { action: ACTIONS.RAISE, amount: Math.floor(raiseAmount) }
      }
      return { action: ACTIONS.CHECK, amount: 0 }
    }
    if (toCall > pot * 0.3) {
      // 偶尔跟注陷阱
      return Math.random() < 0.15 ? { action: ACTIONS.CALL, amount: toCall } : { action: ACTIONS.FOLD, amount: 0 }
    }
    return Math.random() < 0.4 ? { action: ACTIONS.CALL, amount: toCall } : { action: ACTIONS.FOLD, amount: 0 }
  }
}

/**
 * 创建 AI 玩家
 */
export function createAIPlayer(id, name, difficulty = AI_DIFFICULTY.EASY, startingChips = 1000) {
  return {
    id,
    name,
    isAI: true,
    chips: startingChips,
    holeCards: [],
    folded: false,
    currentRoundBet: 0,
    hasActed: false,
    difficulty,
    lastAction: null
  }
}
