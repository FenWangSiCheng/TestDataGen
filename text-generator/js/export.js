/**
 * 导出功能模块
 * 支持多种格式的数据导出：复制、TXT、CSV、JSON
 */

class ExportManager {
    constructor() {
        this.currentData = null;
        this.lastExportTime = null;
    }

    /**
     * 设置要导出的数据
     */
    setData(data) {
        this.currentData = data;
    }

    /**
     * 复制到剪贴板
     */
    async copyToClipboard() {
        if (!this.currentData || !this.currentData.data) {
            throw new Error('没有可复制的数据');
        }

        const textData = this.currentData.data.join('\n');
        
        try {
            // 使用现代 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textData);
            } else {
                // 降级方案：使用传统方法
                const textArea = document.createElement('textarea');
                textArea.value = textData;
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
                message: `已复制 ${this.currentData.data.length} 条数据到剪贴板`,
                count: this.currentData.data.length
            };
        } catch (error) {
            throw new Error(`复制失败: ${error.message}`);
        }
    }

    /**
     * 生成文件名
     */
    generateFileName(prefix, extension) {
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/[:\-]/g, '')
            .replace(/\..+/, '')
            .replace('T', '_');
        
        const { count, length } = this.currentData.config;
        return `${prefix}_${count}条_长度${length}_${timestamp}.${extension}`;
    }

    /**
     * 下载文件的通用方法
     */
    downloadFile(content, filename, mimeType) {
        try {
            // 创建 Blob 对象
            const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            
            // 清理
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.lastExportTime = new Date();
            
            return {
                success: true,
                message: `文件 ${filename} 下载成功`,
                filename: filename,
                size: this.formatFileSize(blob.size)
            };
        } catch (error) {
            throw new Error(`文件下载失败: ${error.message}`);
        }
    }

    /**
     * 下载为TXT文件
     */
    downloadAsTxt() {
        if (!this.currentData || !this.currentData.data) {
            throw new Error('没有可导出的数据');
        }

        const filename = this.generateFileName('textgen_data', 'txt');
        
        // 生成文件内容
        let content = '';
        content += `# 文本数据生成结果\n`;
        content += `# 生成时间: ${new Date().toLocaleString()}\n`;
        content += `# 数据个数: ${this.currentData.data.length}\n`;
        content += `# 数据长度: ${this.currentData.config.length}\n`;
        content += `# 字符类型: ${this.currentData.config.selectedTypes.join(', ')}\n`;
        content += `# 生成耗时: ${this.currentData.duration}ms\n`;
        content += `\n`;
        
        // 添加数据内容
        this.currentData.data.forEach((item, index) => {
            content += `${index + 1}. ${item}\n`;
        });

        return this.downloadFile(content, filename, 'text/plain');
    }

    /**
     * 下载为CSV文件
     */
    downloadAsCsv() {
        if (!this.currentData || !this.currentData.data) {
            throw new Error('没有可导出的数据');
        }

        const filename = this.generateFileName('textgen_data', 'csv');
        
        // 生成CSV内容
        let csvContent = '';
        
        // CSV头部信息
        csvContent += `"序号","文本内容","长度","生成时间"\n`;
        
        // CSV数据行
        const generateTime = new Date().toLocaleString();
        this.currentData.data.forEach((item, index) => {
            // 处理CSV中的特殊字符
            const escapedItem = `"${item.replace(/"/g, '""')}"`;
            csvContent += `${index + 1},${escapedItem},${item.length},"${generateTime}"\n`;
        });

        return this.downloadFile(csvContent, filename, 'text/csv');
    }

    /**
     * 下载为JSON文件
     */
    downloadAsJson() {
        if (!this.currentData || !this.currentData.data) {
            throw new Error('没有可导出的数据');
        }

        const filename = this.generateFileName('textgen_data', 'json');
        
        // 生成JSON内容
        const jsonData = {
            metadata: {
                title: '文本数据生成结果',
                generateTime: new Date().toISOString(),
                count: this.currentData.data.length,
                config: this.currentData.config,
                duration: this.currentData.duration,
                poolInfo: this.currentData.poolInfo,
                version: '1.0'
            },
            data: this.currentData.data.map((item, index) => ({
                id: index + 1,
                text: item,
                length: item.length,
                charset: this.analyzeCharset(item)
            }))
        };

        const jsonContent = JSON.stringify(jsonData, null, 2);
        return this.downloadFile(jsonContent, filename, 'application/json');
    }

    /**
     * 分析文本的字符集组成
     */
    analyzeCharset(text) {
        const charset = {
            numbers: 0,
            english: 0,
            japanese: 0,
            emoji: 0,
            special: 0,
            other: 0
        };

        for (const char of text) {
            const code = char.charCodeAt(0);
            
            if (/\d/.test(char)) {
                charset.numbers++;
            } else if (/[a-zA-Z]/.test(char)) {
                charset.english++;
            } else if (code >= 0x3041 && code <= 0x9FAF) {
                // 日文范围（平假名、片假名、汉字）
                charset.japanese++;
            } else if (code >= 0x1F600 && code <= 0x1F64F || 
                      code >= 0x1F300 && code <= 0x1F5FF ||
                      code >= 0x1F680 && code <= 0x1F6FF ||
                      code >= 0x1F700 && code <= 0x1F77F ||
                      code >= 0x1F780 && code <= 0x1F7FF ||
                      code >= 0x1F800 && code <= 0x1F8FF ||
                      code >= 0x1F900 && code <= 0x1F9FF ||
                      code >= 0x1FA00 && code <= 0x1FA6F ||
                      code >= 0x1FA70 && code <= 0x1FAFF ||
                      code >= 0x2600 && code <= 0x26FF ||
                      code >= 0x2700 && code <= 0x27BF) {
                charset.emoji++;
            } else if (/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?`~\\\/]/.test(char)) {
                charset.special++;
            } else {
                charset.other++;
            }
        }

        return charset;
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
     * 获取数据统计信息
     */
    getDataStats() {
        if (!this.currentData || !this.currentData.data) {
            return null;
        }

        const data = this.currentData.data;
        const totalChars = data.reduce((sum, item) => sum + item.length, 0);
        const avgLength = Math.round(totalChars / data.length * 100) / 100;
        
        // 字符集分析
        const totalCharset = {
            numbers: 0,
            english: 0,
            japanese: 0,
            emoji: 0,
            special: 0,
            other: 0
        };

        data.forEach(item => {
            const charset = this.analyzeCharset(item);
            Object.keys(charset).forEach(key => {
                totalCharset[key] += charset[key];
            });
        });

        return {
            count: data.length,
            totalChars,
            avgLength,
            charset: totalCharset,
            config: this.currentData.config,
            duration: this.currentData.duration,
            estimatedSize: {
                txt: this.formatFileSize(totalChars * 2), // 估算TXT大小
                csv: this.formatFileSize(totalChars * 3), // 估算CSV大小  
                json: this.formatFileSize(totalChars * 4) // 估算JSON大小
            }
        };
    }

    /**
     * 批量导出 (所有格式)
     */
    async exportAll() {
        if (!this.currentData || !this.currentData.data) {
            throw new Error('没有可导出的数据');
        }

        const results = [];
        const errors = [];

        // 尝试导出所有格式
        try {
            results.push({
                format: 'TXT',
                result: this.downloadAsTxt()
            });
        } catch (error) {
            errors.push({ format: 'TXT', error: error.message });
        }

        try {
            results.push({
                format: 'CSV', 
                result: this.downloadAsCsv()
            });
        } catch (error) {
            errors.push({ format: 'CSV', error: error.message });
        }

        try {
            results.push({
                format: 'JSON',
                result: this.downloadAsJson()
            });
        } catch (error) {
            errors.push({ format: 'JSON', error: error.message });
        }

        return { results, errors };
    }

    /**
     * 验证导出权限和环境
     */
    validateExportEnvironment() {
        const issues = [];

        // 检查文件下载支持
        if (!window.Blob) {
            issues.push('浏览器不支持文件下载功能');
        }

        // 检查剪贴板支持
        if (!navigator.clipboard && !document.execCommand) {
            issues.push('浏览器不支持剪贴板操作');
        }

        // 检查安全上下文（HTTPS）
        if (navigator.clipboard && !window.isSecureContext) {
            issues.push('剪贴板功能需要安全上下文(HTTPS)');
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }
}

// 创建全局实例
window.exportManager = new ExportManager();