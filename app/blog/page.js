import Link from 'next/link'
import { posts } from '../../lib/posts'

export const metadata = {
  title: '所有文章',
  description: '浏览我的所有技术文章和学习笔记',
}

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-semibold mb-12 text-gray-900 tracking-tight">所有文章</h1>

      <div className="space-y-6">
        {posts.map((post, index) => (
          <article key={post.slug} className="card rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Link href={`/blog/${post.slug}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="text-blue-600 font-semibold text-3xl md:w-16 flex-shrink-0">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 text-base leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <time className="text-gray-500">📅 {post.date}</time>
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-blue-600 md:mt-2 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
