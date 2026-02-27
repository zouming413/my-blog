import { HAND_RANKINGS } from './constants'
import { sortCards } from './utils'

/**
 * 评估德州扑克手牌
 * @param {Array} holeCards - 玩家的底牌（2张）
 * @param {Array} communityCards - 公共牌（3-5张）
 * @returns {Object} 包含牌型、牌力等级、主要牌等的对象
 */
export function evaluateHand(holeCards, communityCards) {
  // 合并所有牌（7张选5张）
  const allCards = [...holeCards, ...communityCards]

  if (allCards.length < 5) {
    return {
      rank: HAND_RANKINGS.HIGH_CARD,
      rankValue: 1,
      name: '高牌',
      cards: sortCards(allCards),
      kickers: allCards
    }
  }

  // 生成所有可能的5张牌组合
  const combinations = getCombinations(allCards, 5)

  // 评估每个组合，找到最好的
  let bestHand = null
  for (const combo of combinations) {
    const evaluated = evaluateFiveCards(combo)
    if (!bestHand || compareHands(evaluated, bestHand) > 0) {
      bestHand = evaluated
    }
  }

  return bestHand
}

/**
 * 评估5张牌的牌型
 */
function evaluateFiveCards(cards) {
  const sorted = sortCards(cards)
  const ranks = sorted.map(c => c.value)
  const suits = sorted.map(c => c.suit.name)

  const isFlush = suits.every(s => s === suits[0])
  const isStraight = checkStraight(ranks)

  // 统计每个点数的出现次数
  const rankCounts = {}
  ranks.forEach(r => {
    rankCounts[r] = (rankCounts[r] || 0) + 1
  })
  const counts = Object.values(rankCounts).sort((a, b) => b - a)

  // 皇家同花顺
  if (isFlush && isStraight && ranks[0] === 14 && ranks[4] === 10) {
    return {
      rank: HAND_RANKINGS.ROYAL_FLUSH,
      rankValue: 10,
      name: '皇家同花顺',
      cards: sorted,
      kickers: []
    }
  }

  // 同花顺
  if (isFlush && isStraight) {
    return {
      rank: HAND_RANKINGS.STRAIGHT_FLUSH,
      rankValue: 9,
      name: '同花顺',
      cards: sorted,
      kickers: [],
      highCard: sorted[0]
    }
  }

  // 四条
  if (counts[0] === 4) {
    const quadRank = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 4))
    return {
      rank: HAND_RANKINGS.FOUR_OF_A_KIND,
      rankValue: 8,
      name: '四条',
      cards: sorted,
      kickers: [sorted.find(c => c.value !== quadRank)],
      quadRank
    }
  }

  // 葫芦
  if (counts[0] === 3 && counts[1] === 2) {
    const tripRank = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 3))
    return {
      rank: HAND_RANKINGS.FULL_HOUSE,
      rankValue: 7,
      name: '葫芦',
      cards: sorted,
      kickers: [],
      tripRank,
      pairRank: parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 2))
    }
  }

  // 同花
  if (isFlush) {
    return {
      rank: HAND_RANKINGS.FLUSH,
      rankValue: 6,
      name: '同花',
      cards: sorted,
      kickers: sorted.slice(1)
    }
  }

  // 顺子
  if (isStraight) {
    return {
      rank: HAND_RANKINGS.STRAIGHT,
      rankValue: 5,
      name: '顺子',
      cards: sorted,
      kickers: [],
      highCard: sorted[0]
    }
  }

  // 三条
  if (counts[0] === 3) {
    const tripRank = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 3))
    return {
      rank: HAND_RANKINGS.THREE_OF_A_KIND,
      rankValue: 4,
      name: '三条',
      cards: sorted,
      kickers: sorted.filter(c => c.value !== tripRank),
      tripRank
    }
  }

  // 两对
  if (counts[0] === 2 && counts[1] === 2) {
    const pairRanks = Object.keys(rankCounts)
      .filter(k => rankCounts[k] === 2)
      .map(Number)
      .sort((a, b) => b - a)
    return {
      rank: HAND_RANKINGS.TWO_PAIR,
      rankValue: 3,
      name: '两对',
      cards: sorted,
      kickers: [sorted.find(c => !pairRanks.includes(c.value))],
      pairRanks
    }
  }

  // 一对
  if (counts[0] === 2) {
    const pairRank = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 2))
    return {
      rank: HAND_RANKINGS.ONE_PAIR,
      rankValue: 2,
      name: '一对',
      cards: sorted,
      kickers: sorted.filter(c => c.value !== pairRank),
      pairRank
    }
  }

  // 高牌
  return {
    rank: HAND_RANKINGS.HIGH_CARD,
    rankValue: 1,
    name: '高牌',
    cards: sorted,
    kickers: sorted.slice(1)
  }
}

/**
 * 检查是否是顺子
 */
function checkStraight(ranks) {
  const sorted = [...ranks].sort((a, b) => b - a)
  // 普通顺子
  let isStraight = true
  for (let i = 0; i < 4; i++) {
    if (sorted[i] - sorted[i + 1] !== 1) {
      isStraight = false
      break
    }
  }
  if (isStraight) return true

  // A-2-3-4-5 顺子（轮子）
  if (sorted[0] === 14 && sorted[1] === 5 && sorted[2] === 4 && sorted[3] === 3 && sorted[4] === 2) {
    return true
  }

  return false
}

/**
 * 生成组合 C(n,k)
 */
function getCombinations(arr, k) {
  if (k === 0) return [[]]
  if (arr.length === 0) return []

  const [first, ...rest] = arr
  const combsWithFirst = getCombinations(rest, k - 1).map(comb => [first, ...comb])
  const combsWithoutFirst = getCombinations(rest, k)

  return [...combsWithFirst, ...combsWithoutFirst]
}

/**
 * 比较两个手牌
 * @returns {Number} 1: hand1更好, -1: hand2更好, 0: 平局
 */
export function compareHands(hand1, hand2) {
  // 先比较牌型
  if (hand1.rankValue !== hand2.rankValue) {
    return hand1.rankValue - hand2.rankValue
  }

  // 牌型相同，比较主要牌
  if (hand1.quadRank && hand2.quadRank) {
    if (hand1.quadRank !== hand2.quadRank) {
      return hand1.quadRank - hand2.quadRank
    }
  }

  if (hand1.tripRank && hand2.tripRank) {
    if (hand1.tripRank !== hand2.tripRank) {
      return hand1.tripRank - hand2.tripRank
    }
  }

  if (hand1.pairRanks && hand2.pairRanks) {
    for (let i = 0; i < hand1.pairRanks.length; i++) {
      if (hand1.pairRanks[i] !== hand2.pairRanks[i]) {
        return hand1.pairRanks[i] - hand2.pairRanks[i]
      }
    }
  }

  if (hand1.pairRank && hand2.pairRank) {
    if (hand1.pairRank !== hand2.pairRank) {
      return hand1.pairRank - hand2.pairRank
    }
  }

  if (hand1.highCard && hand2.highCard) {
    if (hand1.highCard.value !== hand2.highCard.value) {
      return hand1.highCard.value - hand2.highCard.value
    }
  }

  // 比较踢脚牌
  const kickers1 = hand1.kickers || []
  const kickers2 = hand2.kickers || []
  for (let i = 0; i < Math.min(kickers1.length, kickers2.length); i++) {
    if (kickers1[i].value !== kickers2[i].value) {
      return kickers1[i].value - kickers2[i].value
    }
  }

  // 完全平局
  return 0
}

/**
 * 获取获胜者
 */
export function determineWinner(players, communityCards) {
  const activePlayers = players.filter(p => !p.folded)

  if (activePlayers.length === 0) return null
  if (activePlayers.length === 1) return activePlayers[0]

  // 评估每个玩家的手牌
  const evaluatedPlayers = activePlayers.map(player => ({
    player,
    evaluation: evaluateHand(player.holeCards, communityCards)
  }))

  // 排序找最好的
  evaluatedPlayers.sort((a, b) => compareHands(b.evaluation, a.evaluation))

  // 检查是否有平局
  const winners = [evaluatedPlayers[0]]
  for (let i = 1; i < evaluatedPlayers.length; i++) {
    if (compareHands(evaluatedPlayers[i].evaluation, evaluatedPlayers[0].evaluation) === 0) {
      winners.push(evaluatedPlayers[i])
    } else {
      break
    }
  }

  return winners.length === 1 ? winners[0].player : winners.map(w => w.player)
}
