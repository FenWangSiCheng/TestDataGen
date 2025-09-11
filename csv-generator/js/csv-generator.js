/**
 * CSV数据生成引擎 - 核心生成算法
 * 支持多种数据类型和格式的CSV文件生成
 */

class CSVGenerator {
    constructor() {
        this.columns = [];
        this.generatedData = null;
        this.isGenerating = false;
        
        // 支持的数据类型
        this.dataTypes = {
            text: '文本',
            number: '数字',
            integer: '整数',
            decimal: '小数',
            boolean: '布尔值',
            date: '日期',
            datetime: '日期时间',
            time: '时间',
            email: '邮箱',
            phone: '手机号',
            name: '姓名',
            address: '地址',
            company: '公司名',
            url: '网址',
            ip: 'IP地址',
            uuid: 'UUID',
            id: 'ID序号',
            enum: '枚举值',
            json: 'JSON对象'
        };

        // 预定义数据集
        this.dataSets = {
            names: {
                chinese: ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八', '韩十九', '杨二十'],
                english: ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emma', 'James', 'Anna', 'Robert', 'Mary', 'William', 'Jennifer', 'Richard', 'Linda', 'Charles', 'Barbara']
            },
            companies: ['阿里巴巴', '腾讯', '百度', '字节跳动', '美团', '滴滴', '小米', '华为', '京东', '网易', '搜狐', '新浪', '360', '金山', '联想', '海尔', '格力', '美的'],
            cities: ['北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '成都', '武汉', '重庆', '西安', '天津', '青岛', '大连', '沈阳', '长沙', '郑州', '济南'],
            domains: ['gmail.com', '163.com', '126.com', 'qq.com', 'sina.com', 'sohu.com', 'yahoo.com', 'hotmail.com', 'outlook.com', '139.com'],
            words: ['苹果', '香蕉', '橙子', '葡萄', '西瓜', '草莓', '蓝莓', '樱桃', '桃子', '梨子', '柠檬', '芒果', '猕猴桃', '火龙果', '榴莲', '椰子']
        };
    }

    /**
     * 设置列配置
     */
    setColumns(columns) {
        this.columns = columns.map(col => ({ ...col }));
    }

    /**
     * 获取列配置
     */
    getColumns() {
        return this.columns.map(col => ({ ...col }));
    }

    /**
     * 添加列
     */
    addColumn(column) {
        this.columns.push({ ...column });
    }

    /**
     * 删除列
     */
    removeColumn(index) {
        if (index >= 0 && index < this.columns.length) {
            this.columns.splice(index, 1);
        }
    }

    /**
     * 更新列
     */
    updateColumn(index, column) {
        if (index >= 0 && index < this.columns.length) {
            this.columns[index] = { ...column };
        }
    }

    /**
     * 验证列配置
     */
    validateColumns(columns) {
        const errors = [];
        
        if (!columns || columns.length === 0) {
            errors.push('至少需要配置一列数据');
            return errors;
        }

        columns.forEach((col, index) => {
            if (!col.name || col.name.trim() === '') {
                errors.push(`第${index + 1}列：列名不能为空`);
            }
            
            if (!col.type || !this.dataTypes[col.type]) {
                errors.push(`第${index + 1}列：数据类型无效`);
            }
            
            if (col.type === 'text' && col.length && (col.length < 1 || col.length > 1000)) {
                errors.push(`第${index + 1}列：文本长度必须在1-1000之间`);
            }
            
            if (col.type === 'number' && col.min !== undefined && col.max !== undefined && col.min > col.max) {
                errors.push(`第${index + 1}列：最小值不能大于最大值`);
            }
            
            if (col.type === 'enum' && (!col.values || col.values.length === 0)) {
                errors.push(`第${index + 1}列：枚举类型必须定义可选值`);
            }
        });

        return errors;
    }

    /**
     * 生成CSV数据
     */
    async generateCSV(rowCount, options = {}) {
        if (this.isGenerating) {
            throw new Error('正在生成中，请稍候...');
        }

        const errors = this.validateColumns(this.columns);
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }

        try {
            this.isGenerating = true;
            const startTime = Date.now();

            const data = await this.generateData(rowCount, options);
            const csvContent = this.formatAsCSV(data, options);
            
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.generatedData = {
                data: data,
                csvContent: csvContent,
                rowCount: rowCount,
                columnCount: this.columns.length,
                duration: duration,
                size: this.calculateSize(csvContent),
                timestamp: Date.now()
            };

            return this.generatedData;

        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * 生成数据行
     */
    async generateData(rowCount, options = {}) {
        const data = [];
        const batchSize = 1000; // 批量处理大小
        
        for (let i = 0; i < rowCount; i++) {
            const row = {};
            
            this.columns.forEach(col => {
                row[col.name] = this.generateCellValue(col, i);
            });
            
            data.push(row);
            
            // 每批次后让出控制权，避免阻塞UI
            if (i > 0 && i % batchSize === 0) {
                if (options.progressCallback) {
                    const progress = Math.floor((i / rowCount) * 100);
                    options.progressCallback(progress, i, rowCount);
                }
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        if (options.progressCallback) {
            options.progressCallback(100, rowCount, rowCount);
        }

        return data;
    }

    /**
     * 生成单元格数据
     */
    generateCellValue(column, rowIndex) {
        const { type, ...config } = column;
        
        switch (type) {
            case 'text':
                return this.generateText(config);
            case 'number':
                return this.generateNumber(config);
            case 'integer':
                return this.generateInteger(config);
            case 'decimal':
                return this.generateDecimal(config);
            case 'boolean':
                return this.generateBoolean(config);
            case 'date':
                return this.generateDate(config);
            case 'datetime':
                return this.generateDateTime(config);
            case 'time':
                return this.generateTime(config);
            case 'email':
                return this.generateEmail(config);
            case 'phone':
                return this.generatePhone(config);
            case 'name':
                return this.generateName(config);
            case 'address':
                return this.generateAddress(config);
            case 'company':
                return this.generateCompany(config);
            case 'url':
                return this.generateURL(config);
            case 'ip':
                return this.generateIP(config);
            case 'uuid':
                return this.generateUUID();
            case 'id':
                return this.generateID(config, rowIndex);
            case 'enum':
                return this.generateEnum(config);
            case 'json':
                return this.generateJSON(config);
            default:
                return '';
        }
    }

    /**
     * 生成文本
     */
    generateText(config) {
        const length = config.length || 10;
        const charset = config.charset || 'mixed'; // latin, chinese, mixed
        
        let chars = '';
        switch (charset) {
            case 'latin':
                chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                break;
            case 'chinese':
                chars = '的一是在不了有和人这中大为上个国我以要他时来用于生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严首底液官德调随病苏失尔死讲配女黄推易早';
                break;
            case 'mixed':
            default:
                chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789的一是在不了有和人这中大为上个国我以要他';
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 生成数字
     */
    generateNumber(config) {
        const min = config.min || 0;
        const max = config.max || 100;
        const decimals = config.decimals || 0;
        
        const value = Math.random() * (max - min) + min;
        return decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.floor(value);
    }

    /**
     * 生成整数
     */
    generateInteger(config) {
        const min = config.min || 0;
        const max = config.max || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 生成小数
     */
    generateDecimal(config) {
        const min = config.min || 0;
        const max = config.max || 100;
        const decimals = config.decimals || 2;
        
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    }

    /**
     * 生成布尔值
     */
    generateBoolean(config) {
        const format = config.format || 'boolean'; // boolean, number, text
        const trueValue = config.trueValue || 'true';
        const falseValue = config.falseValue || 'false';
        
        const value = Math.random() < 0.5;
        
        switch (format) {
            case 'number':
                return value ? 1 : 0;
            case 'text':
                return value ? trueValue : falseValue;
            case 'boolean':
            default:
                return value;
        }
    }

    /**
     * 生成日期
     */
    generateDate(config) {
        const format = config.format || 'YYYY-MM-DD';
        const startDate = config.startDate ? new Date(config.startDate) : new Date(2020, 0, 1);
        const endDate = config.endDate ? new Date(config.endDate) : new Date();
        
        const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
        const date = new Date(randomTime);
        
        return this.formatDate(date, format);
    }

    /**
     * 生成日期时间
     */
    generateDateTime(config) {
        const format = config.format || 'YYYY-MM-DD HH:mm:ss';
        const startDate = config.startDate ? new Date(config.startDate) : new Date(2020, 0, 1);
        const endDate = config.endDate ? new Date(config.endDate) : new Date();
        
        const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
        const date = new Date(randomTime);
        
        return this.formatDate(date, format);
    }

    /**
     * 生成时间
     */
    generateTime(config) {
        const format = config.format || 'HH:mm:ss';
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const seconds = Math.floor(Math.random() * 60);
        
        const date = new Date();
        date.setHours(hours, minutes, seconds, 0);
        
        return this.formatDate(date, format);
    }

    /**
     * 生成邮箱
     */
    generateEmail(config) {
        const domains = config.domains || this.dataSets.domains;
        const usernameLength = config.usernameLength || 8;
        
        const username = this.generateText({ length: usernameLength, charset: 'latin' }).toLowerCase();
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        return `${username}@${domain}`;
    }

    /**
     * 生成手机号
     */
    generatePhone(config) {
        const format = config.format || 'china'; // china, us, custom
        
        switch (format) {
            case 'china':
                const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
                const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
                return prefix + suffix;
            case 'us':
                return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            default:
                return config.pattern ? this.generateByPattern(config.pattern) : '1234567890';
        }
    }

    /**
     * 生成姓名
     */
    generateName(config) {
        const type = config.type || 'chinese'; // chinese, english
        const names = this.dataSets.names[type] || this.dataSets.names.chinese;
        
        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * 生成地址
     */
    generateAddress(config) {
        const cities = this.dataSets.cities;
        const city = cities[Math.floor(Math.random() * cities.length)];
        const district = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '石景山区', '门头沟区', '房山区'][Math.floor(Math.random() * 8)];
        const street = ['中山路', '人民路', '解放路', '建设路', '胜利路', '和平路', '友谊路', '光明路'][Math.floor(Math.random() * 8)];
        const number = Math.floor(Math.random() * 999) + 1;
        
        return `${city}${district}${street}${number}号`;
    }

    /**
     * 生成公司名
     */
    generateCompany(config) {
        return this.dataSets.companies[Math.floor(Math.random() * this.dataSets.companies.length)];
    }

    /**
     * 生成URL
     */
    generateURL(config) {
        const protocols = ['http', 'https'];
        const domains = ['example.com', 'test.com', 'demo.org', 'sample.net'];
        const paths = ['', '/home', '/about', '/contact', '/products', '/services'];
        
        const protocol = protocols[Math.floor(Math.random() * protocols.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const path = paths[Math.floor(Math.random() * paths.length)];
        
        return `${protocol}://${domain}${path}`;
    }

    /**
     * 生成IP地址
     */
    generateIP(config) {
        const version = config.version || 'v4'; // v4, v6
        
        if (version === 'v6') {
            const segments = [];
            for (let i = 0; i < 8; i++) {
                segments.push(Math.floor(Math.random() * 65536).toString(16));
            }
            return segments.join(':');
        } else {
            const segments = [];
            for (let i = 0; i < 4; i++) {
                segments.push(Math.floor(Math.random() * 256));
            }
            return segments.join('.');
        }
    }

    /**
     * 生成UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 生成ID序号
     */
    generateID(config, rowIndex) {
        const start = config.start || 1;
        const step = config.step || 1;
        const prefix = config.prefix || '';
        const suffix = config.suffix || '';
        const padding = config.padding || 0;
        
        const id = start + (rowIndex * step);
        const paddedId = padding > 0 ? id.toString().padStart(padding, '0') : id.toString();
        
        return prefix + paddedId + suffix;
    }

    /**
     * 生成枚举值
     */
    generateEnum(config) {
        const values = config.values || ['选项1', '选项2', '选项3'];
        return values[Math.floor(Math.random() * values.length)];
    }

    /**
     * 生成JSON对象
     */
    generateJSON(config) {
        const template = config.template || { key: 'value' };
        
        // 简单的JSON生成，可以根据需要扩展
        const result = {};
        Object.keys(template).forEach(key => {
            const value = template[key];
            if (typeof value === 'string' && value.startsWith('$')) {
                // 处理变量
                switch (value) {
                    case '$random_number':
                        result[key] = Math.floor(Math.random() * 100);
                        break;
                    case '$random_string':
                        result[key] = this.generateText({ length: 8, charset: 'latin' });
                        break;
                    default:
                        result[key] = value;
                }
            } else {
                result[key] = value;
            }
        });
        
        return JSON.stringify(result);
    }

    /**
     * 格式化日期
     */
    formatDate(date, format) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * 格式化为CSV
     */
    formatAsCSV(data, options = {}) {
        const separator = options.separator || ',';
        const includeHeader = options.includeHeader !== false;
        const encoding = options.encoding || 'utf-8';
        
        let csv = '';
        
        // 添加表头
        if (includeHeader && this.columns.length > 0) {
            const headers = this.columns.map(col => this.escapeCSVValue(col.name, separator));
            csv += headers.join(separator) + '\n';
        }
        
        // 添加数据行
        data.forEach(row => {
            const values = this.columns.map(col => {
                const value = row[col.name];
                return this.escapeCSVValue(value, separator);
            });
            csv += values.join(separator) + '\n';
        });
        
        return csv;
    }

    /**
     * 转义CSV值
     */
    escapeCSVValue(value, separator) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const strValue = String(value);
        
        // 如果包含分隔符、双引号或换行符，需要用双引号包围并转义内部双引号
        if (strValue.includes(separator) || strValue.includes('"') || strValue.includes('\n') || strValue.includes('\r')) {
            return '"' + strValue.replace(/"/g, '""') + '"';
        }
        
        return strValue;
    }

    /**
     * 计算文件大小
     */
    calculateSize(content) {
        const bytes = new Blob([content]).size;
        
        if (bytes < 1024) {
            return `${bytes}B`;
        } else if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)}KB`;
        } else {
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        }
    }

    /**
     * 下载CSV文件
     */
    downloadCSV(filename = null, encoding = 'utf-8') {
        if (!this.generatedData) {
            throw new Error('没有可下载的数据，请先生成CSV');
        }
        
        const name = filename || `csv_data_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.csv`;
        let content = this.generatedData.csvContent;
        
        // 处理编码
        if (encoding === 'utf-8-bom') {
            content = '\ufeff' + content;
        }
        
        const blob = new Blob([content], { 
            type: encoding === 'gbk' ? 'text/csv;charset=gbk' : 'text/csv;charset=utf-8' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * 获取生成器统计信息
     */
    getStats() {
        return {
            columnCount: this.columns.length,
            supportedTypes: Object.keys(this.dataTypes),
            isGenerating: this.isGenerating,
            hasData: !!this.generatedData,
            lastGenerated: this.generatedData ? {
                rowCount: this.generatedData.rowCount,
                columnCount: this.generatedData.columnCount,
                size: this.generatedData.size,
                duration: this.generatedData.duration
            } : null
        };
    }
}

// 全局实例
window.csvGenerator = new CSVGenerator();