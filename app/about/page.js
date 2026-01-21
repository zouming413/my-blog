export const metadata = {
  title: '关于我',
  description: '了解更多关于我的信息、技术栈和联系方式',
}

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-semibold mb-12 text-gray-900 tracking-tight">关于我</h1>

      <div className="max-w-4xl mx-auto">
        <div className="card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            你好！👋
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-lg">
            欢迎来到我的个人博客！我是一名热爱技术的开发者，喜欢分享学习心得和项目经验。
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            在这个博客中，我会记录我的学习历程，分享关于编程、技术探索和生活的思考。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900">
              ⚡ 技术栈
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="text-base">▸ JavaScript / TypeScript</li>
              <li className="text-base">▸ React / Next.js</li>
              <li className="text-base">▸ Node.js</li>
              <li className="text-base">▸ Python</li>
              <li className="text-base">▸ Git / GitHub</li>
            </ul>
          </div>

          <div className="card rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900">
              🎯 兴趣领域
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="text-base">▸ 前端开发</li>
              <li className="text-base">▸ 后端技术</li>
              <li className="text-base">▸ 算法与数据结构</li>
              <li className="text-base">▸ 开源项目</li>
              <li className="text-base">▸ 技术写作</li>
            </ul>
          </div>
        </div>

        <div className="card rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">联系我</h3>
          <p className="text-gray-700 mb-8 text-lg">
            如果你对我的文章有任何问题或建议，欢迎通过以下方式联系我：
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-200 text-base"
            >
              GitHub
            </a>
            <a
              href="mailto:your-email@example.com"
              className="px-6 py-3 bg-white text-gray-900 font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-base"
            >
              Email
            </a>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p className="text-lg">感谢你的访问！希望我的文章对你有所帮助。</p>
        </div>
      </div>
    </div>
  )
}
