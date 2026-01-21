// 曼联比赛数据（来源：曼联官方赛程）
export const manUnitedMatches = [
  {
    id: 1,
    opponent: '阿森纳',
    date: '2026-01-25',
    time: '08:30',  // 北京时间早上8:30，不在直播时段（20:00-21:00）
    venue: '酋长球场',
    competition: '英超',
    liveUrl: 'https://www.miguvideo.com/p/home/0c40bbc85fa345bbba20f8e5fd11a922',
    replayUrl: 'https://haixing1.com/live',
  },
  {
    id: 2,
    opponent: '莱斯特城',
    date: '2026-02-08',
    time: '20:00',  // 晚上8点，在直播时段
    venue: '老特拉福德球场',
    competition: '英超',
    liveUrl: 'https://www.miguvideo.com/p/home/0c40bbc85fa345bbba20f8e5fd11a922',
    replayUrl: 'https://haixing1.com/live',
  },
  {
    id: 3,
    opponent: '热刺',
    date: '2026-02-15',
    time: '20:30',  // 晚上8:30，在直播时段
    venue: '托特纳姆热刺球场',
    competition: '英超',
    liveUrl: 'https://www.miguvideo.com/p/home/0c40bbc85fa345bbba20f8e5fd11a922',
    replayUrl: 'https://haixing1.com/live',
  },
]

// 获取下一场比赛
export function getNextMatch() {
  const now = new Date()

  // 找到下一场未开始的比赛
  const nextMatch = manUnitedMatches.find(match => {
    const matchDate = new Date(`${match.date}T${match.time}:00`)
    return matchDate > now
  })

  return nextMatch || manUnitedMatches[0] // 如果没有未开始的比赛，返回第一场
}

// 判断是否在比赛直播时间（晚上8-9点）
export function isLiveMatchTime(matchTime) {
  const hour = parseInt(matchTime.split(':')[0])
  return hour >= 20 && hour <= 21
}
