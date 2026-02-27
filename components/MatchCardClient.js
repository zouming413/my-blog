'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MatchCardClient({ initialMatch, initialIsLive, initialSource }) {
  const [match, setMatch] = useState(initialMatch)
  const [isLive, setIsLive] = useState(initialIsLive)
  const [countdown, setCountdown] = useState('')
  const [dataSource, setDataSource] = useState(initialSource)
  const [loading, setLoading] = useState(!initialMatch)
  const [error, setError] = useState(false)

  useEffect(() => {
    // 如果服务器端已经提供了数据，直接使用
    if (initialMatch) {
      updateCountdown(initialMatch)
      const interval = setInterval(() => updateCountdown(initialMatch), 60000)
      return () => clearInterval(interval)
    }

    // 否则客户端获取数据
    async function fetchMatch() {
      try {
        console.log('Fetching match data...')
        const response = await fetch('/api/matches')
        const data = await response.json()
        console.log('Match data received:', data)

        if (!data.match || !data.match.opponent) {
          console.error('No match data in response:', data)
          setError(true)
          setLoading(false)
          return
        }

        console.log('Setting match:', data.match)
        setMatch(data.match)
        setIsLive(data.isLive)
        setDataSource(data.source)
        setLoading(false)
        updateCountdown(data.match)
        const interval = setInterval(() => updateCountdown(data.match), 60000)
        return () => clearInterval(interval)
      } catch (err) {
        console.error('Failed to fetch match:', err)
        setError(true)
        setLoading(false)
      }
    }

    fetchMatch()
  }, [initialMatch])

  function updateCountdown(matchData) {
    const matchDate = new Date(`${matchData.date}T${matchData.time}:00`)
    const now = new Date()
    const diff = matchDate - now

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setCountdown(`${days}天 ${hours}小时`)
      } else if (hours > 0) {
        setCountdown(`${hours}小时 ${minutes}分钟`)
      } else {
        setCountdown(`${minutes}分钟`)
      }
    } else {
      setCountdown('比赛进行中')
    }
  }

  if (loading) {
    return (
      <div className="card rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card rounded-2xl p-8 bg-red-50 border-red-200">
        <p className="text-red-600">加载比赛数据失败</p>
        <p className="text-sm text-red-500 mt-2">请稍后刷新页面重试</p>
      </div>
    )
  }

  if (!match) {
    return null
  }

  return (
    <div className="card rounded-2xl p-8 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🔴</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">曼联下一场比赛</h3>
            <p className="text-gray-600">{match.competition}</p>
          </div>
        </div>
        {dataSource === 'api' && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            实时数据
          </span>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">对阵</span>
          <span className="text-xl font-bold text-gray-900">
            {match.isHome ? '曼联' : match.opponent} vs {match.isHome ? match.opponent : '曼联'}
            {match.isHome !== undefined && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({match.isHome ? '主场' : '客场'})
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">时间</span>
          <span className="text-gray-900 font-medium">
            {match.date} {match.time} (北京时间)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">地点</span>
          <span className="text-gray-900">{match.venue}</span>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">距离比赛还有</p>
          <p className="text-3xl font-bold text-red-600">{countdown}</p>
        </div>
      </div>

      <a
        href={isLive ? match.liveUrl : match.replayUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full px-6 py-4 bg-red-600 text-white text-center font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 text-base"
      >
        {isLive ? '📺 观看直播' : '🎬 观看录播'}
      </a>

      <p className="text-xs text-gray-500 text-center mt-3">
        {isLive ? '比赛时间为晚上8-9点' : '当前不在直播时间段'}
      </p>
    </div>
  )
}
