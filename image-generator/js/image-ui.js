/**
 * 图片生成器UI控制器 - 处理用户交互
 * 整合生成引擎，处理界面事件和状态管理
 */

class ImageGeneratorUI {
    constructor() {
        this.generator = window.imageGenerator;
        this.currentResults = [];
        this.isGenerating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeGenerator();
        this.updatePreview();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 配置控件
        this.imageFormat = document.getElementById('imageFormat');
        this.imageQuality = document.getElementById('imageQuality');
        this.qualityValue = document.getElementById('qualityValue');
        this.qualityGroup = document.getElementById('qualityGroup');
        
        // 尺寸控件
        this.imageWidth = document.getElementById('imageWidth');
        this.imageHeight = document.getElementById('imageHeight');
        this.presetButtons = document.querySelectorAll('.btn-preset');
        
        // 颜色控件
        this.patternButtons = document.querySelectorAll('.btn-pattern');
        this.colorPicker = document.getElementById('colorPicker');
        this.redValue = document.getElementById('redValue');
        this.greenValue = document.getElementById('greenValue');
        this.blueValue = document.getElementById('blueValue');
        this.colorPresets = document.querySelectorAll('.color-preset');
        
        // 渐变控件
        this.gradientColor1 = document.getElementById('gradientColor1');
        this.gradientColor2 = document.getElementById('gradientColor2');
        this.gradientAngle = document.getElementById('gradientAngle');
        this.angleValue = document.getElementById('angleValue');
        
        // 噪点控件
        this.noiseIntensity = document.getElementById('noiseIntensity');
        this.noiseValue = document.getElementById('noiseValue');
        this.noiseBaseColor = document.getElementById('noiseBaseColor');
        
        // 条纹控件
        this.stripeWidth = document.getElementById('stripeWidth');
        this.stripeColor1 = document.getElementById('stripeColor1');
        this.stripeColor2 = document.getElementById('stripeColor2');
        this.directionButtons = document.querySelectorAll('.btn-direction');
        
        // 面板
        this.colorPanels = {
            solid: document.getElementById('solidColorPanel'),
            gradient: document.getElementById('gradientColorPanel'),
            noise: document.getElementById('noiseColorPanel'),
            stripes: document.getElementById('stripesColorPanel')
        };
        this.linearDirection = document.getElementById('linearDirection');
        
        // 预览
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewSize = document.getElementById('previewSize');
        this.previewFormat = document.getElementById('previewFormat');
        this.estimatedSize = document.getElementById('estimatedSize');
        
        // 操作按钮
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.batchBtn = document.getElementById('batchBtn');
        
        // 批量生成
        this.batchSection = document.getElementById('batchSection');
        this.batchCount = document.getElementById('batchCount');
        this.randomColors = document.getElementById('randomColors');
        this.randomSizes = document.getElementById('randomSizes');
        
        // 结果区域
        this.resultSection = document.getElementById('resultSection');
        this.resultContainer = document.getElementById('resultContainer');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.clearResultsBtn = document.getElementById('clearResultsBtn');
        
        // 消息提示
        this.toast = document.getElementById('toast');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 格式变更
        this.imageFormat.addEventListener('change', () => {
            this.handleFormatChange();
            this.updatePreview();
        });
        
        // 质量变更
        this.imageQuality.addEventListener('input', () => {
            this.qualityValue.textContent = Math.round(this.imageQuality.value * 100) + '%';
            this.updatePreview();
        });
        
        // 尺寸变更
        this.imageWidth.addEventListener('input', () => this.updatePreview());
        this.imageHeight.addEventListener('input', () => this.updatePreview());
        
        // 尺寸预设
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.imageWidth.value = btn.dataset.width;
                this.imageHeight.value = btn.dataset.height;
                this.updatePreview();
                this.highlightButton(btn, this.presetButtons);
            });
        });
        
        // 图案类型切换
        this.patternButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchPattern(btn.dataset.pattern);
                this.highlightButton(btn, this.patternButtons);
                this.updatePreview();
            });
        });
        
        // 纯色控件
        this.colorPicker.addEventListener('input', () => {
            this.updateRGBFromColor();
            this.updatePreview();
        });
        
        [this.redValue, this.greenValue, this.blueValue].forEach(input => {
            input.addEventListener('input', () => {
                this.updateColorFromRGB();
                this.updatePreview();
            });
        });
        
        // 颜色预设
        this.colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.colorPicker.value = color;
                this.updateRGBFromColor();
                this.updatePreview();
            });
        });
        
        // 渐变控件
        this.gradientColor1.addEventListener('input', () => this.updatePreview());
        this.gradientColor2.addEventListener('input', () => this.updatePreview());
        this.gradientAngle.addEventListener('input', () => {
            this.angleValue.textContent = this.gradientAngle.value + '°';
            this.updatePreview();
        });
        
        // 噪点控件
        this.noiseIntensity.addEventListener('input', () => {
            this.noiseValue.textContent = Math.round(this.noiseIntensity.value * 100) + '%';
            this.updatePreview();
        });
        this.noiseBaseColor.addEventListener('input', () => this.updatePreview());
        
        // 条纹控件
        this.stripeWidth.addEventListener('input', () => this.updatePreview());
        this.stripeColor1.addEventListener('input', () => this.updatePreview());
        this.stripeColor2.addEventListener('input', () => this.updatePreview());
        
        // 条纹方向
        this.directionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.highlightButton(btn, this.directionButtons);
                this.updatePreview();
            });
        });
        
        // 操作按钮
        this.generateBtn.addEventListener('click', () => this.generateImage());
        this.downloadBtn.addEventListener('click', () => this.downloadCurrentImage());
        this.batchBtn.addEventListener('click', () => this.toggleBatchMode());
        
        // 批量生成
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllImages());
        this.clearResultsBtn.addEventListener('click', () => this.clearResults());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * 初始化生成器
     */
    initializeGenerator() {
        this.generator.initCanvas(this.previewCanvas);
    }

    /**
     * 处理格式变更
     */
    handleFormatChange() {
        const format = this.imageFormat.value;
        
        // JPEG格式显示质量控制
        if (format === 'jpeg') {
            this.qualityGroup.style.display = 'block';
        } else {
            this.qualityGroup.style.display = 'none';
        }
        
        this.previewFormat.textContent = `格式: ${format.toUpperCase()}`;
    }

    /**
     * 切换图案类型
     */
    switchPattern(pattern) {
        // 隐藏所有面板
        Object.values(this.colorPanels).forEach(panel => {
            panel.style.display = 'none';
        });
        
        // 显示对应面板
        switch (pattern) {
            case 'solid':
                this.colorPanels.solid.style.display = 'block';
                break;
            case 'linear':
                this.colorPanels.gradient.style.display = 'block';
                this.linearDirection.style.display = 'block';
                break;
            case 'radial':
                this.colorPanels.gradient.style.display = 'block';
                this.linearDirection.style.display = 'none';
                break;
            case 'noise':
                this.colorPanels.noise.style.display = 'block';
                break;
            case 'stripes':
                this.colorPanels.stripes.style.display = 'block';
                break;
        }
    }

    /**
     * 高亮按钮
     */
    highlightButton(activeBtn, buttonGroup) {
        buttonGroup.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    /**
     * 从颜色选择器更新RGB值
     */
    updateRGBFromColor() {
        const color = this.colorPicker.value;
        const rgb = this.generator.hexToRgb(color);
        
        this.redValue.value = rgb.r;
        this.greenValue.value = rgb.g;
        this.blueValue.value = rgb.b;
    }

    /**
     * 从RGB值更新颜色选择器
     */
    updateColorFromRGB() {
        const r = parseInt(this.redValue.value) || 0;
        const g = parseInt(this.greenValue.value) || 0;
        const b = parseInt(this.blueValue.value) || 0;
        
        // 限制范围
        const limitedR = Math.max(0, Math.min(255, r));
        const limitedG = Math.max(0, Math.min(255, g));
        const limitedB = Math.max(0, Math.min(255, b));
        
        this.redValue.value = limitedR;
        this.greenValue.value = limitedG;
        this.blueValue.value = limitedB;
        
        const hex = this.generator.rgbToHex(limitedR, limitedG, limitedB);
        this.colorPicker.value = hex;
    }

    /**
     * 获取当前配置
     */
    getCurrentConfig() {
        const activePattern = document.querySelector('.btn-pattern.active').dataset.pattern;
        const activeDirection = document.querySelector('.btn-direction.active')?.dataset.direction || 'horizontal';
        
        const config = {
            width: parseInt(this.imageWidth.value) || 800,
            height: parseInt(this.imageHeight.value) || 600,
            format: this.imageFormat.value,
            quality: parseFloat(this.imageQuality.value),
            pattern: activePattern,
            colors: {},
            options: {}
        };
        
        // 根据图案类型设置颜色和选项
        switch (activePattern) {
            case 'solid':
                config.colors.primary = this.colorPicker.value;
                break;
            case 'linear':
                config.colors.primary = this.gradientColor1.value;
                config.colors.secondary = this.gradientColor2.value;
                config.options.angle = parseInt(this.gradientAngle.value);
                break;
            case 'radial':
                config.colors.primary = this.gradientColor1.value;
                config.colors.secondary = this.gradientColor2.value;
                break;
            case 'noise':
                config.colors.primary = this.noiseBaseColor.value;
                config.options.intensity = parseFloat(this.noiseIntensity.value);
                break;
            case 'stripes':
                config.colors.primary = this.stripeColor1.value;
                config.colors.secondary = this.stripeColor2.value;
                config.options.stripeWidth = parseInt(this.stripeWidth.value);
                config.options.direction = activeDirection;
                break;
        }
        
        return config;
    }

    /**
     * 更新预览
     */
    async updatePreview() {
        try {
            const config = this.getCurrentConfig();
            
            // 更新预览信息
            this.previewSize.textContent = `尺寸: ${config.width}×${config.height}`;
            this.previewFormat.textContent = `格式: ${config.format.toUpperCase()}`;
            this.estimatedSize.textContent = `预计大小: ${this.generator.estimateImageSize(config.width, config.height, config.format)}`;
            
            // 设置预览Canvas尺寸比例
            const maxPreviewSize = 200;
            const aspectRatio = config.width / config.height;
            let previewWidth, previewHeight;
            
            if (aspectRatio > 1) {
                previewWidth = maxPreviewSize;
                previewHeight = maxPreviewSize / aspectRatio;
            } else {
                previewWidth = maxPreviewSize * aspectRatio;
                previewHeight = maxPreviewSize;
            }
            
            this.previewCanvas.style.width = previewWidth + 'px';
            this.previewCanvas.style.height = previewHeight + 'px';
            
            // 更新生成器配置
            this.generator.setConfig(config);
            
            // 生成预览
            await this.generator.generateImage(config);
            
        } catch (error) {
            console.error('预览更新失败:', error);
        }
    }

    /**
     * 生成图片
     */
    async generateImage() {
        if (this.isGenerating) return;
        
        try {
            this.setGeneratingState(true);
            
            const config = this.getCurrentConfig();
            const result = await this.generator.generateImage(config);
            
            this.currentResults = [result];
            this.displayResults([result]);
            this.showToast(`图片生成成功！尺寸: ${config.width}×${config.height}, 大小: ${result.size}`, 'success');
            
        } catch (error) {
            this.showToast(`生成失败: ${error.message}`, 'error');
            console.error('图片生成失败:', error);
        } finally {
            this.setGeneratingState(false);
        }
    }

    /**
     * 下载当前图片
     */
    downloadCurrentImage() {
        if (this.currentResults.length === 0) return;
        
        const result = this.currentResults[0];
        this.generator.downloadImage(result);
        this.showToast('图片下载已开始', 'success');
    }

    /**
     * 切换批量模式
     */
    toggleBatchMode() {
        const isVisible = this.batchSection.style.display === 'block';
        this.batchSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.startBatchGeneration();
        }
    }

    /**
     * 开始批量生成
     */
    async startBatchGeneration() {
        if (this.isGenerating) return;
        
        try {
            this.setGeneratingState(true);
            
            const count = parseInt(this.batchCount.value) || 5;
            const options = {
                randomColors: this.randomColors.checked,
                randomSizes: this.randomSizes.checked
            };
            
            const results = await this.generator.generateBatch(count, options);
            
            this.currentResults = results.filter(r => !r.error);
            this.displayResults(this.currentResults);
            
            const successCount = this.currentResults.length;
            const errorCount = results.length - successCount;
            
            let message = `批量生成完成！成功: ${successCount}张`;
            if (errorCount > 0) {
                message += `，失败: ${errorCount}张`;
            }
            
            this.showToast(message, successCount > 0 ? 'success' : 'error');
            
        } catch (error) {
            this.showToast(`批量生成失败: ${error.message}`, 'error');
            console.error('批量生成失败:', error);
        } finally {
            this.setGeneratingState(false);
        }
    }

    /**
     * 显示生成结果
     */
    displayResults(results) {
        this.resultContainer.innerHTML = '';
        
        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <div class="result-preview">
                    <img src="${result.dataURL}" alt="生成的图片 ${index + 1}">
                </div>
                <div class="result-info">
                    <div class="result-title">图片 ${result.batchIndex || index + 1}</div>
                    <div class="result-details">
                        <span>尺寸: ${result.config.width}×${result.config.height}</span>
                        <span>格式: ${result.config.format.toUpperCase()}</span>
                        <span>大小: ${result.size}</span>
                    </div>
                    <button class="btn-download" onclick="window.imageUI.downloadSingleResult(${index})">
                        📥 下载
                    </button>
                </div>
            `;
            
            this.resultContainer.appendChild(resultItem);
        });
        
        this.resultSection.style.display = 'block';
        this.downloadBtn.disabled = results.length === 0;
    }

    /**
     * 下载单个结果
     */
    downloadSingleResult(index) {
        if (index >= 0 && index < this.currentResults.length) {
            const result = this.currentResults[index];
            this.generator.downloadImage(result);
            this.showToast('图片下载已开始', 'success');
        }
    }

    /**
     * 下载所有图片
     */
    async downloadAllImages() {
        if (this.currentResults.length === 0) return;

        // 检查 JSZip 是否可用
        if (typeof JSZip === 'undefined') {
            // 降级到逐张下载
            this.currentResults.forEach((result, index) => {
                setTimeout(() => {
                    this.generator.downloadImage(result, `batch_image_${index + 1}.${result.config.format}`);
                }, index * 500);
            });
            this.showToast(`开始下载 ${this.currentResults.length} 张图片`, 'success');
            return;
        }

        try {
            this.showToast('正在打包图片...', 'success', 5000);

            // 创建 ZIP 文件
            const zip = new JSZip();
            const imgFolder = zip.folder('images');

            // 将所有图片添加到 ZIP
            for (let i = 0; i < this.currentResults.length; i++) {
                const result = this.currentResults[i];
                const filename = `image_${i + 1}_${result.config.width}x${result.config.height}.${result.config.format}`;

                // 从 dataURL 提取 base64 数据
                const base64Data = result.dataURL.split(',')[1];
                imgFolder.file(filename, base64Data, { base64: true });
            }

            // 生成 ZIP 文件
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            // 触发下载
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `images_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 释放 URL 对象
            setTimeout(() => URL.revokeObjectURL(link.href), 100);

            this.showToast(`已打包 ${this.currentResults.length} 张图片为 ZIP 文件`, 'success');

        } catch (error) {
            console.error('打包下载失败:', error);
            this.showToast(`打包失败: ${error.message}`, 'error');

            // 降级到逐张下载
            this.currentResults.forEach((result, index) => {
                setTimeout(() => {
                    this.generator.downloadImage(result, `batch_image_${index + 1}.${result.config.format}`);
                }, index * 500);
            });
        }
    }

    /**
     * 清空结果
     */
    clearResults() {
        this.currentResults = [];
        this.resultSection.style.display = 'none';
        this.downloadBtn.disabled = true;
        this.showToast('已清空生成结果', 'success');
    }

    /**
     * 设置生成状态
     */
    setGeneratingState(isGenerating) {
        this.isGenerating = isGenerating;
        this.generateBtn.disabled = isGenerating;
        this.generateBtn.textContent = isGenerating ? '🔄 生成中...' : '🎨 生成图片';
        
        if (isGenerating) {
            this.generateBtn.classList.add('loading');
        } else {
            this.generateBtn.classList.remove('loading');
        }
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboard(event) {
        // Ctrl/Cmd + Enter: 生成图片
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (!this.isGenerating) {
                this.generateImage();
            }
        }
        
        // Ctrl/Cmd + S: 下载图片
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            if (this.currentResults.length > 0) {
                this.downloadCurrentImage();
            }
        }
    }

    /**
     * 显示消息提示
     */
    showToast(message, type = 'success', duration = 3000) {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, duration);
    }
}

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.imageUI = new ImageGeneratorUI();
    
    // 在控制台显示版本信息
    console.log('🖼️ ImageGen - 图片数据生成工具 v1.0.0');
    console.log('🎨 使用 Ctrl+Enter 快速生成图片');
    console.log('💾 使用 Ctrl+S 快速下载图片');
    console.log('⚡ 支持多种格式和图案类型');
});