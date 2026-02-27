import MatchCardClient from './MatchCardClient'

export default async function MatchCardWrapper() {
  // 服务器端获取数据
  let matchData = null
  let isLive = false
  let source = 'local'

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/matches`, {
      cache: 'no-store'
    })
    const data = await response.json()

    if (data.match && data.match.opponent) {
      matchData = data.match
      isLive = data.isLive
      source = data.source
    }
  } catch (error) {
    console.error('Failed to fetch match on server:', error)
  }

  return <MatchCardClient initialMatch={matchData} initialIsLive={isLive} initialSource={source} />
}
