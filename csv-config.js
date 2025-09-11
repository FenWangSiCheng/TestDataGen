/**
 * CSV配置管理器
 * 处理配置的保存、加载和验证
 */

class CSVConfig {
    constructor() {
        this.configs = new Map();
        this.currentConfig = null;
    }

    /**
     * 创建默认配置
     */
    createDefaultConfig() {
        return {
            name: '默认配置',
            description: '基本的CSV生成配置示例',
            rows: 100,
            columns: [
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
                    name: '创建日期',
                    format: 'date',
                    config: {
                        format: 'YYYY-MM-DD',
                        startDate: '2020-01-01',
                        endDate: '2024-12-31'
                    }
                }
            ]
        };
    }

    /**
     * 创建用户信息配置
     */
    createUserInfoConfig() {
        return {
            name: '用户信息配置',
            description: '生成完整的用户信息数据',
            rows: 1000,
            columns: [
                {
                    name: 'user_id',
                    format: 'uuid',
                    config: {}
                },
                {
                    name: 'username',
                    format: 'text',
                    config: {
                        length: 8,
                        type: 'english',
                        caseSensitive: false
                    }
                },
                {
                    name: 'full_name',
                    format: 'name',
                    config: {
                        type: 'full'
                    }
                },
                {
                    name: 'email',
                    format: 'email',
                    config: {
                        length: 10
                    }
                },
                {
                    name: 'phone',
                    format: 'phone',
                    config: {
                        format: 'china',
                        includeCountryCode: false
                    }
                },
                {
                    name: 'address',
                    format: 'address',
                    config: {
                        type: 'chinese',
                        includePostalCode: true
                    }
                },
                {
                    name: 'birth_date',
                    format: 'date',
                    config: {
                        format: 'YYYY-MM-DD',
                        startDate: '1970-01-01',
                        endDate: '2005-12-31'
                    }
                },
                {
                    name: 'is_active',
                    format: 'boolean',
                    config: {
                        format: '10',
                        probability: 0.8
                    }
                },
                {
                    name: 'salary',
                    format: 'number',
                    config: {
                        type: 'currency',
                        min: 3000,
                        max: 50000,
                        decimals: 2
                    }
                },
                {
                    name: 'company',
                    format: 'company',
                    config: {
                        type: 'chinese'
                    }
                },
                {
                    name: 'registration_time',
                    format: 'date',
                    config: {
                        format: 'datetime',
                        startDate: '2020-01-01',
                        endDate: '2024-12-31'
                    }
                },
                {
                    name: 'last_login_ip',
                    format: 'ip',
                    config: {
                        type: 'ipv4'
                    }
                }
            ]
        };
    }

    /**
     * 创建商品信息配置
     */
    createProductConfig() {
        return {
            name: '商品信息配置',
            description: '电商商品数据生成配置',
            rows: 500,
            columns: [
                {
                    name: 'product_id',
                    format: 'text',
                    config: {
                        length: 10,
                        type: 'mixed'
                    }
                },
                {
                    name: 'product_name',
                    format: 'text',
                    config: {
                        length: 15,
                        type: 'chinese'
                    }
                },
                {
                    name: 'category',
                    format: 'text',
                    config: {
                        length: 8,
                        type: 'chinese'
                    }
                },
                {
                    name: 'price',
                    format: 'number',
                    config: {
                        type: 'currency',
                        min: 10,
                        max: 9999,
                        decimals: 2
                    }
                },
                {
                    name: 'stock_quantity',
                    format: 'number',
                    config: {
                        type: 'integer',
                        min: 0,
                        max: 1000
                    }
                },
                {
                    name: 'supplier',
                    format: 'company',
                    config: {
                        type: 'chinese'
                    }
                },
                {
                    name: 'color',
                    format: 'color',
                    config: {
                        format: 'name'
                    }
                },
                {
                    name: 'launch_date',
                    format: 'date',
                    config: {
                        format: 'YYYY-MM-DD',
                        startDate: '2020-01-01',
                        endDate: '2024-12-31'
                    }
                },
                {
                    name: 'is_available',
                    format: 'boolean',
                    config: {
                        format: 'yesno',
                        probability: 0.9
                    }
                },
                {
                    name: 'rating',
                    format: 'number',
                    config: {
                        type: 'float',
                        min: 1.0,
                        max: 5.0,
                        decimals: 1
                    }
                }
            ]
        };
    }

    /**
     * 创建日志记录配置
     */
    createLogConfig() {
        return {
            name: '日志记录配置',
            description: '系统日志数据生成配置',
            rows: 2000,
            columns: [
                {
                    name: 'log_id',
                    format: 'uuid',
                    config: {}
                },
                {
                    name: 'timestamp',
                    format: 'date',
                    config: {
                        format: 'datetime',
                        startDate: '2024-01-01',
                        endDate: '2024-12-31'
                    }
                },
                {
                    name: 'level',
                    format: 'text',
                    config: {
                        length: 5,
                        type: 'english'
                    }
                },
                {
                    name: 'user_id',
                    format: 'number',
                    config: {
                        type: 'integer',
                        min: 1000,
                        max: 9999
                    }
                },
                {
                    name: 'ip_address',
                    format: 'ip',
                    config: {
                        type: 'ipv4'
                    }
                },
                {
                    name: 'action',
                    format: 'text',
                    config: {
                        length: 12,
                        type: 'english'
                    }
                },
                {
                    name: 'status_code',
                    format: 'number',
                    config: {
                        type: 'integer',
                        min: 200,
                        max: 599
                    }
                },
                {
                    name: 'response_time',
                    format: 'number',
                    config: {
                        type: 'integer',
                        min: 10,
                        max: 5000
                    }
                },
                {
                    name: 'error_message',
                    format: 'text',
                    config: {
                        length: 50,
                        type: 'english'
                    }
                }
            ]
        };
    }

    /**
     * 初始化预定义配置
     */
    initializePresetConfigs() {
        const presets = [
            this.createDefaultConfig(),
            this.createUserInfoConfig(),
            this.createProductConfig(),
            this.createLogConfig()
        ];

        presets.forEach(config => {
            this.saveConfig(config.name, config);
        });

        return presets;
    }

    /**
     * 保存配置
     */
    saveConfig(name, config) {
        if (!name || typeof name !== 'string') {
            throw new Error('配置名称不能为空');
        }

        const configWithMeta = {
            ...config,
            name: name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.configs.set(name, configWithMeta);
        
        // 保存到localStorage（如果可用）
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('csv_configs', JSON.stringify(Array.from(this.configs.entries())));
            } catch (e) {
                console.warn('无法保存配置到本地存储:', e);
            }
        }

        return configWithMeta;
    }

    /**
     * 加载配置
     */
    loadConfig(name) {
        const config = this.configs.get(name);
        if (!config) {
            throw new Error(`配置 "${name}" 不存在`);
        }
        
        this.currentConfig = { ...config };
        return this.currentConfig;
    }

    /**
     * 删除配置
     */
    deleteConfig(name) {
        if (!this.configs.has(name)) {
            throw new Error(`配置 "${name}" 不存在`);
        }

        this.configs.delete(name);

        // 更新localStorage
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('csv_configs', JSON.stringify(Array.from(this.configs.entries())));
            } catch (e) {
                console.warn('无法更新本地存储:', e);
            }
        }

        return true;
    }

    /**
     * 获取所有配置列表
     */
    getConfigList() {
        return Array.from(this.configs.entries()).map(([name, config]) => ({
            name: name,
            description: config.description || '',
            rows: config.rows,
            columns: config.columns.length,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt
        }));
    }

    /**
     * 从localStorage加载配置
     */
    loadFromLocalStorage() {
        if (typeof localStorage === 'undefined') {
            return false;
        }

        try {
            const saved = localStorage.getItem('csv_configs');
            if (saved) {
                const configs = JSON.parse(saved);
                this.configs = new Map(configs);
                return true;
            }
        } catch (e) {
            console.warn('无法从本地存储加载配置:', e);
        }

        return false;
    }

    /**
     * 导出配置为JSON
     */
    exportConfig(name) {
        const config = this.configs.get(name);
        if (!config) {
            throw new Error(`配置 "${name}" 不存在`);
        }

        return JSON.stringify(config, null, 2);
    }

    /**
     * 从JSON导入配置
     */
    importConfig(jsonString, name = null) {
        try {
            const config = JSON.parse(jsonString);
            
            // 验证配置格式
            if (!config.columns || !Array.isArray(config.columns)) {
                throw new Error('无效的配置格式：缺少列配置');
            }

            if (!config.rows || typeof config.rows !== 'number') {
                throw new Error('无效的配置格式：缺少行数配置');
            }

            const configName = name || config.name || `导入配置_${Date.now()}`;
            return this.saveConfig(configName, config);
        } catch (error) {
            throw new Error(`导入配置失败: ${error.message}`);
        }
    }

    /**
     * 验证配置
     */
    validateConfig(config) {
        const errors = [];

        if (!config.rows || typeof config.rows !== 'number' || config.rows < 1) {
            errors.push('行数必须是大于0的数字');
        }

        if (!config.columns || !Array.isArray(config.columns) || config.columns.length === 0) {
            errors.push('至少需要一个列配置');
        } else {
            config.columns.forEach((column, index) => {
                if (!column.name || typeof column.name !== 'string') {
                    errors.push(`第${index + 1}列：列名不能为空`);
                }

                if (!column.format || typeof column.format !== 'string') {
                    errors.push(`第${index + 1}列：格式类型不能为空`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 克隆配置
     */
    cloneConfig(name, newName) {
        const config = this.configs.get(name);
        if (!config) {
            throw new Error(`配置 "${name}" 不存在`);
        }

        const clonedConfig = JSON.parse(JSON.stringify(config));
        clonedConfig.name = newName;
        clonedConfig.description = (clonedConfig.description || '') + ' (副本)';

        return this.saveConfig(newName, clonedConfig);
    }

    /**
     * 获取当前配置
     */
    getCurrentConfig() {
        return this.currentConfig ? { ...this.currentConfig } : null;
    }

    /**
     * 创建快速配置
     */
    createQuickConfig(rows = 100, columns = []) {
        if (columns.length === 0) {
            // 默认列配置
            columns = [
                { name: 'ID', format: 'number', config: { type: 'integer', min: 1, max: 9999 } },
                { name: 'Name', format: 'name', config: { type: 'full' } },
                { name: 'Email', format: 'email', config: {} },
                { name: 'Date', format: 'date', config: { format: 'YYYY-MM-DD' } }
            ];
        }

        return {
            name: `快速配置_${Date.now()}`,
            description: '快速生成的配置',
            rows: rows,
            columns: columns
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVConfig;
} else {
    window.CSVConfig = CSVConfig;
}