/**
 * CSV生成器UI控制器 - 处理用户交互
 * 整合生成引擎和列管理器，处理界面事件和状态管理
 */

class CSVUI {
    constructor() {
        this.generator = window.csvGenerator;
        this.columnManager = new ColumnManager(this.generator);
        this.currentPreviewPage = 1;
        this.previewPageSize = 50;
        this.isGenerating = false;
        
        // 设置全局引用
        window.columnManager = this.columnManager;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUIState();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 基础设置
        this.rowCount = document.getElementById('rowCount');
        this.csvEncoding = document.getElementById('csvEncoding');
        this.csvSeparator = document.getElementById('csvSeparator');
        this.includeHeader = document.getElementById('includeHeader');
        
        // 列配置
        this.addColumnBtn = document.getElementById('addColumnBtn');
        this.addFirstColumnBtn = document.getElementById('addFirstColumnBtn');
        this.presetBtn = document.getElementById('presetBtn');
        this.importConfigBtn = document.getElementById('importConfigBtn');
        this.exportConfigBtn = document.getElementById('exportConfigBtn');
        this.configFileInput = document.getElementById('configFileInput');
        
        this.presetPanel = document.getElementById('presetPanel');
        this.presetTemplates = document.querySelectorAll('.preset-template');
        
        this.columnsList = document.getElementById('columnsList');
        this.emptyColumns = document.getElementById('emptyColumns');
        
        // 预览
        this.previewSection = document.getElementById('previewSection');
        this.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
        this.previewInfo = document.getElementById('previewInfo');
        this.previewContent = document.getElementById('previewContent');
        
        // 操作
        this.actionSection = document.getElementById('actionSection');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.previewFullBtn = document.getElementById('previewFullBtn');
        
        // 进度
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressStatus = document.getElementById('progressStatus');
        this.progressPercent = document.getElementById('progressPercent');
        
        // 结果
        this.resultSection = document.getElementById('resultSection');
        this.resultRows = document.getElementById('resultRows');
        this.resultColumns = document.getElementById('resultColumns');
        this.resultSize = document.getElementById('resultSize');
        this.resultTime = document.getElementById('resultTime');
        
        this.downloadResultBtn = document.getElementById('downloadResultBtn');
        this.previewResultBtn = document.getElementById('previewResultBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.clearResultBtn = document.getElementById('clearResultBtn');
        
        // 数据预览弹窗
        this.dataModal = document.getElementById('dataModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.modalPreviewContent = document.getElementById('modalPreviewContent');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.pageInfo = document.getElementById('pageInfo');
        this.pageSize = document.getElementById('pageSize');
        
        // 消息提示
        this.toast = document.getElementById('toast');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 基础设置变更
        this.rowCount.addEventListener('input', () => this.updatePreview());
        this.csvSeparator.addEventListener('change', () => this.updatePreview());
        this.includeHeader.addEventListener('change', () => this.updatePreview());
        
        // 列管理
        this.addColumnBtn.addEventListener('click', () => this.columnManager.showColumnDialog());
        this.addFirstColumnBtn.addEventListener('click', () => this.columnManager.showColumnDialog());
        
        this.presetBtn.addEventListener('click', () => this.togglePresetPanel());
        this.presetTemplates.forEach(btn => {
            btn.addEventListener('click', () => {
                this.columnManager.applyTemplate(btn.dataset.template);
                this.hidePresetPanel();
            });
        });
        
        this.exportConfigBtn.addEventListener('click', () => this.columnManager.exportConfig());
        this.importConfigBtn.addEventListener('click', () => this.configFileInput.click());
        this.configFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.columnManager.importConfig(e.target.files[0]);
                e.target.value = ''; // 重置input
            }
        });
        
        // 预览
        this.refreshPreviewBtn.addEventListener('click', () => this.updatePreview());
        
        // 操作
        this.generateBtn.addEventListener('click', () => this.generateCSV());
        this.downloadBtn.addEventListener('click', () => this.downloadCSV());
        this.previewFullBtn.addEventListener('click', () => this.showFullPreview());
        
        // 结果操作
        this.downloadResultBtn.addEventListener('click', () => this.downloadCSV());
        this.previewResultBtn.addEventListener('click', () => this.showFullPreview());
        this.regenerateBtn.addEventListener('click', () => this.generateCSV());
        this.clearResultBtn.addEventListener('click', () => this.clearResults());
        
        // 弹窗控制
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        this.dataModal.addEventListener('click', (e) => {
            if (e.target === this.dataModal) this.hideModal();
        });
        
        // 分页控制
        this.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.nextPageBtn.addEventListener('click', () => this.changePage(1));
        this.pageSize.addEventListener('change', () => this.updateModalPreview());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // 布尔值格式变更（需要动态绑定）
        document.addEventListener('change', (e) => {
            if (e.target.id === 'booleanFormat') {
                const customDiv = document.getElementById('booleanCustom');
                if (customDiv) {
                    customDiv.style.display = e.target.value === 'text' ? 'block' : 'none';
                }
            }
        });
    }

    /**
     * 更新UI状态
     */
    updateUIState() {
        const columns = this.generator.getColumns();
        const hasData = !!this.generator.generatedData;
        
        // 更新预览区域
        if (columns.length > 0) {
            this.previewSection.style.display = 'block';
            this.actionSection.style.display = 'block';
            this.previewInfo.textContent = `共配置 ${columns.length} 列`;
            this.updatePreview();
        } else {
            this.previewSection.style.display = 'none';
            this.actionSection.style.display = 'none';
            this.resultSection.style.display = 'none';
        }
        
        // 更新按钮状态
        this.downloadBtn.disabled = !hasData;
        this.previewFullBtn.disabled = !hasData;
        
        // 更新结果区域
        if (hasData) {
            this.resultSection.style.display = 'block';
            const data = this.generator.generatedData;
            this.resultRows.textContent = data.rowCount;
            this.resultColumns.textContent = data.columnCount;
            this.resultSize.textContent = data.size;
            this.resultTime.textContent = data.duration + 'ms';
        }
    }

    /**
     * 更新预览
     */
    updatePreview() {
        const columns = this.generator.getColumns();
        if (columns.length === 0) {
            this.previewContent.innerHTML = '<p class="no-preview">请先添加列配置</p>';
            return;
        }

        try {
            // 生成预览数据（只生成5行）
            const previewRowCount = 5;
            const separator = this.csvSeparator.value;
            const includeHeader = this.includeHeader.checked;
            
            // 临时生成预览数据
            const tempGenerator = new CSVGenerator();
            tempGenerator.setColumns(columns);
            
            const previewData = [];
            for (let i = 0; i < previewRowCount; i++) {
                const row = {};
                columns.forEach(col => {
                    row[col.name] = tempGenerator.generateCellValue(col, i);
                });
                previewData.push(row);
            }
            
            // 格式化为表格HTML
            let html = '<div class="preview-table">';
            
            // 表头
            if (includeHeader) {
                html += '<div class="preview-row header">';
                columns.forEach(col => {
                    html += `<div class="preview-cell">${this.escapeHtml(col.name)}</div>`;
                });
                html += '</div>';
            }
            
            // 数据行
            previewData.forEach(row => {
                html += '<div class="preview-row">';
                columns.forEach(col => {
                    const value = row[col.name];
                    html += `<div class="preview-cell">${this.escapeHtml(String(value))}</div>`;
                });
                html += '</div>';
            });
            
            html += '</div>';
            html += `<div class="preview-note">以上为前${previewRowCount}行预览数据，使用分隔符: ${separator === '\t' ? 'Tab' : separator}</div>`;
            
            this.previewContent.innerHTML = html;
            
        } catch (error) {
            this.previewContent.innerHTML = `<p class="preview-error">预览生成失败: ${error.message}</p>`;
            console.error('预览生成失败:', error);
        }
    }

    /**
     * 生成CSV数据
     */
    async generateCSV() {
        if (this.isGenerating) return;
        
        try {
            this.setGeneratingState(true);
            
            const rowCount = parseInt(this.rowCount.value) || 100;
            const options = {
                separator: this.csvSeparator.value,
                includeHeader: this.includeHeader.checked,
                encoding: this.csvEncoding.value,
                progressCallback: (progress, processed, total) => {
                    this.updateProgress(progress, processed, total);
                }
            };
            
            // 显示进度
            this.showProgress();
            
            const result = await this.generator.generateCSV(rowCount, options);
            
            this.hideProgress();
            this.updateUIState();
            
            this.showToast(`CSV生成完成！共${result.rowCount}行${result.columnCount}列，用时${result.duration}ms`, 'success');
            
        } catch (error) {
            this.hideProgress();
            this.showToast(`生成失败: ${error.message}`, 'error');
            console.error('CSV生成失败:', error);
        } finally {
            this.setGeneratingState(false);
        }
    }

    /**
     * 下载CSV文件
     */
    downloadCSV() {
        try {
            const encoding = this.csvEncoding.value;
            this.generator.downloadCSV(null, encoding);
            this.showToast('CSV文件下载已开始', 'success');
        } catch (error) {
            this.showToast(`下载失败: ${error.message}`, 'error');
        }
    }

    /**
     * 显示完整数据预览
     */
    showFullPreview() {
        if (!this.generator.generatedData) {
            this.showToast('请先生成CSV数据', 'warning');
            return;
        }
        
        this.currentPreviewPage = 1;
        this.previewPageSize = parseInt(this.pageSize.value) || 50;
        this.updateModalPreview();
        this.showModal();
    }

    /**
     * 更新弹窗预览内容
     */
    updateModalPreview() {
        if (!this.generator.generatedData) return;
        
        const data = this.generator.generatedData.data;
        const columns = this.generator.getColumns();
        const totalRows = data.length;
        const totalPages = Math.ceil(totalRows / this.previewPageSize);
        
        // 计算当前页数据
        const startIndex = (this.currentPreviewPage - 1) * this.previewPageSize;
        const endIndex = Math.min(startIndex + this.previewPageSize, totalRows);
        const pageData = data.slice(startIndex, endIndex);
        
        // 生成表格HTML
        let html = '<div class="modal-table">';
        
        // 表头
        if (this.includeHeader.checked) {
            html += '<div class="modal-row header">';
            html += '<div class="modal-cell row-number">#</div>';
            columns.forEach(col => {
                html += `<div class="modal-cell">${this.escapeHtml(col.name)}</div>`;
            });
            html += '</div>';
        }
        
        // 数据行
        pageData.forEach((row, index) => {
            const rowNumber = startIndex + index + 1;
            html += '<div class="modal-row">';
            html += `<div class="modal-cell row-number">${rowNumber}</div>`;
            columns.forEach(col => {
                const value = row[col.name];
                html += `<div class="modal-cell">${this.escapeHtml(String(value))}</div>`;
            });
            html += '</div>';
        });
        
        html += '</div>';
        this.modalPreviewContent.innerHTML = html;
        
        // 更新分页信息
        this.pageInfo.textContent = `第 ${this.currentPreviewPage} 页，共 ${totalPages} 页 (总计 ${totalRows} 行)`;
        this.prevPageBtn.disabled = this.currentPreviewPage <= 1;
        this.nextPageBtn.disabled = this.currentPreviewPage >= totalPages;
    }

    /**
     * 切换页面
     */
    changePage(delta) {
        if (!this.generator.generatedData) return;
        
        const totalRows = this.generator.generatedData.data.length;
        const totalPages = Math.ceil(totalRows / this.previewPageSize);
        
        const newPage = this.currentPreviewPage + delta;
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPreviewPage = newPage;
            this.updateModalPreview();
        }
    }

    /**
     * 切换预设模板面板
     */
    togglePresetPanel() {
        const isVisible = this.presetPanel.style.display === 'block';
        this.presetPanel.style.display = isVisible ? 'none' : 'block';
    }

    /**
     * 隐藏预设模板面板
     */
    hidePresetPanel() {
        this.presetPanel.style.display = 'none';
    }

    /**
     * 显示弹窗
     */
    showModal() {
        this.dataModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * 隐藏弹窗
     */
    hideModal() {
        this.dataModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    /**
     * 设置生成状态
     */
    setGeneratingState(isGenerating) {
        this.isGenerating = isGenerating;
        this.generateBtn.disabled = isGenerating;
        this.generateBtn.textContent = isGenerating ? '🔄 生成中...' : '📊 生成CSV数据';
        
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
     * 清空结果
     */
    clearResults() {
        this.generator.generatedData = null;
        this.resultSection.style.display = 'none';
        this.updateUIState();
        this.showToast('已清空生成结果', 'success');
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboard(event) {
        // Esc: 关闭弹窗
        if (event.key === 'Escape') {
            if (this.dataModal.style.display === 'flex') {
                this.hideModal();
                return;
            }
            this.hidePresetPanel();
        }
        
        // Ctrl/Cmd + Enter: 生成CSV
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (!this.isGenerating && this.generator.getColumns().length > 0) {
                this.generateCSV();
            }
        }
        
        // Ctrl/Cmd + S: 下载CSV
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            if (this.generator.generatedData) {
                this.downloadCSV();
            }
        }
        
        // Ctrl/Cmd + N: 添加新列
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.columnManager.showColumnDialog();
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
     * 获取应用状态信息
     */
    getAppInfo() {
        return {
            version: '1.0.0',
            generator: this.generator.getStats(),
            columnCount: this.generator.getColumns().length,
            hasData: !!this.generator.generatedData
        };
    }
}

// 等待DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.csvUI = new CSVUI();
    
    // 在控制台显示版本信息
    console.log('📊 CSVGen - CSV数据生成工具 v1.0.0');
    console.log('🎨 使用 Ctrl+Enter 快速生成CSV');
    console.log('💾 使用 Ctrl+S 快速下载CSV');
    console.log('➕ 使用 Ctrl+N 快速添加列');
    console.log(window.csvUI.getAppInfo());
});