import Link from 'next/link'
import { posts } from '../lib/posts'

export const metadata = {
  title: '首页',
  description: '欢迎来到我的个人博客，记录学习历程，分享技术心得',
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <h1 className="text-6xl font-semibold mb-4 text-gray-900 tracking-tight">
          欢迎来到我的博客
        </h1>
        <p className="text-2xl text-gray-600 mb-12 font-normal">
          记录学习历程，分享技术心得
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-200 text-base"
          >
            浏览文章
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 bg-white text-gray-900 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-base"
          >
            关于我
          </Link>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="mb-20">
        <h2 className="text-4xl font-semibold mb-8 text-gray-900 tracking-tight">
          最新文章
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="card rounded-2xl p-6 cursor-pointer"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow text-base leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <time className="text-gray-500">{post.date}</time>
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 rounded-3xl p-12">
        <h2 className="text-3xl font-semibold mb-12 text-center text-gray-900">博客统计</h2>
        <div className="grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto">
          <div>
            <div className="text-5xl font-semibold text-gray-900 mb-2">
              {posts.length}
            </div>
            <div className="text-gray-600 text-base">文章总数</div>
          </div>
          <div>
            <div className="text-5xl font-semibold text-gray-900 mb-2">
              {posts.reduce((acc, post) => acc + post.tags.length, 0)}
            </div>
            <div className="text-gray-600 text-base">标签数量</div>
          </div>
          <div>
            <div className="text-5xl font-semibold text-gray-900 mb-2">
              ∞
            </div>
            <div className="text-gray-600 text-base">学习热情</div>
          </div>
        </div>
      </section>
    </div>
  )
}
