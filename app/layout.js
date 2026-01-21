import './globals.css'
import Footer from '../components/Footer'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: {
    default: 'ZM - 个人博客',
    template: '%s | ZM',
  },
  description: '个人博客，分享技术心得、学习历程和项目经验',
  keywords: ['博客', '技术', '编程', 'Next.js', 'React'],
  authors: [{ name: 'ZM' }],
  openGraph: {
    title: 'ZM',
    description: '个人博客 - 记录学习与生活',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ZM',
    description: '个人博客 - 记录学习与生活',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className={inter.className}>
        <div className="relative">
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
