import MatchCard from '../components/MatchCard'

export const metadata = {
  title: '首页',
  description: '欢迎来到我的个人博客',
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Match Section */}
      <section>
        <MatchCard />
      </section>
    </div>
  )
}
