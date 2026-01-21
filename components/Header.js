import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            ZM
          </Link>

          <ul className="flex gap-8 items-center">
            <li>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                首页
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                关于
              </Link>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

