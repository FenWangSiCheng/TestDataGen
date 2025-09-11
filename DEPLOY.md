# 🚀 Netlify 部署指南

## 快速部署

### 方式一：通过 GitHub 连接（推荐）

1. **访问 Netlify**
   - 打开 https://netlify.com
   - 注册或登录 Netlify 账号

2. **连接 GitHub 仓库**
   - 点击 "New site from Git"
   - 选择 "GitHub" 
   - 授权 Netlify 访问您的 GitHub
   - 选择 `FenWangSiCheng/TestDataGen` 仓库

3. **部署配置**
   - **Branch to deploy**: `main`
   - **Build command**: 留空 (纯静态网站)
   - **Publish directory**: `.` (项目根目录)
   - 点击 "Deploy site"

4. **自动部署完成**
   - Netlify 会自动检测到 `netlify.toml` 配置文件
   - 几分钟后部署完成，获得类似 `https://amazing-app-123456.netlify.app` 的URL

### 方式二：手动上传

1. **准备部署包**
   ```bash
   # 创建部署包（排除不必要的文件）
   cd /Users/wangsicheng/Desktop/ai_agent
   zip -r testdatagen-deploy.zip . -x "*.git*" "test-emoji.html" "emoji-test-simple.html" "node_modules/*" ".DS_Store"
   ```

2. **Netlify 拖拽部署**
   - 访问 https://app.netlify.com/drop
   - 直接拖拽整个项目文件夹到页面
   - 等待上传和部署完成

## 🛠️ 部署配置说明

### netlify.toml 配置
- ✅ 发布目录：项目根目录
- ✅ 无需构建命令（纯前端）
- ✅ 缓存策略优化
- ✅ 安全头部设置
- ✅ 资源压缩

### 路由配置
- ✅ 主页：`/` → `index.html`
- ✅ 文本工具：`/text-generator` → `text-generator/index.html`
- ✅ 图片工具：`/image-generator` → `image-generator/index.html`  
- ✅ CSV工具：`/csv-generator` → `csv-generator/index.html`

## 🎯 部署后测试

部署完成后，请访问以下URL测试：

1. **主页**: `https://your-site.netlify.app/`
2. **文本生成工具**: `https://your-site.netlify.app/text-generator/`
3. **图片生成工具**: `https://your-site.netlify.app/image-generator/`
4. **CSV生成工具**: `https://your-site.netlify.app/csv-generator/`

## 🔧 自定义域名（可选）

1. 在 Netlify 控制台点击 "Domain settings"
2. 点击 "Add custom domain"
3. 输入您的域名（如：`testdatagen.yourdomain.com`）
4. 按照提示配置 DNS 记录

## 📈 持续部署

- ✅ GitHub 推送自动触发部署
- ✅ Pull Request 自动预览
- ✅ 分支部署支持
- ✅ 回滚功能

每次推送到 `main` 分支都会自动重新部署！

## 🚨 常见问题

**Q: 页面显示 404**
A: 检查 `_redirects` 文件是否正确配置

**Q: CSS/JS 文件加载失败** 
A: 确保相对路径正确，Netlify会自动处理

**Q: Emoji 显示问题**
A: 已修复，所有现代浏览器都应该正常显示

**Q: 如何更新网站**
A: 只需推送代码到 GitHub，Netlify 会自动更新