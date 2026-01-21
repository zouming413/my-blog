import { NextResponse } from 'next/server'

// 曼联球队ID
const MAN_UTD_ID = '66'

// 获取 Football-Data.org 的比赛数据
async function fetchFromFootballData() {
  const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    return null
  }

  try {
    // 获取英超比赛
    const response = await fetch(
      `https://api.football-data.org/v4/teams/${MAN_UTD_ID}/matches?status=SCHEDULED&limit=5`,
      {
        headers: {
          'X-Auth-Token': apiKey,
        },
        next: { revalidate: 3600 } // 缓存1小时
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // 转换数据格式
    return data.matches?.map(match => {
      const isHome = match.homeTeam.id === parseInt(MAN_UTD_ID)
      const opponent = isHome ? match.awayTeam : match.homeTeam

      return {
        opponent: opponent.name,
        date: match.utcDate.split('T')[0],
        time: match.utcDate.split('T')[1].substring(0, 5),
        venue: isHome ? '老特拉福德球场' : opponent.name.replace('FC', '').replace('United', '').trim() + '球场',
        competition: match.competition.name,
        homeTeam: '曼联',
        awayTeam: opponent.name,
        isHome: isHome,
        liveUrl: 'https://haixing1.com/live',  // 海星直播
        replayUrl: 'https://www.miguvideo.com/p/home/0c40bbc85fa345bbba20f8e5fd11a922',  // 咪咕录播
      }
    }) || []
  } catch (error) {
    console.error('Football-Data API error:', error)
    return null
  }
}

// 备用：使用本地数据（当API不可用时）
import { manUnitedMatches as localMatches } from '../../../lib/matches'

export async function GET() {
  // 尝试从API获取
  let matches = await fetchFromFootballData()

  // 如果API失败，使用本地数据
  if (!matches || matches.length === 0) {
    matches = localMatches.map(match => ({
      ...match,
      homeTeam: '曼联',
      isHome: match.venue === '老特拉福德球场'
    }))
  }

  // 获取下一场比赛
  const now = new Date()
  const nextMatch = matches.find(match => {
    const matchDate = new Date(`${match.date}T${match.time}:00`)
    return matchDate > now
  }) || matches[0]

  // 判断是否在直播时间（北京时间 20:00-21:00，即 UTC 12:00-13:00）
  const hour = parseInt(nextMatch.time.split(':')[0])
  const isLive = hour >= 12 && hour <= 13

  return NextResponse.json({
    match: nextMatch,
    isLive,
    allMatches: matches,
    source: matches === localMatches ? 'local' : 'api'
  })
}
