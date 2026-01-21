# 部署指南

## 推送到 GitHub

1. 在 GitHub 创建新仓库：
   - 访问 https://github.com/new
   - 仓库名：`my-blog`（或其他名字）
   - 设为私有或公开都可以
   - **不要**勾选 "Add a README file"
   - 点击 "Create repository"

2. 复制你的仓库 URL，然后运行：

```bash
cd /Users/tiger/my-blog
git remote add origin YOUR_REPO_URL  # 替换成你的仓库地址
git branch -M main
git push -u origin main
```

## 部署到 Vercel

### 方式 A：使用 Vercel CLI（推荐）

```bash
npm install -g vercel
cd /Users/tiger/my-blog
vercel
```

按提示操作即可！

### 方式 B：使用 Vercel 网站

1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择你的 `my-blog` 仓库
5. 点击 "Deploy"

等待 1-2 分钟，你的博客就上线了！🎉

## 更新博客

以后修改代码后，只需：

```bash
git add .
git commit -m "描述你的修改"
git push
```

Vercel 会自动重新部署！
