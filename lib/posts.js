export const posts = [
  {
    slug: 'welcome-to-my-blog',
    title: '欢迎来到我的博客',
    date: '2026-01-21',
    excerpt: '这是我的第一篇博客文章。在这里我将分享关于技术、编程和生活的思考。',
    content: `# 欢迎来到我的博客

你好！这是我的第一篇博客文章。

## 关于这个博客

这个博客使用 Next.js 构建，采用了深色科技风格设计。在这里，我将分享：

- 技术教程和心得
- 编程学习笔记
- 项目经验分享
- 生活感悟

## 技术栈

本博客使用以下技术构建：

- **Next.js 14** - React 框架
- **Tailwind CSS** - 样式框架
- **React Markdown** - Markdown 渲染

## 未来计划

我计划在博客中分享更多内容，包括：

1. 前端开发教程
2. 后端技术探索
3. 算法与数据结构
4. 实战项目经验

感谢你的访问！
`,
    tags: ['欢迎', '介绍'],
  },
  {
    slug: 'getting-started-with-nextjs',
    title: 'Next.js 入门指南',
    date: '2026-01-20',
    excerpt: '学习如何使用 Next.js 构建现代化的 Web 应用程序，从基础概念到实际应用。',
    content: `# Next.js 入门指南

Next.js 是一个强大的 React 框架，让构建现代化的 Web 应用变得简单。

## 什么是 Next.js？

Next.js 提供了许多开箱即用的功能：

- 服务端渲染（SSR）
- 静态网站生成（SSG）
- API 路由
- 自动代码分割
- 图片优化

## 安装

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## 项目结构

\`\`\`
app/
├── layout.js
├── page.js
└── globals.css
\`\`\`

## 创建页面

在 Next.js 14 中，使用 App Router：

\`\`\`jsx
export default function Page() {
  return <h1>Hello World</h1>
}
\`\`\`

## 部署

Next.js 可以轻松部署到 Vercel：

\`\`\`bash
npm run build
\`\`\`

希望这个简短的介绍能帮助你开始使用 Next.js！
`,
    tags: ['Next.js', 'React', '教程'],
  },
  {
    slug: 'understanding-react-hooks',
    title: '深入理解 React Hooks',
    date: '2026-01-19',
    excerpt: 'React Hooks 改变了我们编写组件的方式。让我们深入理解常用的 Hooks。',
    content: `# 深入理解 React Hooks

React Hooks 在 React 16.8 中引入，彻底改变了我们编写组件的方式。

## useState

最常用的 Hook，用于在函数组件中添加状态：

\`\`\`jsx
const [count, setCount] = useState(0)
\`\`\`

## useEffect

用于处理副作用：

\`\`\`jsx
useEffect(() => {
  document.title = \`Count: \${count}\`
}, [count])
\`\`\`

## useContext

跨组件共享状态：

\`\`\`jsx
const value = useContext(MyContext)
\`\`\`

## 自定义 Hooks

可以创建自己的 Hooks 来复用逻辑：

\`\`\`jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
\`\`\`

## Hooks 规则

1. 只在函数最外层调用 Hook
2. 只在 React 函数中调用 Hook
3. 使用 ESLint 插件来强制执行这些规则

掌握 Hooks 是成为高级 React 开发者的必经之路！
`,
    tags: ['React', 'Hooks', 'JavaScript'],
  },
]

export function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug)
}

export function getAllSlugs() {
  return posts.map((post) => post.slug)
}
