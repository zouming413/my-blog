import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllSlugs } from '../../../lib/posts'
import ReactMarkdown from 'react-markdown'

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 mb-8 text-blue-600 hover:text-blue-700 transition-colors text-base"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回文章列表
      </Link>

      <article className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-semibold mb-6 text-gray-900 tracking-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <time className="text-base">📅 {post.date}</time>
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-4xl font-semibold mb-4 mt-8 text-gray-900" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-3xl font-semibold mb-4 mt-8 text-gray-900" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold mb-3 mt-6 text-gray-900" {...props} />,
              p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-700 text-lg" {...props} />,
              a: ({ node, ...props }) => (
                <a className="text-blue-600 hover:text-blue-700 underline" {...props} />
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-sm font-mono" {...props} />
                ) : (
                  <code {...props} />
                ),
              pre: ({ node, ...props }) => <pre className="mb-6 overflow-x-auto" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              li: ({ node, ...props }) => <li className="text-lg" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-blue-600 pl-4 text-gray-600 my-6 text-lg italic" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回文章列表
          </Link>
        </div>
      </article>
    </div>
  )
}
