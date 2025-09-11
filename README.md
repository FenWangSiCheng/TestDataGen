# CSV 数据生成器

一个功能强大的 CSV 文件生成工具，支持多种数据格式和自定义配置。

## 功能特性

- ✅ **多种数据格式**：支持文本、数字、日期、邮箱、电话、姓名、地址、公司名等 12+ 种数据格式
- ✅ **可配置列数和列名**：灵活定义 CSV 文件的结构
- ✅ **自定义数据长度**：为每列指定特定的数据长度和格式参数
- ✅ **预设配置**：内置用户信息、商品信息、日志记录等常用配置模板
- ✅ **高性能生成**：支持大数据量的异步生成，带进度显示
- ✅ **命令行界面**：提供便捷的 CLI 工具
- ✅ **多种导出方式**：支持文件下载、剪贴板复制等

## 安装和使用

### 基本使用

```bash
# 生成默认的 100 行 CSV 数据
node csv-cli.js generate

# 生成 1000 行数据到指定文件
node csv-cli.js generate -r 1000 -o my_data.csv

# 显示预览（不生成文件）
node csv-cli.js generate --preview -r 10

# 使用预设配置
node csv-cli.js generate -c "用户信息配置" -r 500
```

### 查看帮助和配置

```bash
# 显示帮助信息
node csv-cli.js help

# 查看所有预设配置
node csv-cli.js presets

# 查看支持的数据格式
node csv-cli.js formats
```

## 支持的数据格式

| 格式 | 描述 | 示例 |
|------|------|------|
| `text` | 随机文本字符串 | `"Hello123"`, `"测试数据"` |
| `number` | 数字（整数/浮点/货币） | `123`, `45.67`, `1234.56` |
| `date` | 日期时间 | `"2024-01-15"`, `"2024-01-15 14:30:25"` |
| `email` | 邮箱地址 | `"user123@gmail.com"` |
| `phone` | 电话号码 | `"13812345678"`, `"+86 13812345678"` |
| `boolean` | 布尔值 | `true/false`, `"Yes/No"`, `"1/0"` |
| `name` | 人名 | `"张三"`, `"John Smith"` |
| `address` | 地址 | `"北京市朝阳区XX街123号"` |
| `company` | 公司名 | `"腾讯科技有限公司"` |
| `uuid` | UUID标识符 | `"550e8400-e29b-41d4-a716-446655440000"` |
| `ip` | IP地址 | `"192.168.1.1"` |
| `color` | 颜色值 | `"#FF0000"`, `"red"` |

## 预设配置

### 1. 默认配置
基本的 4 列配置：ID、姓名、邮箱、日期

### 2. 用户信息配置
完整的用户数据：用户ID、用户名、姓名、邮箱、电话、地址、生日、状态、薪资、公司、注册时间、IP地址

### 3. 商品信息配置
电商商品数据：商品ID、商品名、分类、价格、库存、供应商、颜色、上架日期、可用性、评分

### 4. 日志记录配置
系统日志数据：日志ID、时间戳、级别、用户ID、IP地址、操作、状态码、响应时间、错误消息

## 配置格式

每个列的配置格式如下：

```json
{
  "name": "列名",
  "format": "数据格式",
  "config": {
    // 格式特定的配置选项
  }
}
```

### 配置示例

```json
{
  "rows": 1000,
  "columns": [
    {
      "name": "用户ID",
      "format": "number",
      "config": {
        "type": "integer",
        "min": 1,
        "max": 10000
      }
    },
    {
      "name": "用户名",
      "format": "text",
      "config": {
        "length": 8,
        "type": "english",
        "caseSensitive": false
      }
    },
    {
      "name": "邮箱",
      "format": "email",
      "config": {
        "length": 10
      }
    },
    {
      "name": "注册日期",
      "format": "date",
      "config": {
        "format": "YYYY-MM-DD",
        "startDate": "2020-01-01",
        "endDate": "2024-12-31"
      }
    }
  ]
}
```

## 文件结构

- `csv-formats.js` - 数据格式生成器模块
- `csv-generator.js` - 核心 CSV 生成引擎
- `csv-config.js` - 配置管理模块
- `csv-cli.js` - 命令行界面
- `test-csv.js` - 测试脚本

## 测试

运行完整测试套件：

```bash
node test-csv.js
```

测试包括：
- ✅ 数据格式生成器测试
- ✅ 配置管理测试
- ✅ CSV 生成功能测试
- ✅ 错误处理测试
- ✅ 性能测试

## 性能指标

基于测试结果：
- **小数据量 (100行)**：<1ms，文件大小约 7KB
- **中等数据量 (1000行)**：4ms，文件大小约 72KB
- **大数据量 (5000行)**：72ms，文件大小约 359KB

## 扩展开发

### 添加新的数据格式

在 `csv-formats.js` 中添加新的生成方法：

```javascript
generateCustomFormat(config = {}) {
    // 实现自定义格式生成逻辑
    return customValue;
}
```

然后在 `generateByFormat` 方法中添加对应的 case。

### 添加新的预设配置

在 `csv-config.js` 的相应方法中添加新的配置模板。

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持 12+ 种数据格式
- 提供命令行界面
- 包含 4 个预设配置
- 完整的测试套件