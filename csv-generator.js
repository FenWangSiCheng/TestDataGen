/**
 * CSV生成器 - 可配置的CSV文件生成工具
 * 支持自定义列数、列名、数据格式和长度
 */

class CSVGenerator {
    constructor() {
        this.formats = new CSVFormats();
        this.isGenerating = false;
        this.shouldStop = false;
        this.lastConfig = null;
        this.currentData = null;
    }

    /**
     * 验证列配置
     */
    validateColumnConfig(columns) {
        const errors = [];

        if (!Array.isArray(columns) || columns.length === 0) {
            errors.push('至少需要配置一列');
            return errors;
        }

        columns.forEach((column, index) => {
            if (!column.name || typeof column.name !== 'string') {
                errors.push(`第${index + 1}列：列名不能为空`);
            }

            if (!column.format || typeof column.format !== 'string') {
                errors.push(`第${index + 1}列：必须指定数据格式`);
            }

            const supportedFormats = ['text', 'number', 'date', 'email', 'phone', 'boolean', 'name', 'address', 'company', 'uuid', 'ip', 'color'];
            if (column.format && !supportedFormats.includes(column.format)) {
                errors.push(`第${index + 1}列：不支持的数据格式 "${column.format}"`);
            }

            // 验证格式特定的配置
            if (column.format === 'text' && column.config && column.config.length) {
                if (column.config.length < 1 || column.config.length > 10000) {
                    errors.push(`第${index + 1}列：文本长度必须在1-10000之间`);
                }
            }

            if (column.format === 'number' && column.config) {
                if (column.config.min !== undefined && column.config.max !== undefined && column.config.min >= column.config.max) {
                    errors.push(`第${index + 1}列：数字最小值必须小于最大值`);
                }
            }
        });

        return errors;
    }

    /**
     * 验证生成配置
     */
    validateConfig(config) {
        const errors = [];

        if (!config.rows || config.rows < 1 || config.rows > 1000000) {
            errors.push('行数必须在1-1000000之间');
        }

        if (!config.columns) {
            errors.push('必须配置列信息');
        } else {
            const columnErrors = this.validateColumnConfig(config.columns);
            errors.push(...columnErrors);
        }

        return errors;
    }

    /**
     * 生成单行数据
     */
    generateRow(columns) {
        const row = [];

        columns.forEach(column => {
            const value = this.formats.generateByFormat(column.format, column.config || {});
            row.push(value);
        });

        return row;
    }

    /**
     * 将行数据转换为CSV格式
     */
    formatRowAsCSV(row) {
        return row.map(cell => {
            // 转换为字符串
            let cellValue = String(cell);
            
            // 如果包含逗号、双引号或换行符，需要用双引号包围
            if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n') || cellValue.includes('\r')) {
                // 转义双引号
                cellValue = cellValue.replace(/"/g, '""');
                // 用双引号包围
                cellValue = `"${cellValue}"`;
            }
            
            return cellValue;
        }).join(',');
    }

    /**
     * 生成CSV头部
     */
    generateCSVHeader(columns) {
        const headers = columns.map(column => column.name);
        return this.formatRowAsCSV(headers);
    }

    /**
     * 生成预览数据
     */
    generatePreview(config, previewRows = 5) {
        const errors = this.validateConfig(config);
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

        const actualPreviewRows = Math.min(config.rows, previewRows);
        const csvLines = [];

        // 添加头部
        csvLines.push(this.generateCSVHeader(config.columns));

        // 生成预览数据
        for (let i = 0; i < actualPreviewRows; i++) {
            const row = this.generateRow(config.columns);
            csvLines.push(this.formatRowAsCSV(row));
        }

        return {
            preview: csvLines,
            config: config,
            estimatedSize: this.estimateFileSize(config),
            estimatedTime: this.estimateGenerationTime(config.rows, config.columns.length)
        };
    }

    /**
     * 估算文件大小
     */
    estimateFileSize(config) {
        // 基于列数和行数估算
        const avgColumnLength = this.estimateAverageColumnLength(config.columns);
        const headerSize = config.columns.reduce((sum, col) => sum + col.name.length, 0);
        const dataSize = config.rows * config.columns.length * avgColumnLength;
        const separatorSize = config.rows * (config.columns.length - 1); // 逗号
        const lineBreakSize = config.rows * 2; // \r\n

        const totalBytes = headerSize + dataSize + separatorSize + lineBreakSize;
        return this.formatFileSize(totalBytes);
    }

    /**
     * 估算平均列长度
     */
    estimateAverageColumnLength(columns) {
        let totalLength = 0;
        
        columns.forEach(column => {
            switch (column.format) {
                case 'text':
                    totalLength += column.config?.length || 10;
                    break;
                case 'number':
                    totalLength += 8; // 平均数字长度
                    break;
                case 'date':
                    totalLength += 10; // YYYY-MM-DD
                    break;
                case 'email':
                    totalLength += 20; // 平均邮箱长度
                    break;
                case 'phone':
                    totalLength += 15; // 平均电话长度
                    break;
                case 'boolean':
                    totalLength += 5; // true/false
                    break;
                case 'name':
                    totalLength += 8; // 平均姓名长度
                    break;
                case 'address':
                    totalLength += 30; // 平均地址长度
                    break;
                case 'company':
                    totalLength += 20; // 平均公司名长度
                    break;
                case 'uuid':
                    totalLength += 36; // UUID标准长度
                    break;
                case 'ip':
                    totalLength += 15; // IPv4长度
                    break;
                case 'color':
                    totalLength += 7; // #RRGGBB
                    break;
                default:
                    totalLength += 10;
            }
        });

        return Math.ceil(totalLength / columns.length);
    }

    /**
     * 估算生成时间
     */
    estimateGenerationTime(rows, columns) {
        const complexity = columns * 0.1; // 列数影响因子
        const baseTime = rows / 1000 * 50 * complexity; // 基础时间(ms)
        
        if (baseTime < 100) return '< 0.1秒';
        if (baseTime < 1000) return `~${Math.round(baseTime)}ms`;
        return `~${(baseTime / 1000).toFixed(1)}秒`;
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
     * 同步生成CSV数据（适用于小数据量）
     */
    generateCSVSync(config) {
        const startTime = performance.now();
        const errors = this.validateConfig(config);
        
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

        const csvLines = [];
        
        // 添加头部
        csvLines.push(this.generateCSVHeader(config.columns));

        // 生成数据行
        for (let i = 0; i < config.rows; i++) {
            const row = this.generateRow(config.columns);
            csvLines.push(this.formatRowAsCSV(row));
        }

        const csvContent = csvLines.join('\n');
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        this.currentData = {
            content: csvContent,
            config: config,
            duration: duration,
            rows: config.rows,
            columns: config.columns.length,
            size: csvContent.length
        };

        return this.currentData;
    }

    /**
     * 异步生成CSV数据（适用于大数据量）
     */
    async generateCSVAsync(config, progressCallback) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            const errors = this.validateConfig(config);
            
            if (errors.length > 0) {
                reject(new Error(errors.join('; ')));
                return;
            }

            this.isGenerating = true;
            this.shouldStop = false;

            const csvLines = [];
            
            // 添加头部
            csvLines.push(this.generateCSVHeader(config.columns));

            // 批量处理参数
            const batchSize = Math.min(1000, Math.max(100, Math.floor(config.rows / 100)));
            let processed = 0;

            const processBatch = () => {
                if (this.shouldStop) {
                    this.isGenerating = false;
                    reject(new Error('生成已取消'));
                    return;
                }

                const currentBatchSize = Math.min(batchSize, config.rows - processed);

                // 生成当前批次的数据
                for (let i = 0; i < currentBatchSize; i++) {
                    const row = this.generateRow(config.columns);
                    csvLines.push(this.formatRowAsCSV(row));
                    processed++;
                }

                // 更新进度
                const progress = Math.round((processed / config.rows) * 100);
                if (progressCallback) {
                    progressCallback(progress, processed, config.rows);
                }

                if (processed >= config.rows) {
                    // 生成完成
                    const csvContent = csvLines.join('\n');
                    const endTime = performance.now();
                    const duration = Math.round(endTime - startTime);

                    this.isGenerating = false;
                    this.lastConfig = config;

                    this.currentData = {
                        content: csvContent,
                        config: config,
                        duration: duration,
                        rows: config.rows,
                        columns: config.columns.length,
                        size: csvContent.length
                    };

                    resolve(this.currentData);
                } else {
                    // 继续下一批次
                    setTimeout(processBatch, 0);
                }
            };

            // 开始第一个批次
            setTimeout(processBatch, 0);
        });
    }

    /**
     * 停止生成
     */
    stopGeneration() {
        this.shouldStop = true;
    }

    /**
     * 导出为文件
     */
    exportToFile(filename = null) {
        if (!this.currentData) {
            throw new Error('没有可导出的数据，请先生成CSV');
        }

        const defaultFilename = this.generateFilename();
        const finalFilename = filename || defaultFilename;

        // 创建Blob对象
        const blob = new Blob([this.currentData.content], { type: 'text/csv;charset=utf-8' });

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        link.style.display = 'none';

        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
            success: true,
            filename: finalFilename,
            size: this.formatFileSize(blob.size),
            rows: this.currentData.rows,
            duration: this.currentData.duration
        };
    }

    /**
     * 生成文件名
     */
    generateFilename() {
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/[:\-]/g, '')
            .replace(/\..+/, '')
            .replace('T', '_');
        
        const { rows, columns } = this.currentData;
        return `csv_data_${rows}x${columns}_${timestamp}.csv`;
    }

    /**
     * 复制到剪贴板
     */
    async copyToClipboard() {
        if (!this.currentData) {
            throw new Error('没有可复制的数据');
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(this.currentData.content);
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = this.currentData.content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (!successful) {
                    throw new Error('复制失败');
                }
            }

            return {
                success: true,
                message: `已复制 ${this.currentData.rows} 行 CSV 数据到剪贴板`,
                size: this.formatFileSize(this.currentData.size)
            };
        } catch (error) {
            throw new Error(`复制失败: ${error.message}`);
        }
    }

    /**
     * 获取当前数据统计
     */
    getStats() {
        if (!this.currentData) {
            return null;
        }

        return {
            rows: this.currentData.rows,
            columns: this.currentData.columns,
            size: this.formatFileSize(this.currentData.size),
            duration: this.currentData.duration,
            config: this.currentData.config
        };
    }

    /**
     * 获取支持的数据格式列表
     */
    getSupportedFormats() {
        return {
            text: {
                name: '文本',
                description: '随机字符串',
                config: {
                    length: '文本长度 (1-10000)',
                    type: '字符类型 (mixed/english/chinese/numbers)',
                    caseSensitive: '是否区分大小写 (true/false)'
                }
            },
            number: {
                name: '数字',
                description: '随机数字',
                config: {
                    type: '数字类型 (integer/float/currency)',
                    min: '最小值',
                    max: '最大值',
                    decimals: '小数位数'
                }
            },
            date: {
                name: '日期',
                description: '随机日期',
                config: {
                    format: '日期格式 (YYYY-MM-DD/YYYY/MM/DD/DD/MM/YYYY/MM/DD/YYYY/datetime)',
                    startDate: '开始日期',
                    endDate: '结束日期'
                }
            },
            email: {
                name: '邮箱',
                description: '随机邮箱地址',
                config: {
                    length: '用户名长度',
                    domain: '指定域名'
                }
            },
            phone: {
                name: '电话',
                description: '随机电话号码',
                config: {
                    format: '格式 (china/us/international)',
                    includeCountryCode: '包含国家代码 (true/false)'
                }
            },
            boolean: {
                name: '布尔值',
                description: '真/假值',
                config: {
                    format: '格式 (boolean/yesno/truefalse/10)',
                    probability: 'true的概率 (0-1)'
                }
            },
            name: {
                name: '姓名',
                description: '随机姓名',
                config: {
                    type: '类型 (chinese/english/full)',
                    gender: '性别 (male/female/random)'
                }
            },
            address: {
                name: '地址',
                description: '随机地址',
                config: {
                    type: '类型 (chinese/english)',
                    includePostalCode: '包含邮编 (true/false)'
                }
            },
            company: {
                name: '公司名',
                description: '随机公司名称',
                config: {
                    type: '类型 (chinese/english)'
                }
            },
            uuid: {
                name: 'UUID',
                description: '唯一标识符',
                config: {}
            },
            ip: {
                name: 'IP地址',
                description: 'IP地址',
                config: {
                    type: '类型 (ipv4/ipv6)'
                }
            },
            color: {
                name: '颜色',
                description: '随机颜色',
                config: {
                    format: '格式 (hex/rgb/hsl/name)'
                }
            }
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVGenerator;
} else {
    window.CSVGenerator = CSVGenerator;
}