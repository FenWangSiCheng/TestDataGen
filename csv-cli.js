#!/usr/bin/env node

/**
 * CSV生成器命令行界面
 * 支持通过命令行参数生成CSV文件
 */

// 检查是否在Node.js环境中运行
const isNode = typeof module !== 'undefined' && module.exports;

let fs, path;

if (isNode) {
    // Node.js环境
    fs = require('fs');
    path = require('path');
    
    // 模拟浏览器环境的全局对象
    global.window = global;
    global.document = {
        createElement: () => ({}),
        body: { appendChild: () => {}, removeChild: () => {} }
    };
    global.navigator = { clipboard: null };
    global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
    global.Blob = class Blob {
        constructor(content, options) {
            this.content = content;
            this.size = JSON.stringify(content).length;
        }
    };
    global.performance = { now: () => Date.now() };
    
    // 加载依赖模块
    const CSVFormats = require('./csv-formats.js');
    const CSVGenerator = require('./csv-generator.js');
    const CSVConfig = require('./csv-config.js');
    
    global.CSVFormats = CSVFormats;
    global.CSVGenerator = CSVGenerator;
    global.CSVConfig = CSVConfig;
}

class CSVCommandLine {
    constructor() {
        this.generator = new CSVGenerator();
        this.config = new CSVConfig();
        this.args = this.parseArgs();
    }

    /**
     * 解析命令行参数
     */
    parseArgs() {
        if (!isNode) {
            return {};
        }

        const args = process.argv.slice(2);
        const parsed = {
            command: args[0] || 'help',
            options: {}
        };

        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const [key, value] = arg.substring(2).split('=');
                parsed.options[key] = value || true;
            } else if (arg.startsWith('-')) {
                const key = arg.substring(1);
                const value = args[i + 1] && !args[i + 1].startsWith('-') ? args[++i] : true;
                parsed.options[key] = value;
            }
        }

        return parsed;
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        const help = `
CSV Generator CLI - 可配置的CSV数据生成工具

用法:
  node csv-cli.js <command> [options]

命令:
  help                     显示此帮助信息
  generate                 生成CSV文件
  config                   配置管理
  formats                  显示支持的数据格式
  presets                  显示预设配置

生成选项:
  -r, --rows <number>      生成行数 (默认: 100)
  -o, --output <file>      输出文件名 (默认: 自动生成)
  -c, --config <name>      使用指定配置
  --preview                仅显示预览，不生成文件
  
列配置选项:
  --columns <json>         列配置的JSON字符串
  
示例:
  # 使用默认配置生成100行数据
  node csv-cli.js generate
  
  # 生成1000行数据到指定文件
  node csv-cli.js generate -r 1000 -o my_data.csv
  
  # 使用预设配置
  node csv-cli.js generate -c "用户信息配置" -r 500
  
  # 自定义列配置
  node csv-cli.js generate --columns '[{"name":"ID","format":"number","config":{"type":"integer","min":1,"max":1000}},{"name":"姓名","format":"name","config":{"type":"chinese"}}]'
  
  # 显示预览
  node csv-cli.js generate --preview -r 10
  
  # 显示所有预设配置
  node csv-cli.js presets
  
  # 显示支持的数据格式
  node csv-cli.js formats
`;
        console.log(help);
    }

    /**
     * 显示支持的数据格式
     */
    showFormats() {
        const formats = this.generator.getSupportedFormats();
        
        console.log('支持的数据格式:\n');
        Object.entries(formats).forEach(([key, format]) => {
            console.log(`${key.padEnd(12)} - ${format.name}: ${format.description}`);
            
            if (Object.keys(format.config).length > 0) {
                console.log('    配置选项:');
                Object.entries(format.config).forEach(([configKey, description]) => {
                    console.log(`      ${configKey}: ${description}`);
                });
            }
            console.log('');
        });
    }

    /**
     * 显示预设配置
     */
    showPresets() {
        this.config.initializePresetConfigs();
        const configs = this.config.getConfigList();
        
        console.log('预设配置:\n');
        configs.forEach(config => {
            console.log(`名称: ${config.name}`);
            console.log(`描述: ${config.description}`);
            console.log(`行数: ${config.rows}`);
            console.log(`列数: ${config.columns}`);
            console.log('---');
        });
    }

    /**
     * 创建默认列配置
     */
    createDefaultColumns() {
        return [
            {
                name: 'ID',
                format: 'number',
                config: {
                    type: 'integer',
                    min: 1,
                    max: 10000
                }
            },
            {
                name: '姓名',
                format: 'name',
                config: {
                    type: 'chinese'
                }
            },
            {
                name: '邮箱',
                format: 'email',
                config: {
                    length: 8
                }
            },
            {
                name: '日期',
                format: 'date',
                config: {
                    format: 'YYYY-MM-DD',
                    startDate: '2020-01-01',
                    endDate: '2024-12-31'
                }
            }
        ];
    }

    /**
     * 生成CSV数据
     */
    async generateCSV() {
        try {
            const options = this.args.options;
            let config = {};

            // 行数设置
            config.rows = parseInt(options.rows || options.r) || 100;

            // 列配置
            if (options.columns) {
                try {
                    config.columns = JSON.parse(options.columns);
                } catch (error) {
                    console.error('列配置JSON格式错误:', error.message);
                    return;
                }
            } else if (options.config || options.c) {
                // 使用预设配置
                const configName = options.config || options.c;
                this.config.initializePresetConfigs();
                try {
                    const presetConfig = this.config.loadConfig(configName);
                    config = presetConfig;
                } catch (error) {
                    console.error(`加载配置失败: ${error.message}`);
                    console.log('可用的预设配置:');
                    this.showPresets();
                    return;
                }
            } else {
                // 使用默认列配置
                config.columns = this.createDefaultColumns();
            }

            // 仅预览
            if (options.preview) {
                console.log('CSV数据预览:\n');
                const preview = this.generator.generatePreview(config, 10);
                preview.preview.forEach(line => console.log(line));
                console.log(`\n预估文件大小: ${preview.estimatedSize}`);
                console.log(`预估生成时间: ${preview.estimatedTime}`);
                return;
            }

            // 生成数据
            console.log(`开始生成 ${config.rows} 行 CSV 数据...`);
            
            const startTime = Date.now();
            let result;
            
            if (config.rows > 5000) {
                // 大数据量异步生成
                result = await this.generator.generateCSVAsync(config, (progress, processed, total) => {
                    process.stdout.write(`\r进度: ${progress}% (${processed}/${total})`);
                });
                console.log(''); // 换行
            } else {
                // 小数据量同步生成
                result = this.generator.generateCSVSync(config);
            }

            // 保存文件
            const outputFile = options.output || options.o || this.generator.generateFilename();
            
            if (isNode) {
                fs.writeFileSync(outputFile, result.content, 'utf8');
                
                const stats = fs.statSync(outputFile);
                console.log(`\n✅ CSV文件生成成功!`);
                console.log(`文件名: ${outputFile}`);
                console.log(`文件大小: ${this.formatFileSize(stats.size)}`);
                console.log(`数据行数: ${result.rows}`);
                console.log(`数据列数: ${result.columns}`);
                console.log(`生成耗时: ${result.duration}ms`);
            } else {
                // 浏览器环境下载文件
                this.generator.exportToFile(outputFile);
            }

        } catch (error) {
            console.error('生成CSV文件失败:', error.message);
        }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 配置管理
     */
    handleConfigCommand() {
        // 简单的配置管理命令
        console.log('配置管理功能：');
        console.log('- 使用 presets 命令查看所有预设配置');
        console.log('- 使用 generate -c "配置名称" 来使用预设配置');
        console.log('- 使用 --columns 参数传入自定义列配置JSON');
    }

    /**
     * 执行命令
     */
    async run() {
        if (!isNode && typeof window !== 'undefined') {
            console.log('CSV Generator CLI - 在浏览器中运行');
            // 浏览器环境的处理逻辑
            return;
        }

        switch (this.args.command) {
            case 'help':
                this.showHelp();
                break;
            case 'generate':
                await this.generateCSV();
                break;
            case 'formats':
                this.showFormats();
                break;
            case 'presets':
                this.showPresets();
                break;
            case 'config':
                this.handleConfigCommand();
                break;
            default:
                console.log(`未知命令: ${this.args.command}`);
                this.showHelp();
        }
    }
}

// 如果直接运行此文件
if (isNode && require.main === module) {
    const cli = new CSVCommandLine();
    cli.run().catch(error => {
        console.error('CLI运行出错:', error.message);
        process.exit(1);
    });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVCommandLine;
} else {
    window.CSVCommandLine = CSVCommandLine;
}