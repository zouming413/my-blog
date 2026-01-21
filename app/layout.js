import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: {
    default: '我的博客 - 记录学习与生活',
    template: '%s | 我的博客',
  },
  description: '个人博客，分享技术心得、学习历程和项目经验',
  keywords: ['博客', '技术', '编程', 'Next.js', 'React'],
  authors: [{ name: 'MyBlog' }],
  openGraph: {
    title: '我的博客',
    description: '个人博客 - 记录学习与生活',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '我的博客',
    description: '个人博客 - 记录学习与生活',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className={inter.className}>
        <div className="relative">
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
