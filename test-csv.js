/**
 * CSV生成器测试脚本
 * 测试各种配置和功能
 */

// 检查环境
const isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
    // Node.js环境设置
    global.window = global;
    global.document = {
        createElement: () => ({ style: {}, focus: () => {}, select: () => {} }),
        body: { appendChild: () => {}, removeChild: () => {} },
        execCommand: () => true
    };
    global.navigator = { 
        clipboard: null,
        userAgent: 'Node.js'
    };
    global.URL = { 
        createObjectURL: () => 'blob:test', 
        revokeObjectURL: () => {} 
    };
    global.Blob = class Blob {
        constructor(content, options) {
            this.content = content;
            this.size = JSON.stringify(content).length;
        }
    };
    global.performance = { now: () => Date.now() };
    global.isSecureContext = false;
    
    // 加载模块
    const CSVFormats = require('./csv-formats.js');
    const CSVGenerator = require('./csv-generator.js');
    const CSVConfig = require('./csv-config.js');
    
    global.CSVFormats = CSVFormats;
    global.CSVGenerator = CSVGenerator;
    global.CSVConfig = CSVConfig;
}

class CSVTester {
    constructor() {
        this.generator = new CSVGenerator();
        this.config = new CSVConfig();
        this.formats = new CSVFormats();
    }

    /**
     * 测试数据格式生成器
     */
    testFormats() {
        console.log('🧪 测试数据格式生成器...\n');

        const tests = [
            {
                name: '文本生成',
                format: 'text',
                config: { length: 10, type: 'english' },
                expected: (result) => typeof result === 'string' && result.length === 10
            },
            {
                name: '数字生成',
                format: 'number',
                config: { type: 'integer', min: 1, max: 100 },
                expected: (result) => Number.isInteger(result) && result >= 1 && result <= 100
            },
            {
                name: '日期生成',
                format: 'date',
                config: { format: 'YYYY-MM-DD' },
                expected: (result) => /^\d{4}-\d{2}-\d{2}$/.test(result)
            },
            {
                name: '邮箱生成',
                format: 'email',
                config: { length: 8 },
                expected: (result) => /^[a-z0-9]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(result)
            },
            {
                name: '手机号生成',
                format: 'phone',
                config: { format: 'china' },
                expected: (result) => /^1[3-9]\d{9}$/.test(result)
            },
            {
                name: '布尔值生成',
                format: 'boolean',
                config: { format: 'yesno' },
                expected: (result) => result === 'Yes' || result === 'No'
            },
            {
                name: '姓名生成',
                format: 'name',
                config: { type: 'chinese' },
                expected: (result) => typeof result === 'string' && result.length >= 2
            },
            {
                name: 'UUID生成',
                format: 'uuid',
                config: {},
                expected: (result) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result)
            },
            {
                name: 'IP地址生成',
                format: 'ip',
                config: { type: 'ipv4' },
                expected: (result) => /^(\d{1,3}\.){3}\d{1,3}$/.test(result)
            },
            {
                name: '颜色生成',
                format: 'color',
                config: { format: 'hex' },
                expected: (result) => /^#[0-9a-f]{6}$/i.test(result)
            }
        ];

        let passed = 0;
        let failed = 0;

        tests.forEach(test => {
            try {
                const result = this.formats.generateByFormat(test.format, test.config);
                if (test.expected(result)) {
                    console.log(`✅ ${test.name}: ${result}`);
                    passed++;
                } else {
                    console.log(`❌ ${test.name}: 结果不符合预期 - ${result}`);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ ${test.name}: 出现错误 - ${error.message}`);
                failed++;
            }
        });

        console.log(`\n📊 格式测试结果: ${passed} 通过, ${failed} 失败\n`);
    }

    /**
     * 测试配置管理
     */
    testConfigManagement() {
        console.log('🧪 测试配置管理...\n');

        try {
            // 初始化预设配置
            this.config.initializePresetConfigs();
            const configs = this.config.getConfigList();
            console.log(`✅ 预设配置初始化成功: ${configs.length} 个配置`);

            // 测试加载配置
            const userConfig = this.config.loadConfig('用户信息配置');
            console.log(`✅ 配置加载成功: ${userConfig.name}, ${userConfig.columns.length} 列`);

            // 测试保存自定义配置
            const customConfig = {
                name: '测试配置',
                description: '测试用的自定义配置',
                rows: 50,
                columns: [
                    { name: '测试ID', format: 'number', config: { type: 'integer', min: 1, max: 1000 } },
                    { name: '测试文本', format: 'text', config: { length: 5 } }
                ]
            };
            this.config.saveConfig('测试配置', customConfig);
            console.log('✅ 自定义配置保存成功');

            // 测试配置验证
            const validation = this.config.validateConfig(customConfig);
            if (validation.isValid) {
                console.log('✅ 配置验证通过');
            } else {
                console.log(`❌ 配置验证失败: ${validation.errors.join(', ')}`);
            }

        } catch (error) {
            console.log(`❌ 配置管理测试失败: ${error.message}`);
        }

        console.log('');
    }

    /**
     * 测试CSV生成
     */
    async testCSVGeneration() {
        console.log('🧪 测试CSV生成...\n');

        try {
            // 测试配置
            const testConfig = {
                rows: 5,
                columns: [
                    { name: 'ID', format: 'number', config: { type: 'integer', min: 1, max: 1000 } },
                    { name: '姓名', format: 'name', config: { type: 'chinese' } },
                    { name: '邮箱', format: 'email', config: { length: 6 } },
                    { name: '创建日期', format: 'date', config: { format: 'YYYY-MM-DD' } },
                    { name: '是否激活', format: 'boolean', config: { format: 'yesno' } }
                ]
            };

            // 测试预览生成
            console.log('📋 生成预览:');
            const preview = this.generator.generatePreview(testConfig, 3);
            preview.preview.forEach(line => console.log(line));
            console.log(`预估大小: ${preview.estimatedSize}, 预估时间: ${preview.estimatedTime}\n`);

            // 测试同步生成
            console.log('⚡ 同步生成测试:');
            const syncResult = this.generator.generateCSVSync(testConfig);
            console.log(`生成成功: ${syncResult.rows} 行, ${syncResult.columns} 列, 耗时 ${syncResult.duration}ms`);
            console.log('前3行数据:');
            const lines = syncResult.content.split('\n');
            lines.slice(0, 3).forEach(line => console.log(line));
            console.log('');

            // 测试异步生成（较大数据量）
            console.log('🔄 异步生成测试 (100行):');
            const asyncConfig = { ...testConfig, rows: 100 };
            const asyncResult = await this.generator.generateCSVAsync(asyncConfig, (progress, processed, total) => {
                if (progress % 25 === 0) {
                    console.log(`进度: ${progress}% (${processed}/${total})`);
                }
            });
            console.log(`异步生成成功: ${asyncResult.rows} 行, 耗时 ${asyncResult.duration}ms\n`);

        } catch (error) {
            console.log(`❌ CSV生成测试失败: ${error.message}\n`);
        }
    }

    /**
     * 测试错误处理
     */
    testErrorHandling() {
        console.log('🧪 测试错误处理...\n');

        const errorTests = [
            {
                name: '无效行数',
                config: { rows: 0, columns: [{ name: 'Test', format: 'text' }] },
                shouldFail: true
            },
            {
                name: '空列配置',
                config: { rows: 10, columns: [] },
                shouldFail: true
            },
            {
                name: '缺少列名',
                config: { rows: 10, columns: [{ format: 'text' }] },
                shouldFail: true
            },
            {
                name: '无效数据格式',
                config: { rows: 10, columns: [{ name: 'Test', format: 'invalid_format' }] },
                shouldFail: true
            },
            {
                name: '正常配置',
                config: { rows: 5, columns: [{ name: 'Test', format: 'text' }] },
                shouldFail: false
            }
        ];

        let passed = 0;
        let failed = 0;

        errorTests.forEach(test => {
            try {
                const errors = this.generator.validateConfig(test.config);
                const hasErrors = errors.length > 0;
                
                if (test.shouldFail === hasErrors) {
                    console.log(`✅ ${test.name}: 按预期${test.shouldFail ? '失败' : '成功'}`);
                    passed++;
                } else {
                    console.log(`❌ ${test.name}: 结果与预期不符`);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ ${test.name}: 测试出现异常 - ${error.message}`);
                failed++;
            }
        });

        console.log(`\n📊 错误处理测试结果: ${passed} 通过, ${failed} 失败\n`);
    }

    /**
     * 性能测试
     */
    async testPerformance() {
        console.log('🧪 测试性能...\n');

        const performanceTests = [
            { name: '小数据量 (100行)', rows: 100 },
            { name: '中等数据量 (1000行)', rows: 1000 },
            { name: '大数据量 (5000行)', rows: 5000 }
        ];

        const testConfig = {
            columns: [
                { name: 'ID', format: 'number', config: { type: 'integer', min: 1, max: 100000 } },
                { name: '姓名', format: 'name', config: { type: 'chinese' } },
                { name: '邮箱', format: 'email', config: {} },
                { name: '手机', format: 'phone', config: { format: 'china' } },
                { name: '地址', format: 'address', config: { type: 'chinese' } },
                { name: '创建时间', format: 'date', config: { format: 'datetime' } }
            ]
        };

        for (const test of performanceTests) {
            try {
                const config = { ...testConfig, rows: test.rows };
                const startTime = Date.now();
                
                if (test.rows <= 1000) {
                    const result = this.generator.generateCSVSync(config);
                    const endTime = Date.now();
                    console.log(`✅ ${test.name}: ${endTime - startTime}ms, 大小: ${this.formatFileSize(result.size)}`);
                } else {
                    const result = await this.generator.generateCSVAsync(config);
                    const endTime = Date.now();
                    console.log(`✅ ${test.name}: ${endTime - startTime}ms, 大小: ${this.formatFileSize(result.size)}`);
                }
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }

        console.log('');
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
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 开始 CSV 生成器全面测试\n');
        console.log('=' .repeat(50) + '\n');

        await this.testFormats();
        await this.testConfigManagement();
        await this.testCSVGeneration();
        await this.testErrorHandling();
        await this.testPerformance();

        console.log('🎉 所有测试完成！\n');
        console.log('=' .repeat(50));
    }
}

// 运行测试
if (isNode && require.main === module) {
    const tester = new CSVTester();
    tester.runAllTests().catch(error => {
        console.error('测试运行失败:', error.message);
        process.exit(1);
    });
} else if (!isNode && typeof window !== 'undefined') {
    window.CSVTester = CSVTester;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVTester;
}