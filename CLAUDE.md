# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 14 的多功能个人网站，包含三大核心功能：
1. **个人博客系统** - Markdown 文章管理
2. **足球数据展示** - 曼联比赛数据（支持 API 和本地数据）
3. **在线德州扑克** - Socket.IO 实时多人游戏，含 AI 对手

## 常用命令

### 开发
```bash
npm run dev          # 启动开发服务器（使用自定义 server.js）
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run lint         # 运行 ESLint
```

### 部署
```bash
./deploy.sh          # 快速部署到 Vercel
```

## 项目架构

### 自定义服务器

**重要**: 项目使用自定义 `server.js` 而不是默认的 Next.js 服务器。

- **原因**: 集成 Socket.IO 用于扑克游戏的实时通信
- **入口**: `server.js` → `lib/poker/server/socket-server.js`
- **注意**: 修改游戏逻辑时需要同时更新客户端和服务端

### 目录结构

```
my-blog/
├── server.js                      # 自定义服务器（集成 Socket.IO）
├── app/
│   ├── api/matches/route.js      # 足球数据 API（含缓存和降级）
│   ├── poker/                     # 扑克游戏页面
│   ├── blog/[slug]/page.js       # 博客文章详情
│   ├── layout.js                  # 根布局
│   └── globals.css                # 全局样式（深色主题）
├── lib/
│   ├── posts.js                   # 博客文章数据
│   ├── matches.js                 # 本地足球数据（降级用）
│   └── poker/                     # 扑克游戏核心逻辑
│       ├── constants.js           # 游戏常量（牌型、阶段、配置）
│       ├── handRank.js            # 牌型评估算法
│       ├── ai.js                  # AI 决策逻辑
│       ├── deck.js                # 扑克牌组管理
│       ├── utils.js               # 工具函数
│       └── server/socket-server.js # Socket.IO 服务端
└── components/                    # React 组件
```

## 三大功能模块

### 1. 博客系统

**文章数据**: `lib/posts.js`
- 所有文章以对象数组形式存储
- 支持标签、日期、摘要
- 使用 `react-markdown` 渲染

**添加新文章**: 在 `lib/posts.js` 中添加对象：
```javascript
{
  slug: 'article-slug',
  title: '文章标题',
  date: '2026-01-21',
  excerpt: '摘要',
  content: `# Markdown 内容`,
  tags: ['标签1', '标签2'],
}
```

### 2. 足球数据展示

**API 路由**: `app/api/matches/route.js`
- 支持从 Football-Data.org API 获取数据
- 1 小时缓存（减少 API 调用）
- API 失败时自动降级到 `lib/matches.js` 本地数据
- 环境变量: `NEXT_PUBLIC_FOOTBALL_DATA_API_KEY`

**工作流程**:
```
用户访问 → 检查 API Key → 有 API: 获取数据 → 缓存 1h
                            → 无 API: 使用本地数据
```

### 3. 德州扑克游戏

**核心架构**:
- **通信**: Socket.IO 实时双向通信
- **服务端**: `lib/poker/server/socket-server.js`
- **牌型评估**: `lib/poker/handRank.js`（服务端和客户端都需要）
- **AI 系统**: `lib/poker/ai.js`（3 个难度级别）

**游戏阶段**（`lib/poker/constants.js`）:
- PRE_FLOP → FLOP → TURN → RIVER → SHOWDOWN

**重要约束**:
- 牌型评估逻辑在服务端和客户端必须完全一致
- 修改游戏规则时需同步更新 `constants.js`、`socket-server.js` 和前端组件
- AI 决策逻辑基于当前手牌强度和底池赔率

**游戏配置**（可调整）:
```javascript
GAME_CONFIG = {
  STARTING_CHIPS: 1000,
  SMALL_BLIND: 10,
  BIG_BLIND: 20,
  AI_COUNT: 2,
  // ...
}
```

## 环境变量

```bash
# .env.local（开发）
NEXT_PUBLIC_FOOTBALL_DATA_API_KEY=your_api_key

# .env.production（生产）
# 同上，或留空使用本地数据
```

## 部署注意事项

1. **Vercel 部署**: 使用 `./deploy.sh` 或手动部署
2. **Socket.IO 限制**: Vercel 无服务器环境不支持 Socket.IO，需要部署到支持 WebSocket 的平台（如 Railway、Render）
3. **环境变量**: 在 Vercel 项目设置中配置 `NEXT_PUBLIC_FOOTBALL_DATA_API_KEY`

## 开发建议

- **博客改动**: 直接修改 `lib/posts.js` 和相关组件
- **扑克游戏**: 修改逻辑前先理解 `constants.js` 和 `socket-server.js` 的关系
- **样式修改**: 主要在 `app/globals.css` 中修改 CSS 变量
- **API 集成**: 参考 `app/api/matches/route.js` 的缓存和降级模式

## 技术栈

- Next.js 14 (App Router)
- Socket.IO 4.8
- React 18
- Tailwind CSS
- React Markdown
