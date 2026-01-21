'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center">
        <h2 className="text-4xl font-semibold text-gray-900 mb-4">出错了！</h2>
        <p className="text-gray-600 mb-8 text-lg">
          加载文章时遇到了问题
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-200"
          >
            重试
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white text-gray-900 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
