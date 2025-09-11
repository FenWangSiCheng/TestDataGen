/**
 * 主应用逻辑 - UI交互控制
 * 整合生成引擎和导出功能，处理用户交互
 */

class TextGenApp {
    constructor() {
        this.generator = window.textGenerator;
        this.exportManager = window.exportManager;
        this.currentResult = null;
        this.isGenerating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.updatePreview();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 输入控件
        this.countInput = document.getElementById('count');
        this.lengthInput = document.getElementById('length');
        this.checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        // 邮箱配置相关元素
        this.emailConfigPanel = document.getElementById('emailConfigPanel');
        this.emailDomainInput = document.getElementById('emailDomain');
        this.usernameLengthInput = document.getElementById('usernameLength');
        this.usernameCheckboxes = document.querySelectorAll('.username-checkboxes input[type="checkbox"]');
        this.emailPreview = document.getElementById('emailPreview');
        
        // 按钮
        this.generateBtn = document.getElementById('generateBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.selectAllBtn = document.getElementById('selectAll');
        this.selectNoneBtn = document.getElementById('selectNone');
        
        // 导出按钮
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadTxtBtn = document.getElementById('downloadTxtBtn');
        this.downloadCsvBtn = document.getElementById('downloadCsvBtn');
        this.downloadJsonBtn = document.getElementById('downloadJsonBtn');
        
        // 显示区域
        this.previewSection = document.getElementById('previewSection');
        this.previewContent = document.getElementById('previewContent');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressStatus = document.getElementById('progressStatus');
        this.progressPercent = document.getElementById('progressPercent');
        this.exportSection = document.getElementById('exportSection');
        this.resultSection = document.getElementById('resultSection');
        this.resultContent = document.getElementById('resultContent');
        
        // 信息显示
        this.charPoolInfo = document.getElementById('charPoolInfo');
        this.estimatedTime = document.getElementById('estimatedTime');
        this.resultCount = document.getElementById('resultCount');
        this.generateTime = document.getElementById('generateTime');
        this.searchInput = document.getElementById('searchInput');
        
        // 消息提示
        this.toast = document.getElementById('toast');
        
        // 展开/收起按钮
        this.expandBtn = document.getElementById('expandBtn');
        this.collapseBtn = document.getElementById('collapseBtn');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 参数变更事件
        this.countInput.addEventListener('input', () => this.updatePreview());
        this.lengthInput.addEventListener('input', () => this.updatePreview());
        this.checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.handleTypeSelection(cb);
                this.updatePreview();
            });
        });
        
        // 邮箱配置事件
        this.emailDomainInput.addEventListener('input', () => this.updateEmailConfig());
        this.usernameLengthInput.addEventListener('input', () => this.updateEmailConfig());
        this.usernameCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => this.updateEmailConfig());
        });
        
        // 按钮事件
        this.generateBtn.addEventListener('click', () => this.generateData());
        this.regenerateBtn.addEventListener('click', () => this.regenerateData());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.selectAllBtn.addEventListener('click', () => this.selectAllTypes());
        this.selectNoneBtn.addEventListener('click', () => this.selectNoTypes());
        
        // 导出事件
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadTxtBtn.addEventListener('click', () => this.downloadTxt());
        this.downloadCsvBtn.addEventListener('click', () => this.downloadCsv());
        this.downloadJsonBtn.addEventListener('click', () => this.downloadJson());
        
        // 搜索事件
        this.searchInput.addEventListener('input', () => this.searchResults());
        
        // 展开/收起事件
        this.expandBtn.addEventListener('click', () => this.expandResults());
        this.collapseBtn.addEventListener('click', () => this.collapseResults());
        
        // 参数验证事件
        this.countInput.addEventListener('blur', () => this.validateInputs());
        this.lengthInput.addEventListener('blur', () => this.validateInputs());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // 窗口事件
        window.addEventListener('beforeunload', () => this.saveSettings());
    }

    /**
     * 处理类型选择变化
     */
    handleTypeSelection(checkbox) {
        if (checkbox.value === 'emoticon' && checkbox.checked) {
            // 当用户选择表情符号时，显示说明
            this.showToast('✨ 文本表情使用ASCII字符，在所有设备上都能完美显示！', 'success', 3000);
        }
        
        if (checkbox.value === 'emoji' && checkbox.checked) {
            // 当用户选择emoji时，显示说明
            this.showToast('🎉 Unicode Emoji表情已启用！包含表情、手势、动物、食物等多种类型', 'success', 3000);
        }
        
        if (checkbox.value === 'email') {
            // 显示或隐藏邮箱配置面板
            if (checkbox.checked) {
                this.showEmailConfigPanel();
                this.showToast('📧 邮箱格式已启用！请配置域名和用户名规则', 'success', 3000);
            } else {
                this.hideEmailConfigPanel();
            }
        }
    }

    /**
     * 显示邮箱配置面板
     */
    showEmailConfigPanel() {
        this.emailConfigPanel.style.display = 'block';
        this.emailConfigPanel.classList.add('fade-in');
        this.updateEmailConfig();
    }

    /**
     * 隐藏邮箱配置面板
     */
    hideEmailConfigPanel() {
        this.emailConfigPanel.style.display = 'none';
        this.emailConfigPanel.classList.remove('fade-in');
    }

    /**
     * 更新邮箱配置
     */
    updateEmailConfig() {
        const domain = this.emailDomainInput.value || '@gmail.com';
        const usernameLength = parseInt(this.usernameLengthInput.value) || 8;
        const usernameTypes = Array.from(this.usernameCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // 验证域名格式
        const isValidDomain = this.generator.validateEmailDomain(domain);
        this.emailDomainInput.style.borderColor = isValidDomain ? '#4caf50' : '#f44336';

        // 确保至少选择一种用户名类型
        if (usernameTypes.length === 0) {
            this.usernameCheckboxes[0].checked = true; // 默认选择数字
            this.usernameCheckboxes[1].checked = true; // 默认选择英文
            usernameTypes.push('numbers', 'english');
        }

        // 更新生成器配置
        this.generator.setEmailConfig({
            domain: domain,
            usernameLength: usernameLength,
            usernameTypes: usernameTypes
        });

        // 更新预览
        this.updateEmailPreview();
        this.updatePreview();
    }

    /**
     * 更新邮箱预览
     */
    updateEmailPreview() {
        try {
            const sampleEmail = this.generator.generateEmailAddress();
            this.emailPreview.textContent = sampleEmail;
        } catch (error) {
            this.emailPreview.textContent = '配置有误，请检查设置';
        }
    }

    /**
     * 获取选中的字符类型
     */
    getSelectedTypes() {
        return Array.from(this.checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    /**
     * 获取当前配置
     */
    getCurrentConfig() {
        return {
            count: parseInt(this.countInput.value) || 0,
            length: parseInt(this.lengthInput.value) || 0,
            selectedTypes: this.getSelectedTypes()
        };
    }

    /**
     * 更新预览
     */
    updatePreview() {
        const config = this.getCurrentConfig();
        const errors = this.generator.validateConfig(config.count, config.length, config.selectedTypes);
        
        if (errors.length > 0) {
            this.previewSection.style.display = 'none';
            this.generateBtn.disabled = true;
            return;
        }
        
        this.generateBtn.disabled = false;
        
        try {
            const preview = this.generator.generatePreview(
                config.count, 
                config.length, 
                config.selectedTypes
            );
            
            this.previewContent.innerHTML = preview.preview
                .map(item => `<div class="preview-item">${this.escapeHtml(item)}</div>`)
                .join('');
            
            this.charPoolInfo.textContent = `字符池: ${preview.poolInfo} (共${preview.totalChars}种字符)`;
            this.estimatedTime.textContent = `预计时间: ${preview.estimatedTime}`;
            
            this.previewSection.style.display = 'block';
        } catch (error) {
            console.error('预览生成失败:', error);
            this.previewSection.style.display = 'none';
        }
    }

    /**
     * 生成数据
     */
    async generateData() {
        if (this.isGenerating) return;
        
        const config = this.getCurrentConfig();
        const errors = this.generator.validateConfig(config.count, config.length, config.selectedTypes);
        
        if (errors.length > 0) {
            this.showToast(errors.join('; '), 'error');
            return;
        }
        
        try {
            this.setGeneratingState(true);
            
            // 选择生成方式 (同步 vs 异步)
            let result;
            if (config.count <= 5000) {
                // 小数据量使用同步生成
                result = this.generator.generateSync(config.count, config.length, config.selectedTypes);
                this.hideProgress();
                this.displayResults(result);
            } else {
                // 大数据量使用异步生成
                this.showProgress();
                result = await this.generator.generateAsync(
                    config.count, 
                    config.length, 
                    config.selectedTypes,
                    (progress, processed, total) => {
                        this.updateProgress(progress, processed, total);
                    }
                );
                this.hideProgress();
                this.displayResults(result);
            }
            
            this.showToast(`成功生成 ${result.data.length} 条数据，用时 ${result.duration}ms`, 'success');
            
        } catch (error) {
            console.error('生成失败:', error);
            this.showToast(`生成失败: ${error.message}`, 'error');
        } finally {
            this.setGeneratingState(false);
        }
    }

    /**
     * 重新生成数据
     */
    async regenerateData() {
        if (!this.currentResult) return;
        await this.generateData();
    }

    /**
     * 清空结果
     */
    clearResults() {
        this.currentResult = null;
        this.exportManager.setData(null);
        
        this.exportSection.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.regenerateBtn.disabled = true;
        this.clearBtn.disabled = true;
        
        this.showToast('已清空结果', 'success');
    }

    /**
     * 选择所有类型
     */
    selectAllTypes() {
        this.checkboxes.forEach(cb => cb.checked = true);
        this.updatePreview();
    }

    /**
     * 取消选择所有类型
     */
    selectNoTypes() {
        this.checkboxes.forEach(cb => cb.checked = false);
        this.updatePreview();
    }

    /**
     * 设置生成状态
     */
    setGeneratingState(isGenerating) {
        this.isGenerating = isGenerating;
        this.generateBtn.disabled = isGenerating;
        this.generateBtn.textContent = isGenerating ? '🔄 生成中...' : '🎲 生成数据';
        
        if (isGenerating) {
            this.generateBtn.classList.add('loading');
        } else {
            this.generateBtn.classList.remove('loading');
        }
    }

    /**
     * 显示进度
     */
    showProgress() {
        this.progressSection.style.display = 'block';
        this.updateProgress(0, 0, 0);
    }

    /**
     * 隐藏进度
     */
    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    /**
     * 更新进度
     */
    updateProgress(percentage, processed, total) {
        this.progressFill.style.width = percentage + '%';
        this.progressPercent.textContent = percentage + '%';
        this.progressStatus.textContent = `生成中... (${processed}/${total})`;
    }

    /**
     * 显示结果
     */
    displayResults(result) {
        this.currentResult = result;
        this.exportManager.setData(result);
        
        // 显示导出区域
        this.exportSection.style.display = 'block';
        this.exportSection.classList.add('fade-in');
        
        this.resultCount.textContent = `已生成: ${result.data.length} 条数据`;
        this.generateTime.textContent = `用时: ${result.duration}ms`;
        
        // 显示结果区域
        this.renderResults(result.data);
        this.resultSection.style.display = 'block';
        this.resultSection.classList.add('fade-in');
        
        // 启用按钮
        this.regenerateBtn.disabled = false;
        this.clearBtn.disabled = false;
    }

    /**
     * 渲染结果列表
     */
    renderResults(data, maxDisplay = 1000) {
        const displayData = data.slice(0, maxDisplay);
        const hasMore = data.length > maxDisplay;
        
        let html = '';
        displayData.forEach((item, index) => {
            html += `<div class="result-item">
                <span class="item-number">${index + 1}.</span>
                ${this.escapeHtml(item)}
            </div>`;
        });
        
        if (hasMore) {
            html += `<div class="result-item" style="text-align: center; color: var(--text-secondary); font-style: italic;">
                ... 还有 ${data.length - maxDisplay} 条数据 (点击展开查看更多)
            </div>`;
        }
        
        this.resultContent.innerHTML = html;
    }

    /**
     * 展开所有结果
     */
    expandResults() {
        if (!this.currentResult) return;
        this.renderResults(this.currentResult.data, this.currentResult.data.length);
        this.showToast(`已展开显示全部 ${this.currentResult.data.length} 条数据`, 'success');
    }

    /**
     * 收起结果
     */
    collapseResults() {
        if (!this.currentResult) return;
        this.renderResults(this.currentResult.data, 1000);
        this.showToast('已收起显示，仅显示前1000条', 'success');
    }

    /**
     * 搜索结果
     */
    searchResults() {
        if (!this.currentResult) return;
        
        const query = this.searchInput.value.trim().toLowerCase();
        if (!query) {
            this.renderResults(this.currentResult.data);
            return;
        }
        
        const filtered = this.currentResult.data.filter(item => 
            item.toLowerCase().includes(query)
        );
        
        if (filtered.length === 0) {
            this.resultContent.innerHTML = '<div class="result-item" style="text-align: center; color: var(--text-secondary);">未找到匹配的结果</div>';
        } else {
            this.renderResults(filtered);
        }
    }

    /**
     * 复制到剪贴板
     */
    async copyToClipboard() {
        if (!this.currentResult) return;
        
        try {
            const result = await this.exportManager.copyToClipboard();
            this.showToast(result.message, 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    /**
     * 下载TXT文件
     */
    downloadTxt() {
        if (!this.currentResult) return;
        
        try {
            const result = this.exportManager.downloadAsTxt();
            this.showToast(result.message, 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    /**
     * 下载CSV文件
     */
    downloadCsv() {
        if (!this.currentResult) return;
        
        try {
            const result = this.exportManager.downloadAsCsv();
            this.showToast(result.message, 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    /**
     * 下载JSON文件
     */
    downloadJson() {
        if (!this.currentResult) return;
        
        try {
            const result = this.exportManager.downloadAsJson();
            this.showToast(result.message, 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    /**
     * 验证输入
     */
    validateInputs() {
        const config = this.getCurrentConfig();
        const errors = this.generator.validateConfig(config.count, config.length, config.selectedTypes);
        
        if (errors.length > 0) {
            this.showToast(errors.join('; '), 'warning');
        }
        
        // 限制输入范围
        if (this.countInput.value && (parseInt(this.countInput.value) < 1 || parseInt(this.countInput.value) > 1000000)) {
            this.countInput.value = Math.max(1, Math.min(1000000, parseInt(this.countInput.value) || 1));
        }
        
        if (this.lengthInput.value && (parseInt(this.lengthInput.value) < 1 || parseInt(this.lengthInput.value) > 10000)) {
            this.lengthInput.value = Math.max(1, Math.min(10000, parseInt(this.lengthInput.value) || 1));
        }
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboard(event) {
        // Ctrl/Cmd + Enter: 生成数据
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (!this.isGenerating && !this.generateBtn.disabled) {
                this.generateData();
            }
        }
        
        // Ctrl/Cmd + C: 复制结果 (当焦点不在输入框时)
        if ((event.ctrlKey || event.metaKey) && event.key === 'c' && 
            !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            event.preventDefault();
            if (this.currentResult) {
                this.copyToClipboard();
            }
        }
        
        // Escape: 停止生成
        if (event.key === 'Escape' && this.isGenerating) {
            this.generator.stopGeneration();
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

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 保存设置到本地存储
     */
    saveSettings() {
        const config = this.getCurrentConfig();
        const emailConfig = this.generator.getEmailConfig();
        
        const settings = {
            ...config,
            emailConfig: emailConfig
        };
        
        localStorage.setItem('textgen_config', JSON.stringify(settings));
    }

    /**
     * 从本地存储加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('textgen_config');
            if (saved) {
                const settings = JSON.parse(saved);
                
                if (settings.count) this.countInput.value = settings.count;
                if (settings.length) this.lengthInput.value = settings.length;
                if (settings.selectedTypes) {
                    this.checkboxes.forEach(cb => {
                        cb.checked = settings.selectedTypes.includes(cb.value);
                        if (cb.value === 'email' && cb.checked) {
                            this.showEmailConfigPanel();
                        }
                    });
                }
                
                // 加载邮箱配置
                if (settings.emailConfig) {
                    const emailConfig = settings.emailConfig;
                    if (emailConfig.domain) this.emailDomainInput.value = emailConfig.domain;
                    if (emailConfig.usernameLength) this.usernameLengthInput.value = emailConfig.usernameLength;
                    if (emailConfig.usernameTypes) {
                        this.usernameCheckboxes.forEach(cb => {
                            cb.checked = emailConfig.usernameTypes.includes(cb.value);
                        });
                    }
                    
                    // 更新生成器配置
                    this.generator.setEmailConfig(emailConfig);
                }
            }
        } catch (error) {
            console.warn('加载设置失败:', error);
        }
    }

    /**
     * 获取应用状态信息
     */
    getAppInfo() {
        return {
            version: '1.0.0',
            generator: this.generator.getPoolStats(),
            export: this.exportManager.validateExportEnvironment(),
            currentResult: this.currentResult ? {
                count: this.currentResult.data.length,
                config: this.currentResult.config,
                duration: this.currentResult.duration
            } : null
        };
    }
}

// 等待DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.textGenApp = new TextGenApp();
    
    // 在控制台显示版本信息
    console.log('🔤 TextGen - 文本数据生成工具 v1.0.0');
    console.log('👨‍💻 使用 Ctrl+Enter 快速生成数据');
    console.log('📋 使用 Ctrl+C 快速复制结果');
    console.log('⚡ 支持大数据量异步生成');
    console.log(window.textGenApp.getAppInfo());
});