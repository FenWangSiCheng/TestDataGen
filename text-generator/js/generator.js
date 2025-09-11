/**
 * 文本生成引擎 - 核心生成算法
 * 支持多种字符类型的组合生成
 */

class TextGenerator {
    constructor() {
        // 定义各类型字符池
        this.characterPools = {
            numbers: '0123456789',
            english: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            japanese: this.getJapaneseCharacters(),
            emoticon: this.getTextEmoticons(),
            emoji: this.getUnicodeEmojis(),
            special: '!@#$%^&*()_+-={}[]|;\':",./<>?`~\\/',
            email: 'EMAIL_FORMAT' // 特殊标识符，表示邮箱格式
        };
        
        // 邮箱生成配置
        this.emailConfig = {
            enabled: false,
            domain: '@gmail.com',
            usernameTypes: ['numbers', 'english'],
            usernameLength: 8
        };
        
        // 生成状态
        this.isGenerating = false;
        this.shouldStop = false;
        this.lastConfig = null;
    }

    /**
     * 获取日文字符集
     */
    getJapaneseCharacters() {
        let japanese = '';
        
        // 平假名 (ひらがな) U+3041-U+3096
        for (let i = 0x3041; i <= 0x3096; i++) {
            japanese += String.fromCharCode(i);
        }
        
        // 片假名 (カタカナ) U+30A1-U+30FA  
        for (let i = 0x30A1; i <= 0x30FA; i++) {
            japanese += String.fromCharCode(i);
        }
        
        // 常用汉字 (选取一些常用的)
        const commonKanji = '一二三四五六七八九十百千万年月日時分秒人大小中上下左右前後東西南北山川田水火土木金銀白黒赤青緑黄紫橙茶灰生死愛友家族学校会社仕事休日食事料理美味世界国日本東京大阪名古屋京都神戸福岡札幌仙台広島長崎沖縄北海道本州四国九州';
        japanese += commonKanji;
        
        return japanese;
    }

    /**
     * 获取文本表情符号 (完全兼容的表情选项)
     */
    getTextEmoticons() {
        // 丰富的ASCII表情符号集合，100%兼容所有系统
        const western = ':) :( :D :P :o :| ;) :/ :x :* <3 >:( :] :[ 8) B) :S :-) :-( :-D :-P :-| ;-) :-/ :-* >:-( :-] :-[ :-S 8-) B-) =) =( =D =P =| =/ =* >:) >:D >:P :3 >.< XD DX :O :s';
        const japanese = '^_^ ^^; -_- @_@ O_O T_T >_< =_= -..- o_O 0_0 >.<; ^.^ *.* +_+ x_x @.@ OwO UwU >w< ^w^ -w- =w= ~_~ $_$ %_% #_# &_&';
        const kawaii = '(^_^) (>_<) (T_T) (O_O) (@_@) (=_=) (-_-) (^.^) (*.*)  (>.<) (^w^) (OwO) (UwU) (>w<) (-w-) (=w=) (~_~) ($.$) (%_%) (#.#) (&.&)';
        const cute = '(づ｡◕‿‿◕｡)づ ╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ \\(^o^)/ (｡◕‿◕｡) (◕‿◕) ╮(╯▽╰)╭ ¯\\_(ツ)_/¯ (ಠ_ಠ) (ಠ益ಠ) (╯°□°）╯︵ ┻━┻';
        
        return western + ' ' + japanese + ' ' + kawaii + ' ' + cute;
    }

    /**
     * 获取Unicode Emoji字符集 (真正的emoji表情)
     */
    getUnicodeEmojis() {
        // 使用最基础、最兼容的emoji，返回数组而不是字符串以正确处理
        return [
            // 基础表情 (Unicode 6.0+)
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '😉', '😌', '😍', '😘', '😗', '😙', '😚', '😋', '😛',
            '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '😏', '😒',
            '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '😢',
            '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '😱', '😨', '😰',
            
            // 手势动作
            '👍', '👎', '👌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈',
            '👉', '👆', '🖕', '👇', '☝', '👋', '🤚', '🖐', '✋', '🖖',
            '👏', '🙌', '🤝', '👐', '🤲', '🙏',
            
            // 爱心和符号
            '❤', '💛', '💚', '💙', '💜', '🖤', '💯', '💢', '💤', '💨',
            
            // 简单物品
            '🎈', '🎉', '🎊', '🎁', '🎀', '🎗', '🎃', '🎄', '🎆', '🎇',
            '✨', '🎯', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵',
            '🎶', '🎮', '🕹', '🎲', '♠', '♥', '♦', '♣',
            
            // 基础食物
            '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
            '🍍', '🥝', '🍅', '🍞', '🥐', '🧀', '🥚', '🍳', '🥓', '🥞',
            
            // 基础动物
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
            '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
            '🐛', '🦋', '🐌', '🐞', '🐜', '🕷', '🦂', '🐢', '🐍', '🦎',
            
            // 自然和天气
            '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓',
            '🌔', '🌙', '🌛', '🌜', '🌚', '🌝', '🌞', '⭐', '🌟', '💫',
            '⚡', '☄', '💥', '🔥', '🌪', '🌈', '☀', '⛅', '☁', '🌤',
            '⛈', '🌦', '🌧', '⛆', '☔', '💧', '💦', '🌊',
            
            // 简单符号
            '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
            '🏒', '🏑', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋'
        ];
    }

    /**
     * 设置邮箱生成配置
     */
    setEmailConfig(config) {
        this.emailConfig = { ...this.emailConfig, ...config };
    }

    /**
     * 获取邮箱生成配置
     */
    getEmailConfig() {
        return { ...this.emailConfig };
    }

    /**
     * 验证邮箱域名格式
     */
    validateEmailDomain(domain) {
        if (!domain) return false;
        if (!domain.startsWith('@')) return false;
        if (domain.length < 4) return false; // @a.b 最短
        if (!/^@[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(domain)) {
            return false;
        }
        return true;
    }

    /**
     * 生成邮箱用户名
     */
    generateEmailUsername(length, types) {
        let usernamePool = '';
        
        types.forEach(type => {
            if (this.characterPools[type] && type !== 'email') {
                usernamePool += this.characterPools[type];
            }
        });
        
        if (!usernamePool) {
            // 如果没有有效的字符类型，使用默认的数字+英文
            usernamePool = this.characterPools.numbers + this.characterPools.english;
        }
        
        let username = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * usernamePool.length);
            username += usernamePool[randomIndex];
        }
        
        return username;
    }

    /**
     * 生成单个邮箱地址
     */
    generateEmailAddress() {
        const username = this.generateEmailUsername(
            this.emailConfig.usernameLength,
            this.emailConfig.usernameTypes
        );
        return username + this.emailConfig.domain;
    }

    /**
     * 根据选中的类型创建组合字符池
     */
    createCombinedPool(selectedTypes) {
        let combinedPool = '';
        let emojiPool = [];
        const poolInfo = [];
        let hasEmail = false;
        let hasEmoji = false;
        
        selectedTypes.forEach(type => {
            if (type === 'email') {
                hasEmail = true;
                poolInfo.push(`邮箱格式: ${this.emailConfig.domain}`);
            } else if (type === 'emoji') {
                hasEmoji = true;
                emojiPool = this.characterPools[type];
                poolInfo.push(`emoji: ${emojiPool.length}个表情`);
            } else if (this.characterPools[type]) {
                combinedPool += this.characterPools[type];
                poolInfo.push(`${type}: ${this.characterPools[type].length}个字符`);
            }
        });
        
        return {
            pool: combinedPool,
            emojiPool: emojiPool,
            info: poolInfo,
            totalChars: combinedPool.length + emojiPool.length,
            hasEmail: hasEmail,
            hasEmoji: hasEmoji
        };
    }

    /**
     * 生成单条文本或邮箱
     */
    generateSingleText(length, poolData) {
        if (poolData.hasEmail) {
            // 如果包含邮箱格式，直接生成邮箱地址
            return this.generateEmailAddress();
        }
        
        let text = '';
        const totalPool = poolData.pool + poolData.emojiPool.join('');
        const emojiStartIndex = poolData.pool.length;
        
        for (let i = 0; i < length; i++) {
            if (poolData.hasEmoji && poolData.pool === '' && poolData.emojiPool.length > 0) {
                // 纯emoji模式
                const randomIndex = Math.floor(Math.random() * poolData.emojiPool.length);
                text += poolData.emojiPool[randomIndex];
            } else if (poolData.hasEmoji && poolData.pool !== '' && poolData.emojiPool.length > 0) {
                // 混合模式：决定选择普通字符还是emoji
                const totalLength = poolData.pool.length + poolData.emojiPool.length;
                const randomIndex = Math.floor(Math.random() * totalLength);
                
                if (randomIndex < poolData.pool.length) {
                    // 选择普通字符
                    text += poolData.pool[randomIndex];
                } else {
                    // 选择emoji
                    const emojiIndex = randomIndex - poolData.pool.length;
                    text += poolData.emojiPool[emojiIndex];
                }
            } else {
                // 纯普通字符模式
                const randomIndex = Math.floor(Math.random() * poolData.pool.length);
                text += poolData.pool[randomIndex];
            }
        }
        return text;
    }

    /**
     * 生成预览数据 (前几条)
     */
    generatePreview(count, length, selectedTypes, previewCount = 5) {
        const poolData = this.createCombinedPool(selectedTypes);
        const preview = [];
        
        const actualPreviewCount = Math.min(count, previewCount);
        
        for (let i = 0; i < actualPreviewCount; i++) {
            const text = this.generateSingleText(length, poolData);
            preview.push(`${i + 1}. ${text}`);
        }
        
        return {
            preview,
            poolInfo: poolData.info.join(', '),
            totalChars: poolData.totalChars,
            estimatedTime: this.estimateTime(count, length),
            hasEmail: poolData.hasEmail,
            hasEmoji: poolData.hasEmoji
        };
    }

    /**
     * 估算生成时间
     */
    estimateTime(count, length) {
        // 基于经验值估算，每1000条简单数据约需10-50ms
        const complexity = length / 10; // 长度影响因子
        const baseTime = count / 1000 * 30 * complexity; // 基础时间(ms)
        
        if (baseTime < 100) return '< 0.1秒';
        if (baseTime < 1000) return `~${Math.round(baseTime)}ms`;
        return `~${(baseTime / 1000).toFixed(1)}秒`;
    }

    /**
     * 同步生成数据 (适用于小数据量)
     */
    generateSync(count, length, selectedTypes) {
        const startTime = performance.now();
        const poolData = this.createCombinedPool(selectedTypes);
        const results = [];
        
        for (let i = 0; i < count; i++) {
            const text = this.generateSingleText(length, poolData);
            results.push(text);
        }
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        return {
            data: results,
            config: { count, length, selectedTypes },
            duration,
            poolInfo: poolData.info,
            hasEmail: poolData.hasEmail,
            hasEmoji: poolData.hasEmoji
        };
    }

    /**
     * 异步生成数据 (适用于大数据量)
     */
    async generateAsync(count, length, selectedTypes, progressCallback) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            const poolData = this.createCombinedPool(selectedTypes);
            const results = [];
            
            this.isGenerating = true;
            this.shouldStop = false;
            
            // 批次处理，避免阻塞UI
            const batchSize = Math.min(1000, Math.max(100, Math.floor(count / 100)));
            let processed = 0;
            
            const processBatch = () => {
                if (this.shouldStop) {
                    this.isGenerating = false;
                    reject(new Error('Generation cancelled'));
                    return;
                }
                
                const currentBatchSize = Math.min(batchSize, count - processed);
                
                // 生成当前批次
                for (let i = 0; i < currentBatchSize; i++) {
                    const text = this.generateSingleText(length, poolData);
                    results.push(text);
                    processed++;
                }
                
                // 更新进度
                const progress = Math.round((processed / count) * 100);
                if (progressCallback) {
                    progressCallback(progress, processed, count);
                }
                
                if (processed >= count) {
                    // 生成完成
                    const endTime = performance.now();
                    const duration = Math.round(endTime - startTime);
                    
                    this.isGenerating = false;
                    this.lastConfig = { count, length, selectedTypes };
                    
                    resolve({
                        data: results,
                        config: { count, length, selectedTypes },
                        duration,
                        poolInfo: poolData.info,
                        hasEmail: poolData.hasEmail,
                        hasEmoji: poolData.hasEmoji
                    });
                } else {
                    // 继续下一批次 (使用setTimeout避免阻塞)
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
     * 验证生成参数
     */
    validateConfig(count, length, selectedTypes) {
        const errors = [];
        
        if (!count || count < 1 || count > 1000000) {
            errors.push('数据个数必须在1-1000000之间');
        }
        
        if (!length || length < 1 || length > 10000) {
            errors.push('数据长度必须在1-10000之间');
        }
        
        if (!selectedTypes || selectedTypes.length === 0) {
            errors.push('至少选择一种字符类型');
        }
        
        return errors;
    }

    /**
     * 获取字符池统计信息
     */
    getPoolStats() {
        const stats = {};
        Object.keys(this.characterPools).forEach(type => {
            stats[type] = this.characterPools[type].length;
        });
        return stats;
    }
}

// 创建全局实例
window.textGenerator = new TextGenerator();