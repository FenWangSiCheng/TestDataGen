# 🤖 AI 数据生成工具集

专业的数据生成解决方案，支持文本、图片、CSV等多种格式数据生成。

## 🌐 在线体验

**Live Demo**: [https://testdatagen.netlify.app](https://testdatagen.netlify.app)

## ✨ 功能特性

### 🔤 文本数据生成器
- ✅ 支持数字、英文、日文、Emoji、特殊字符等多种字符类型
- ✅ 自定义邮箱格式生成
- ✅ 批量生成，支持大数据量
- ✅ 多种导出格式（TXT, CSV, JSON）

### 🖼️ 图片数据生成器  
- ✅ 支持 PNG, JPEG, WebP, BMP 格式
- ✅ 自定义图片尺寸和质量
- ✅ 丰富的颜色和图案选择（纯色、渐变、噪点、条纹）
- ✅ 批量生成多张图片

### 📊 CSV数据生成器
- ✅ 19种数据类型（文本、数字、日期、邮箱等）
- ✅ 自定义列名、长度和格式
- ✅ 6个预设模板（用户、商品、订单等）
- ✅ 支持多种编码和分隔符

## 🚀 快速开始

### 在线使用
直接访问 [https://testdatagen.netlify.app](https://testdatagen.netlify.app) 即可使用所有功能

### 本地运行
```bash
git clone https://github.com/FenWangSiCheng/TestDataGen.git
cd TestDataGen
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### CLI使用（CSV生成器）
```bash
# 生成默认CSV数据
node csv-cli.js generate

# 生成1000行数据
node csv-cli.js generate -r 1000 -o data.csv
```

## 🛠️ 技术栈

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Canvas API**: 图片生成
- **File API**: 本地文件处理
- **No Dependencies**: 无需额外框架

## 📁 项目结构

```
TestDataGen/
├── index.html              # 主页
├── text-generator/         # 文本生成工具
├── image-generator/        # 图片生成工具
├── csv-generator/          # CSV生成工具
├── csv-cli.js             # CSV命令行工具
└── netlify.toml           # 部署配置
```

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License