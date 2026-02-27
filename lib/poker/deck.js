import { createDeck, shuffleDeck as shuffle } from './utils'

export class Deck {
  constructor() {
    this.cards = []
    this.reset()
  }

  // 重置并洗牌
  reset() {
    this.cards = shuffle(createDeck())
  }

  // 发牌
  deal(count) {
    if (this.cards.length < count) {
      throw new Error('Not enough cards in deck')
    }
    return this.cards.splice(0, count)
  }

  // 发一张牌
  dealOne() {
    if (this.cards.length === 0) {
      throw new Error('Deck is empty')
    }
    return this.cards.shift()
  }

  // 获取剩余牌数
  getRemainingCount() {
    return this.cards.length
  }

  // 查看剩余的牌（不取出）
  peek(count) {
    return this.cards.slice(0, count)
  }
}

export default Deck
