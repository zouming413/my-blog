# 如何接入足球数据 API

## 📋 已实现的功能

✅ 自动从 API 获取曼联比赛数据
✅ API 失败时自动降级到本地数据
✅ 1小时缓存，减少 API 调用
✅ 显示"实时数据"标签（当使用 API 时）

## 🚀 启用 API 数据

### 方法 1：使用 Football-Data.org（推荐，免费）

1. **申请 API Key**
   - 访问：https://www.football-data.org/
   - 注册账号（免费）
   - 获取 API Key

2. **配置环境变量**
   ```bash
   # 编辑 .env.local 文件
   nano .env.local

   # 替换你的 API Key
   NEXT_PUBLIC_FOOTBALL_DATA_API_KEY=你的实际API密钥
   ```

3. **重启开发服务器**
   ```bash
   # Ctrl+C 停止服务器
   npm run dev
   ```

### 方法 2：继续使用本地数据（不需要 API）

如果不配置 API Key，系统会自动使用 `lib/matches.js` 中的本地数据。

## 📊 API 对比

| API | 免费额度 | 优点 | 缺点 |
|-----|---------|------|------|
| **Football-Data.org** | 10次/分钟 | 完全免费、数据准确 | 请求限制较低 |
| **API-Football** | 100次/月 | 数据丰富、功能多 | 免费额度少 |
| **本地数据** | 无限制 | 简单、快速、可控 | 需要手动更新 |

## 🔧 工作原理

```
用户访问首页
    ↓
调用 /api/matches
    ↓
检查是否有 API Key
    ↓
有 → 从 Football-Data.org 获取 → 缓存1小时 → 返回数据
    ↓
没有 → 使用本地数据 → 返回数据
```

## ⚙️ 自定义配置

### 修改缓存时间

在 `app/api/matches/route.js` 中修改：

```javascript
next: { revalidate: 3600 } // 改成你想要的秒数
```

### 添加更多 API

在 `app/api/matches/route.js` 中添加新的 fetch 函数。

## 🎯 当前状态

**默认**：使用本地数据（`lib/matches.js`）

**启用 API**：配置 `NEXT_PUBLIC_FOOTBALL_DATA_API_KEY`

## 💡 建议

对于个人博客，**本地数据足够了**：
- ✅ 完全免费
- ✅ 完全控制
- ✅ 没有请求限制
- ✅ 更新简单（编辑文件即可）

只有在需要**完全自动化**时才需要 API。
