#!/bin/bash

echo "🚀 开始部署博客到 Vercel..."
echo ""

cd /Users/tiger/my-blog

echo "📦 安装依赖..."
npm install

echo ""
echo "🔐 第一步：登录 Vercel"
echo "请选择登录方式："
echo "  1. GitHub（推荐）"
echo "  2. Email"
echo ""
npx vercel login

echo ""
echo "🚀 第二步：部署项目"
npx vercel --prod

echo ""
echo "✅ 部署完成！"
echo "你的博客现在应该在线上了！"
