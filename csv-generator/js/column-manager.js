/**
 * 列配置管理器 - 处理列的添加、编辑、删除和模板功能
 */

class ColumnManager {
    constructor(csvGenerator) {
        this.generator = csvGenerator;
        this.currentEditingIndex = -1;
        
        // 预设模板定义
        this.presetTemplates = {
            user: {
                name: '用户信息',
                description: '包含用户的基本信息字段',
                columns: [
                    { name: 'ID', type: 'id', start: 1, step: 1, padding: 6 },
                    { name: '姓名', type: 'name', nameType: 'chinese' },
                    { name: '邮箱', type: 'email', domains: ['gmail.com', '163.com', 'qq.com'] },
                    { name: '手机号', type: 'phone', format: 'china' },
                    { name: '年龄', type: 'integer', min: 18, max: 65 },
                    { name: '注册日期', type: 'date', startDate: '2020-01-01', format: 'YYYY-MM-DD' },
                    { name: '是否活跃', type: 'boolean', format: 'text', trueValue: '是', falseValue: '否' }
                ]
            },
            product: {
                name: '商品数据',
                description: '电商商品信息模板',
                columns: [
                    { name: '商品ID', type: 'id', prefix: 'P', start: 10001, padding: 6 },
                    { name: '商品名称', type: 'text', length: 20, charset: 'chinese' },
                    { name: '类别', type: 'enum', values: ['电子产品', '服装', '食品', '家居', '图书', '运动'] },
                    { name: '价格', type: 'decimal', min: 10, max: 9999, decimals: 2 },
                    { name: '库存', type: 'integer', min: 0, max: 1000 },
                    { name: '上架时间', type: 'datetime', format: 'YYYY-MM-DD HH:mm:ss' },
                    { name: '商品链接', type: 'url' }
                ]
            },
            order: {
                name: '订单记录',
                description: '订单交易数据模板',
                columns: [
                    { name: '订单号', type: 'id', prefix: 'ORD', start: 100001, padding: 8 },
                    { name: '用户ID', type: 'id', prefix: 'U', start: 1001, step: 1, padding: 6 },
                    { name: '商品名称', type: 'text', length: 15, charset: 'chinese' },
                    { name: '订单金额', type: 'decimal', min: 9.9, max: 9999.99, decimals: 2 },
                    { name: '数量', type: 'integer', min: 1, max: 10 },
                    { name: '订单状态', type: 'enum', values: ['待支付', '已支付', '已发货', '已完成', '已取消'] },
                    { name: '下单时间', type: 'datetime', format: 'YYYY-MM-DD HH:mm:ss' },
                    { name: '收货地址', type: 'address' }
                ]
            },
            log: {
                name: '日志数据',
                description: '系统日志模板',
                columns: [
                    { name: 'ID', type: 'id', start: 1, padding: 8 },
                    { name: '时间戳', type: 'datetime', format: 'YYYY-MM-DD HH:mm:ss' },
                    { name: '日志级别', type: 'enum', values: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] },
                    { name: '模块', type: 'enum', values: ['AUTH', 'DATABASE', 'API', 'CACHE', 'QUEUE', 'SCHEDULER'] },
                    { name: '消息', type: 'text', length: 50, charset: 'mixed' },
                    { name: '用户IP', type: 'ip', version: 'v4' },
                    { name: '响应时间', type: 'integer', min: 1, max: 5000, suffix: 'ms' }
                ]
            },
            financial: {
                name: '财务数据',
                description: '财务交易记录模板',
                columns: [
                    { name: '交易ID', type: 'uuid' },
                    { name: '账户号', type: 'id', prefix: 'ACC', start: 10000001, padding: 10 },
                    { name: '交易类型', type: 'enum', values: ['收入', '支出', '转账', '投资', '提现'] },
                    { name: '金额', type: 'decimal', min: 0.01, max: 999999.99, decimals: 2 },
                    { name: '余额', type: 'decimal', min: 0, max: 9999999.99, decimals: 2 },
                    { name: '交易时间', type: 'datetime', format: 'YYYY-MM-DD HH:mm:ss' },
                    { name: '描述', type: 'text', length: 30, charset: 'chinese' },
                    { name: '状态', type: 'enum', values: ['成功', '失败', '处理中'] }
                ]
            },
            sensor: {
                name: '传感器数据',
                description: 'IoT传感器数据模板',
                columns: [
                    { name: '设备ID', type: 'id', prefix: 'DEV', start: 1001, padding: 6 },
                    { name: '传感器类型', type: 'enum', values: ['温度', '湿度', '压力', '光照', '运动', 'PM2.5'] },
                    { name: '数值', type: 'decimal', min: -50, max: 1000, decimals: 2 },
                    { name: '单位', type: 'enum', values: ['°C', '%', 'Pa', 'lux', 'boolean', 'μg/m³'] },
                    { name: '时间戳', type: 'datetime', format: 'YYYY-MM-DD HH:mm:ss' },
                    { name: '位置', type: 'address' },
                    { name: '状态', type: 'enum', values: ['正常', '异常', '离线'] },
                    { name: '电池电量', type: 'integer', min: 0, max: 100, suffix: '%' }
                ]
            }
        };
    }

    /**
     * 创建列配置UI元素
     */
    createColumnElement(column, index) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column-item';
        columnDiv.dataset.index = index;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'column-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'column-title';
        titleSpan.textContent = `${column.name || '未命名'} (${this.generator.dataTypes[column.type] || column.type})`;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'column-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-small btn-edit';
        editBtn.innerHTML = '✏️ 编辑';
        editBtn.onclick = () => this.editColumn(index);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-small btn-copy';
        copyBtn.innerHTML = '📋 复制';
        copyBtn.onclick = () => this.copyColumn(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small btn-delete';
        deleteBtn.innerHTML = '🗑️ 删除';
        deleteBtn.onclick = () => this.deleteColumn(index);
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(deleteBtn);
        
        headerDiv.appendChild(titleSpan);
        headerDiv.appendChild(actionsDiv);
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'column-details';
        detailsDiv.innerHTML = this.generateColumnDetailsHTML(column);
        
        columnDiv.appendChild(headerDiv);
        columnDiv.appendChild(detailsDiv);
        
        return columnDiv;
    }

    /**
     * 生成列详情HTML
     */
    generateColumnDetailsHTML(column) {
        const details = [];
        
        details.push(`<span class="detail-item"><strong>类型:</strong> ${this.generator.dataTypes[column.type] || column.type}</span>`);
        
        // 根据不同类型显示不同的配置信息
        switch (column.type) {
            case 'text':
                details.push(`<span class="detail-item"><strong>长度:</strong> ${column.length || 10}</span>`);
                details.push(`<span class="detail-item"><strong>字符集:</strong> ${column.charset || 'mixed'}</span>`);
                break;
            case 'number':
            case 'integer':
            case 'decimal':
                details.push(`<span class="detail-item"><strong>范围:</strong> ${column.min || 0} - ${column.max || 100}</span>`);
                if (column.decimals !== undefined) {
                    details.push(`<span class="detail-item"><strong>小数位:</strong> ${column.decimals}</span>`);
                }
                break;
            case 'boolean':
                details.push(`<span class="detail-item"><strong>格式:</strong> ${column.format || 'boolean'}</span>`);
                if (column.format === 'text') {
                    details.push(`<span class="detail-item"><strong>真值:</strong> ${column.trueValue || 'true'}</span>`);
                    details.push(`<span class="detail-item"><strong>假值:</strong> ${column.falseValue || 'false'}</span>`);
                }
                break;
            case 'date':
            case 'datetime':
            case 'time':
                details.push(`<span class="detail-item"><strong>格式:</strong> ${column.format || 'YYYY-MM-DD'}</span>`);
                if (column.startDate) {
                    details.push(`<span class="detail-item"><strong>开始日期:</strong> ${column.startDate}</span>`);
                }
                if (column.endDate) {
                    details.push(`<span class="detail-item"><strong>结束日期:</strong> ${column.endDate}</span>`);
                }
                break;
            case 'email':
                if (column.domains && column.domains.length > 0) {
                    details.push(`<span class="detail-item"><strong>域名:</strong> ${column.domains.join(', ')}</span>`);
                }
                break;
            case 'phone':
                details.push(`<span class="detail-item"><strong>格式:</strong> ${column.format || 'china'}</span>`);
                break;
            case 'name':
                details.push(`<span class="detail-item"><strong>类型:</strong> ${column.nameType || 'chinese'}</span>`);
                break;
            case 'id':
                details.push(`<span class="detail-item"><strong>起始值:</strong> ${column.start || 1}</span>`);
                details.push(`<span class="detail-item"><strong>步长:</strong> ${column.step || 1}</span>`);
                if (column.prefix) {
                    details.push(`<span class="detail-item"><strong>前缀:</strong> ${column.prefix}</span>`);
                }
                if (column.padding) {
                    details.push(`<span class="detail-item"><strong>补零:</strong> ${column.padding}位</span>`);
                }
                break;
            case 'enum':
                if (column.values && column.values.length > 0) {
                    const valueText = column.values.length > 3 
                        ? column.values.slice(0, 3).join(', ') + '...'
                        : column.values.join(', ');
                    details.push(`<span class="detail-item"><strong>可选值:</strong> ${valueText}</span>`);
                }
                break;
            case 'ip':
                details.push(`<span class="detail-item"><strong>版本:</strong> IPv${column.version === 'v6' ? '6' : '4'}</span>`);
                break;
        }
        
        return details.join('');
    }

    /**
     * 显示添加/编辑列的对话框
     */
    showColumnDialog(column = null, index = -1) {
        this.currentEditingIndex = index;
        const isEdit = column !== null;
        
        // 创建对话框
        const dialog = document.createElement('div');
        dialog.className = 'column-dialog';
        dialog.innerHTML = `
            <div class="dialog-backdrop"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${isEdit ? '编辑列' : '添加列'}</h3>
                    <button class="close-btn" onclick="this.closest('.column-dialog').remove()">✕</button>
                </div>
                <div class="dialog-body">
                    <form id="columnForm">
                        <div class="form-group">
                            <label for="columnName">列名 *</label>
                            <input type="text" id="columnName" required value="${column?.name || ''}" placeholder="请输入列名">
                        </div>
                        
                        <div class="form-group">
                            <label for="columnType">数据类型 *</label>
                            <select id="columnType" required>
                                ${Object.entries(this.generator.dataTypes).map(([key, value]) => 
                                    `<option value="${key}" ${column?.type === key ? 'selected' : ''}>${value}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div id="typeSpecificConfig">
                            ${this.generateTypeSpecificConfigHTML(column?.type || 'text', column)}
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.column-dialog').remove()">取消</button>
                            <button type="submit" class="btn-primary">${isEdit ? '更新' : '添加'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 绑定事件
        const typeSelect = dialog.querySelector('#columnType');
        typeSelect.addEventListener('change', (e) => {
            const configDiv = dialog.querySelector('#typeSpecificConfig');
            configDiv.innerHTML = this.generateTypeSpecificConfigHTML(e.target.value);
        });
        
        const form = dialog.querySelector('#columnForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveColumn(form, isEdit);
            dialog.remove();
        });
        
        // 聚焦到列名输入框
        setTimeout(() => {
            dialog.querySelector('#columnName').focus();
        }, 100);
    }

    /**
     * 生成特定类型的配置HTML
     */
    generateTypeSpecificConfigHTML(type, existingColumn = null) {
        const column = existingColumn || {};
        
        switch (type) {
            case 'text':
                return `
                    <div class="form-group">
                        <label for="textLength">文本长度</label>
                        <input type="number" id="textLength" min="1" max="1000" value="${column.length || 10}">
                    </div>
                    <div class="form-group">
                        <label for="textCharset">字符集</label>
                        <select id="textCharset">
                            <option value="mixed" ${column.charset === 'mixed' ? 'selected' : ''}>中英混合</option>
                            <option value="chinese" ${column.charset === 'chinese' ? 'selected' : ''}>中文</option>
                            <option value="latin" ${column.charset === 'latin' ? 'selected' : ''}>英文</option>
                        </select>
                    </div>
                `;
            
            case 'number':
            case 'integer':
            case 'decimal':
                return `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="numberMin">最小值</label>
                            <input type="number" id="numberMin" value="${column.min || 0}">
                        </div>
                        <div class="form-group">
                            <label for="numberMax">最大值</label>
                            <input type="number" id="numberMax" value="${column.max || 100}">
                        </div>
                    </div>
                    ${type === 'decimal' || type === 'number' ? `
                    <div class="form-group">
                        <label for="numberDecimals">小数位数</label>
                        <input type="number" id="numberDecimals" min="0" max="10" value="${column.decimals || 2}">
                    </div>
                    ` : ''}
                `;
            
            case 'boolean':
                return `
                    <div class="form-group">
                        <label for="booleanFormat">输出格式</label>
                        <select id="booleanFormat">
                            <option value="boolean" ${column.format === 'boolean' ? 'selected' : ''}>布尔值 (true/false)</option>
                            <option value="number" ${column.format === 'number' ? 'selected' : ''}>数字 (1/0)</option>
                            <option value="text" ${column.format === 'text' ? 'selected' : ''}>文本 (自定义)</option>
                        </select>
                    </div>
                    <div id="booleanCustom" style="display: ${column.format === 'text' ? 'block' : 'none'};">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booleanTrue">真值</label>
                                <input type="text" id="booleanTrue" value="${column.trueValue || '是'}">
                            </div>
                            <div class="form-group">
                                <label for="booleanFalse">假值</label>
                                <input type="text" id="booleanFalse" value="${column.falseValue || '否'}">
                            </div>
                        </div>
                    </div>
                `;
            
            case 'date':
            case 'datetime':
            case 'time':
                const defaultFormat = type === 'date' ? 'YYYY-MM-DD' : 
                                     type === 'time' ? 'HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss';
                return `
                    <div class="form-group">
                        <label for="dateFormat">日期格式</label>
                        <select id="dateFormat">
                            <option value="YYYY-MM-DD" ${column.format === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                            <option value="YYYY-MM-DD HH:mm:ss" ${column.format === 'YYYY-MM-DD HH:mm:ss' ? 'selected' : ''}>YYYY-MM-DD HH:mm:ss</option>
                            <option value="MM/DD/YYYY" ${column.format === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                            <option value="HH:mm:ss" ${column.format === 'HH:mm:ss' ? 'selected' : ''}>HH:mm:ss</option>
                        </select>
                    </div>
                    ${type !== 'time' ? `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="dateStart">开始日期</label>
                            <input type="date" id="dateStart" value="${column.startDate || '2020-01-01'}">
                        </div>
                        <div class="form-group">
                            <label for="dateEnd">结束日期</label>
                            <input type="date" id="dateEnd" value="${column.endDate || new Date().toISOString().slice(0, 10)}">
                        </div>
                    </div>
                    ` : ''}
                `;
            
            case 'email':
                return `
                    <div class="form-group">
                        <label for="emailDomains">邮箱域名 (每行一个)</label>
                        <textarea id="emailDomains" rows="3" placeholder="gmail.com\n163.com\nqq.com">${(column.domains || ['gmail.com', '163.com', 'qq.com']).join('\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="emailUsernameLength">用户名长度</label>
                        <input type="number" id="emailUsernameLength" min="3" max="20" value="${column.usernameLength || 8}">
                    </div>
                `;
            
            case 'phone':
                return `
                    <div class="form-group">
                        <label for="phoneFormat">手机号格式</label>
                        <select id="phoneFormat">
                            <option value="china" ${column.format === 'china' ? 'selected' : ''}>中国大陆 (+86)</option>
                            <option value="us" ${column.format === 'us' ? 'selected' : ''}>美国 (+1)</option>
                        </select>
                    </div>
                `;
            
            case 'name':
                return `
                    <div class="form-group">
                        <label for="nameType">姓名类型</label>
                        <select id="nameType">
                            <option value="chinese" ${column.nameType === 'chinese' ? 'selected' : ''}>中文姓名</option>
                            <option value="english" ${column.nameType === 'english' ? 'selected' : ''}>英文姓名</option>
                        </select>
                    </div>
                `;
            
            case 'id':
                return `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="idStart">起始值</label>
                            <input type="number" id="idStart" value="${column.start || 1}">
                        </div>
                        <div class="form-group">
                            <label for="idStep">步长</label>
                            <input type="number" id="idStep" min="1" value="${column.step || 1}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="idPrefix">前缀</label>
                            <input type="text" id="idPrefix" value="${column.prefix || ''}" placeholder="可选">
                        </div>
                        <div class="form-group">
                            <label for="idPadding">补零位数</label>
                            <input type="number" id="idPadding" min="0" max="10" value="${column.padding || 0}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="idSuffix">后缀</label>
                        <input type="text" id="idSuffix" value="${column.suffix || ''}" placeholder="可选">
                    </div>
                `;
            
            case 'enum':
                return `
                    <div class="form-group">
                        <label for="enumValues">可选值 (每行一个) *</label>
                        <textarea id="enumValues" rows="4" required placeholder="选项1\n选项2\n选项3">${(column.values || []).join('\n')}</textarea>
                    </div>
                `;
            
            case 'ip':
                return `
                    <div class="form-group">
                        <label for="ipVersion">IP版本</label>
                        <select id="ipVersion">
                            <option value="v4" ${column.version === 'v4' ? 'selected' : ''}>IPv4</option>
                            <option value="v6" ${column.version === 'v6' ? 'selected' : ''}>IPv6</option>
                        </select>
                    </div>
                `;
            
            default:
                return '<p class="form-note">此数据类型无需额外配置</p>';
        }
    }

    /**
     * 保存列配置
     */
    saveColumn(form, isEdit) {
        const formData = new FormData(form);
        const type = form.querySelector('#columnType').value;
        
        const column = {
            name: form.querySelector('#columnName').value.trim(),
            type: type
        };
        
        // 根据类型添加特定配置
        switch (type) {
            case 'text':
                column.length = parseInt(form.querySelector('#textLength').value) || 10;
                column.charset = form.querySelector('#textCharset').value;
                break;
            case 'number':
            case 'integer':
            case 'decimal':
                column.min = parseFloat(form.querySelector('#numberMin').value) || 0;
                column.max = parseFloat(form.querySelector('#numberMax').value) || 100;
                if (type === 'decimal' || type === 'number') {
                    const decimalsInput = form.querySelector('#numberDecimals');
                    if (decimalsInput) {
                        column.decimals = parseInt(decimalsInput.value) || 2;
                    }
                }
                break;
            case 'boolean':
                column.format = form.querySelector('#booleanFormat').value;
                if (column.format === 'text') {
                    column.trueValue = form.querySelector('#booleanTrue').value || '是';
                    column.falseValue = form.querySelector('#booleanFalse').value || '否';
                }
                break;
            case 'date':
            case 'datetime':
            case 'time':
                column.format = form.querySelector('#dateFormat').value;
                if (type !== 'time') {
                    const startInput = form.querySelector('#dateStart');
                    const endInput = form.querySelector('#dateEnd');
                    if (startInput && startInput.value) column.startDate = startInput.value;
                    if (endInput && endInput.value) column.endDate = endInput.value;
                }
                break;
            case 'email':
                const domainsText = form.querySelector('#emailDomains').value.trim();
                if (domainsText) {
                    column.domains = domainsText.split('\n').map(d => d.trim()).filter(d => d);
                }
                const usernameLength = form.querySelector('#emailUsernameLength');
                if (usernameLength) {
                    column.usernameLength = parseInt(usernameLength.value) || 8;
                }
                break;
            case 'phone':
                column.format = form.querySelector('#phoneFormat').value;
                break;
            case 'name':
                column.nameType = form.querySelector('#nameType').value;
                break;
            case 'id':
                column.start = parseInt(form.querySelector('#idStart').value) || 1;
                column.step = parseInt(form.querySelector('#idStep').value) || 1;
                column.prefix = form.querySelector('#idPrefix').value.trim();
                column.suffix = form.querySelector('#idSuffix').value.trim();
                const padding = parseInt(form.querySelector('#idPadding').value);
                if (padding > 0) column.padding = padding;
                break;
            case 'enum':
                const valuesText = form.querySelector('#enumValues').value.trim();
                if (valuesText) {
                    column.values = valuesText.split('\n').map(v => v.trim()).filter(v => v);
                }
                break;
            case 'ip':
                column.version = form.querySelector('#ipVersion').value;
                break;
        }
        
        // 添加或更新列
        if (isEdit) {
            this.generator.updateColumn(this.currentEditingIndex, column);
        } else {
            this.generator.addColumn(column);
        }
        
        // 刷新列表显示
        this.refreshColumnsList();
        
        // 显示成功消息
        if (window.csvUI) {
            window.csvUI.showToast(`列 "${column.name}" ${isEdit ? '更新' : '添加'}成功`, 'success');
        }
    }

    /**
     * 编辑列
     */
    editColumn(index) {
        const columns = this.generator.getColumns();
        if (index >= 0 && index < columns.length) {
            this.showColumnDialog(columns[index], index);
        }
    }

    /**
     * 复制列
     */
    copyColumn(index) {
        const columns = this.generator.getColumns();
        if (index >= 0 && index < columns.length) {
            const originalColumn = columns[index];
            const copiedColumn = { ...originalColumn };
            copiedColumn.name = copiedColumn.name + '_副本';
            
            this.generator.addColumn(copiedColumn);
            this.refreshColumnsList();
            
            if (window.csvUI) {
                window.csvUI.showToast(`列 "${originalColumn.name}" 复制成功`, 'success');
            }
        }
    }

    /**
     * 删除列
     */
    deleteColumn(index) {
        const columns = this.generator.getColumns();
        if (index >= 0 && index < columns.length) {
            const columnName = columns[index].name;
            
            if (confirm(`确定要删除列 "${columnName}" 吗？`)) {
                this.generator.removeColumn(index);
                this.refreshColumnsList();
                
                if (window.csvUI) {
                    window.csvUI.showToast(`列 "${columnName}" 删除成功`, 'success');
                }
            }
        }
    }

    /**
     * 刷新列列表显示
     */
    refreshColumnsList() {
        const columnsList = document.getElementById('columnsList');
        const emptyColumns = document.getElementById('emptyColumns');
        const columns = this.generator.getColumns();
        
        if (columns.length === 0) {
            columnsList.style.display = 'none';
            emptyColumns.style.display = 'block';
        } else {
            columnsList.style.display = 'block';
            emptyColumns.style.display = 'none';
            
            columnsList.innerHTML = '';
            columns.forEach((column, index) => {
                columnsList.appendChild(this.createColumnElement(column, index));
            });
        }
        
        // 更新预览和操作区域的显示状态
        if (window.csvUI) {
            window.csvUI.updateUIState();
        }
    }

    /**
     * 应用预设模板
     */
    applyTemplate(templateKey) {
        const template = this.presetTemplates[templateKey];
        if (template) {
            // 清空现有列
            this.generator.setColumns([]);
            
            // 添加模板列
            template.columns.forEach(column => {
                this.generator.addColumn(column);
            });
            
            // 刷新显示
            this.refreshColumnsList();
            
            if (window.csvUI) {
                window.csvUI.showToast(`已应用模板: ${template.name}`, 'success');
            }
        }
    }

    /**
     * 导出配置
     */
    exportConfig() {
        const config = {
            columns: this.generator.getColumns(),
            version: '1.0',
            exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `csv-config-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        if (window.csvUI) {
            window.csvUI.showToast('配置导出成功', 'success');
        }
    }

    /**
     * 导入配置
     */
    importConfig(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                if (config.columns && Array.isArray(config.columns)) {
                    this.generator.setColumns(config.columns);
                    this.refreshColumnsList();
                    
                    if (window.csvUI) {
                        window.csvUI.showToast(`成功导入 ${config.columns.length} 个列配置`, 'success');
                    }
                } else {
                    throw new Error('配置文件格式不正确');
                }
            } catch (error) {
                if (window.csvUI) {
                    window.csvUI.showToast(`导入失败: ${error.message}`, 'error');
                }
            }
        };
        reader.readAsText(file);
    }
}

// 全局实例
window.columnManager = null;