/**
 * 图片生成引擎 - 核心生成算法
 * 使用HTML5 Canvas API生成各种格式和图案的图片
 */

class ImageGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentConfig = {
            width: 800,
            height: 600,
            format: 'png',
            quality: 0.9,
            pattern: 'solid',
            colors: {
                primary: '#4f46e5',
                secondary: '#7c3aed'
            },
            options: {}
        };
        
        this.supportedFormats = ['png', 'jpeg', 'webp', 'bmp'];
        this.isGenerating = false;
    }

    /**
     * 初始化Canvas
     */
    initCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 设置Canvas尺寸
        this.updateCanvasSize(this.currentConfig.width, this.currentConfig.height);
        
        return this;
    }

    /**
     * 更新Canvas尺寸
     */
    updateCanvasSize(width, height) {
        if (!this.canvas) return;
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.currentConfig.width = width;
        this.currentConfig.height = height;
    }

    /**
     * 设置生成配置
     */
    setConfig(config) {
        this.currentConfig = { ...this.currentConfig, ...config };
        
        // 更新Canvas尺寸
        if (config.width || config.height) {
            this.updateCanvasSize(
                config.width || this.currentConfig.width,
                config.height || this.currentConfig.height
            );
        }
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        return { ...this.currentConfig };
    }

    /**
     * 验证配置参数
     */
    validateConfig(config) {
        const errors = [];
        
        if (!config.width || config.width < 1 || config.width > 8192) {
            errors.push('图片宽度必须在1-8192像素之间');
        }
        
        if (!config.height || config.height < 1 || config.height > 8192) {
            errors.push('图片高度必须在1-8192像素之间');
        }
        
        if (!this.supportedFormats.includes(config.format)) {
            errors.push('不支持的图片格式');
        }
        
        if (config.format === 'jpeg' && (config.quality < 0.1 || config.quality > 1)) {
            errors.push('JPEG质量必须在0.1-1.0之间');
        }
        
        return errors;
    }

    /**
     * 生成图片数据
     */
    async generateImage(config = null) {
        if (this.isGenerating) {
            throw new Error('正在生成中，请稍候...');
        }
        
        const genConfig = config || this.currentConfig;
        const errors = this.validateConfig(genConfig);
        
        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }
        
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas未初始化');
        }
        
        try {
            this.isGenerating = true;
            
            // 清空画布
            this.clearCanvas();
            
            // 根据图案类型生成图片
            switch (genConfig.pattern) {
                case 'solid':
                    this.drawSolidColor(genConfig);
                    break;
                case 'linear':
                    this.drawLinearGradient(genConfig);
                    break;
                case 'radial':
                    this.drawRadialGradient(genConfig);
                    break;
                case 'noise':
                    await this.drawNoise(genConfig);
                    break;
                case 'stripes':
                    this.drawStripes(genConfig);
                    break;
                default:
                    throw new Error('不支持的图案类型');
            }
            
            // 生成图片数据
            const imageData = this.exportImage(genConfig.format, genConfig.quality);
            
            return {
                dataURL: imageData,
                blob: await this.dataURLToBlob(imageData),
                config: { ...genConfig },
                size: this.calculateDataSize(imageData),
                timestamp: Date.now()
            };
            
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * 清空画布
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 绘制纯色
     */
    drawSolidColor(config) {
        this.ctx.fillStyle = config.colors.primary;
        this.ctx.fillRect(0, 0, config.width, config.height);
    }

    /**
     * 绘制线性渐变
     */
    drawLinearGradient(config) {
        const angle = (config.options.angle || 45) * Math.PI / 180;
        const x1 = 0;
        const y1 = 0;
        const x2 = config.width * Math.cos(angle);
        const y2 = config.height * Math.sin(angle);
        
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, config.colors.primary);
        gradient.addColorStop(1, config.colors.secondary);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, config.width, config.height);
    }

    /**
     * 绘制径向渐变
     */
    drawRadialGradient(config) {
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        const radius = Math.min(config.width, config.height) / 2;
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, config.colors.primary);
        gradient.addColorStop(1, config.colors.secondary);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, config.width, config.height);
    }

    /**
     * 绘制随机噪点
     */
    async drawNoise(config) {
        const intensity = config.options.intensity || 0.5;
        const baseColor = this.hexToRgb(config.colors.primary);
        
        const imageData = this.ctx.createImageData(config.width, config.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 255;
            
            data[i] = Math.max(0, Math.min(255, baseColor.r + noise));     // R
            data[i + 1] = Math.max(0, Math.min(255, baseColor.g + noise)); // G
            data[i + 2] = Math.max(0, Math.min(255, baseColor.b + noise)); // B
            data[i + 3] = 255; // A
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * 绘制条纹图案
     */
    drawStripes(config) {
        const stripeWidth = config.options.stripeWidth || 20;
        const direction = config.options.direction || 'horizontal';
        
        // 填充背景色
        this.ctx.fillStyle = config.colors.secondary;
        this.ctx.fillRect(0, 0, config.width, config.height);
        
        // 绘制条纹
        this.ctx.fillStyle = config.colors.primary;
        
        switch (direction) {
            case 'horizontal':
                for (let y = 0; y < config.height; y += stripeWidth * 2) {
                    this.ctx.fillRect(0, y, config.width, stripeWidth);
                }
                break;
            case 'vertical':
                for (let x = 0; x < config.width; x += stripeWidth * 2) {
                    this.ctx.fillRect(x, 0, stripeWidth, config.height);
                }
                break;
            case 'diagonal':
                // 创建对角线条纹图案
                for (let i = -config.height; i < config.width + config.height; i += stripeWidth * 2) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(i, 0);
                    this.ctx.lineTo(i + config.height, config.height);
                    this.ctx.lineWidth = stripeWidth;
                    this.ctx.strokeStyle = config.colors.primary;
                    this.ctx.stroke();
                }
                break;
        }
    }

    /**
     * 导出图片数据
     */
    exportImage(format, quality = 0.9) {
        let mimeType;
        
        switch (format.toLowerCase()) {
            case 'png':
                mimeType = 'image/png';
                break;
            case 'jpeg':
            case 'jpg':
                mimeType = 'image/jpeg';
                break;
            case 'webp':
                mimeType = 'image/webp';
                break;
            case 'bmp':
                // Canvas不直接支持BMP，转换为PNG
                mimeType = 'image/png';
                break;
            default:
                mimeType = 'image/png';
        }
        
        return this.canvas.toDataURL(mimeType, quality);
    }

    /**
     * 将DataURL转换为Blob
     */
    async dataURLToBlob(dataURL) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(resolve);
            };
            
            img.src = dataURL;
        });
    }

    /**
     * 计算数据大小
     */
    calculateDataSize(dataURL) {
        const base64 = dataURL.split(',')[1];
        const bytes = base64.length * 0.75; // Base64编码约为原数据的1.33倍
        
        if (bytes < 1024) {
            return `${Math.round(bytes)}B`;
        } else if (bytes < 1024 * 1024) {
            return `${Math.round(bytes / 1024)}KB`;
        } else {
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        }
    }

    /**
     * 预估图片大小
     */
    estimateImageSize(width, height, format) {
        let estimatedBytes;
        
        switch (format.toLowerCase()) {
            case 'png':
                // PNG通常比较大，粗略估算
                estimatedBytes = width * height * 3; // RGB
                break;
            case 'jpeg':
                // JPEG压缩后较小
                estimatedBytes = width * height * 0.5;
                break;
            case 'webp':
                // WebP压缩效果较好
                estimatedBytes = width * height * 0.3;
                break;
            case 'bmp':
                // BMP无压缩
                estimatedBytes = width * height * 3;
                break;
            default:
                estimatedBytes = width * height * 2;
        }
        
        return this.formatBytes(estimatedBytes);
    }

    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        if (bytes < 1024) {
            return `${Math.round(bytes)}B`;
        } else if (bytes < 1024 * 1024) {
            return `${Math.round(bytes / 1024)}KB`;
        } else {
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        }
    }

    /**
     * 十六进制颜色转RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * RGB转十六进制颜色
     */
    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * 生成随机颜色
     */
    generateRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return this.rgbToHex(r, g, b);
    }

    /**
     * 生成随机配置
     */
    generateRandomConfig(baseConfig = null) {
        const config = baseConfig || { ...this.currentConfig };
        
        // 随机颜色
        config.colors = {
            primary: this.generateRandomColor(),
            secondary: this.generateRandomColor()
        };
        
        // 随机图案
        const patterns = ['solid', 'linear', 'radial', 'noise', 'stripes'];
        config.pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // 随机选项
        switch (config.pattern) {
            case 'linear':
                config.options = { angle: Math.floor(Math.random() * 360) };
                break;
            case 'noise':
                config.options = { intensity: Math.random() * 0.8 + 0.2 };
                break;
            case 'stripes':
                const directions = ['horizontal', 'vertical', 'diagonal'];
                config.options = {
                    stripeWidth: Math.floor(Math.random() * 50) + 10,
                    direction: directions[Math.floor(Math.random() * directions.length)]
                };
                break;
            default:
                config.options = {};
        }
        
        return config;
    }

    /**
     * 批量生成图片
     */
    async generateBatch(count, options = {}) {
        const results = [];
        const baseConfig = { ...this.currentConfig };
        
        for (let i = 0; i < count; i++) {
            let config = { ...baseConfig };
            
            // 应用批量选项
            if (options.randomColors) {
                config = this.generateRandomConfig(config);
            }
            
            if (options.randomSizes) {
                const sizes = [
                    { width: 800, height: 600 },
                    { width: 1024, height: 768 },
                    { width: 500, height: 500 },
                    { width: 1920, height: 1080 },
                    { width: 640, height: 480 }
                ];
                const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
                config.width = randomSize.width;
                config.height = randomSize.height;
            }
            
            try {
                const result = await this.generateImage(config);
                result.batchIndex = i + 1;
                results.push(result);
            } catch (error) {
                console.error(`批量生成第${i + 1}张失败:`, error);
                results.push({
                    error: error.message,
                    batchIndex: i + 1,
                    config
                });
            }
        }
        
        return results;
    }

    /**
     * 下载图片
     */
    downloadImage(result, filename = null) {
        const name = filename || `image_${result.timestamp}.${result.config.format}`;
        
        const link = document.createElement('a');
        link.download = name;
        link.href = result.dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 获取生成器统计信息
     */
    getStats() {
        return {
            supportedFormats: this.supportedFormats,
            currentConfig: { ...this.currentConfig },
            isGenerating: this.isGenerating,
            canvasSize: this.canvas ? {
                width: this.canvas.width,
                height: this.canvas.height
            } : null
        };
    }
}

// 全局实例
window.imageGenerator = new ImageGenerator();