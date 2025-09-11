/**
 * CSV数据格式生成器
 * 支持多种数据类型的随机生成
 */

class CSVFormats {
    constructor() {
        // 字符池定义
        this.characterPools = {
            numbers: '0123456789',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            chinese: '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严首底液官德随病苏失尔死讲配女黄推显谈罪神艺呢席含企望密批营项防举球英氧势告李台落木帮轮破亚师围注远字材排供河态封另施减树溶怎止案言士均武固叶鱼波视仅费紧爱左章早朝害续轻服试食充兵源判护司足某练差致板田降黑犯负击范继兴似余坚曲输修故城夫够送笔船占右财吃富春职觉汉画功巴跟虽杂飞检吸助升阳互初创抗考投坏策古径换未跑留钢曾端责站简述钱副尽帝射草冲承独令限阿宣环双请超微让控州良轴找否纪益依优顶础载倒房突坐粉敌略客袁冷胜绝析块剂测丝协重诉念陈仍罗盐友洋错苦夜刑移频逐靠混母短皮终聚汽村云哪既距卫停烈央察烧行迅境若印洲刻括激孔搞甚室待核校散侵吧甲游久菜味旧模湖货损预阻毫普稳乙妈植息扩银语挥酒守拿序纸医缺雨吗针刘啊急唱误训愿审附获茶鲜粮斤孩脱硫肥善龙演父渐血欢械掌歌沙著刀隐忍病井支适候集'
        };
        
        // 姓名数据
        this.names = {
            firstNames: ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'],
            lastNames: ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英']
        };
        
        // 城市数据
        this.cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '成都', '重庆', '武汉', '西安', '天津', '青岛', '大连', '宁波', '厦门', '福州', '济南', '长沙', '郑州'];
        
        // 公司后缀
        this.companySuffixes = ['有限公司', '股份有限公司', '科技有限公司', '贸易有限公司', '投资有限公司', '集团有限公司', '实业有限公司', '发展有限公司'];
        
        // 邮箱域名
        this.emailDomains = ['@gmail.com', '@163.com', '@qq.com', '@126.com', '@sina.com', '@hotmail.com', '@yahoo.com', '@outlook.com'];
    }

    /**
     * 生成随机字符串
     */
    generateText(config = {}) {
        const {
            length = 10,
            type = 'mixed', // mixed, english, chinese, numbers
            caseSensitive = true
        } = config;

        let pool = '';
        
        switch (type) {
            case 'numbers':
                pool = this.characterPools.numbers;
                break;
            case 'english':
                pool = caseSensitive ? 
                    this.characterPools.lowercase + this.characterPools.uppercase :
                    this.characterPools.lowercase;
                break;
            case 'chinese':
                pool = this.characterPools.chinese;
                break;
            case 'mixed':
            default:
                pool = this.characterPools.numbers + this.characterPools.lowercase + this.characterPools.uppercase;
                break;
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            result += pool.charAt(Math.floor(Math.random() * pool.length));
        }
        
        return result;
    }

    /**
     * 生成随机数字
     */
    generateNumber(config = {}) {
        const {
            type = 'integer', // integer, float, currency
            min = 0,
            max = 1000,
            decimals = 2
        } = config;

        let result;
        
        switch (type) {
            case 'float':
                result = Math.random() * (max - min) + min;
                return parseFloat(result.toFixed(decimals));
            case 'currency':
                result = Math.random() * (max - min) + min;
                return parseFloat(result.toFixed(2));
            case 'integer':
            default:
                return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    /**
     * 生成随机日期
     */
    generateDate(config = {}) {
        const {
            format = 'YYYY-MM-DD', // YYYY-MM-DD, YYYY/MM/DD, DD/MM/YYYY, MM/DD/YYYY, datetime
            startDate = '1900-01-01',
            endDate = new Date().toISOString().split('T')[0]
        } = config;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        const randomDate = new Date(randomTime);

        const year = randomDate.getFullYear();
        const month = String(randomDate.getMonth() + 1).padStart(2, '0');
        const day = String(randomDate.getDate()).padStart(2, '0');
        const hours = String(randomDate.getHours()).padStart(2, '0');
        const minutes = String(randomDate.getMinutes()).padStart(2, '0');
        const seconds = String(randomDate.getSeconds()).padStart(2, '0');

        switch (format) {
            case 'YYYY/MM/DD':
                return `${year}/${month}/${day}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'datetime':
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            case 'YYYY-MM-DD':
            default:
                return `${year}-${month}-${day}`;
        }
    }

    /**
     * 生成随机邮箱
     */
    generateEmail(config = {}) {
        const {
            length = 8,
            domain = null
        } = config;

        const username = this.generateText({ length, type: 'english', caseSensitive: false });
        const selectedDomain = domain || this.emailDomains[Math.floor(Math.random() * this.emailDomains.length)];
        
        return username + selectedDomain;
    }

    /**
     * 生成随机手机号
     */
    generatePhone(config = {}) {
        const {
            format = 'china', // china, us, international
            includeCountryCode = false
        } = config;

        switch (format) {
            case 'china':
                const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
                const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                const suffix = this.generateText({ length: 8, type: 'numbers' });
                return includeCountryCode ? `+86 ${prefix}${suffix}` : `${prefix}${suffix}`;
            case 'us':
                const areaCode = this.generateNumber({ min: 200, max: 999 });
                const exchange = this.generateNumber({ min: 200, max: 999 });
                const number = this.generateNumber({ min: 1000, max: 9999 });
                return includeCountryCode ? `+1 (${areaCode}) ${exchange}-${number}` : `(${areaCode}) ${exchange}-${number}`;
            case 'international':
            default:
                const countryCode = this.generateNumber({ min: 1, max: 999 });
                const phoneNumber = this.generateText({ length: 10, type: 'numbers' });
                return `+${countryCode} ${phoneNumber}`;
        }
    }

    /**
     * 生成随机布尔值
     */
    generateBoolean(config = {}) {
        const {
            format = 'boolean', // boolean, yesno, truefalse, 10
            probability = 0.5 // true的概率
        } = config;

        const isTrue = Math.random() < probability;

        switch (format) {
            case 'yesno':
                return isTrue ? 'Yes' : 'No';
            case 'truefalse':
                return isTrue ? 'True' : 'False';
            case '10':
                return isTrue ? '1' : '0';
            case 'boolean':
            default:
                return isTrue;
        }
    }

    /**
     * 生成随机姓名
     */
    generateName(config = {}) {
        const {
            type = 'chinese', // chinese, english, full
            gender = 'random' // male, female, random
        } = config;

        switch (type) {
            case 'chinese':
                const firstName = this.names.firstNames[Math.floor(Math.random() * this.names.firstNames.length)];
                const lastName = this.names.lastNames[Math.floor(Math.random() * this.names.lastNames.length)];
                return firstName + lastName;
            case 'english':
                const englishFirstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Mark', 'Emily'];
                const englishLastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
                const randomFirst = englishFirstNames[Math.floor(Math.random() * englishFirstNames.length)];
                const randomLast = englishLastNames[Math.floor(Math.random() * englishLastNames.length)];
                return `${randomFirst} ${randomLast}`;
            case 'full':
            default:
                return Math.random() > 0.5 ? this.generateName({ type: 'chinese' }) : this.generateName({ type: 'english' });
        }
    }

    /**
     * 生成随机地址
     */
    generateAddress(config = {}) {
        const {
            type = 'chinese', // chinese, english
            includePostalCode = false
        } = config;

        switch (type) {
            case 'chinese':
                const chineseCity = this.cities[Math.floor(Math.random() * this.cities.length)];
                const district = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'][Math.floor(Math.random() * 6)];
                const street = this.generateText({ length: 3, type: 'chinese' }) + '街';
                const number = this.generateNumber({ min: 1, max: 999 });
                const postalCode = includePostalCode ? ' ' + this.generateText({ length: 6, type: 'numbers' }) : '';
                return `${chineseCity}${district}${street}${number}号${postalCode}`;
            case 'english':
            default:
                const streetNumber = this.generateNumber({ min: 1, max: 9999 });
                const streetNames = ['Main St', 'Park Ave', 'Oak St', 'Pine St', 'Maple Ave', 'Cedar St', 'Elm St', 'Washington St'];
                const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
                const englishCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
                const englishCity = englishCities[Math.floor(Math.random() * englishCities.length)];
                const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'];
                const state = states[Math.floor(Math.random() * states.length)];
                const zipCode = includePostalCode ? ' ' + this.generateText({ length: 5, type: 'numbers' }) : '';
                return `${streetNumber} ${streetName}, ${englishCity}, ${state}${zipCode}`;
        }
    }

    /**
     * 生成随机公司名
     */
    generateCompany(config = {}) {
        const {
            type = 'chinese' // chinese, english
        } = config;

        switch (type) {
            case 'chinese':
                const companyPrefixes = ['华为', '腾讯', '阿里巴巴', '百度', '京东', '美团', '滴滴', '字节跳动', '小米', '海尔'];
                const chinesePrefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
                const chineseSuffix = this.companySuffixes[Math.floor(Math.random() * this.companySuffixes.length)];
                return chinesePrefix + chineseSuffix;
            case 'english':
            default:
                const englishPrefixes = ['Tech', 'Global', 'Advanced', 'Smart', 'Digital', 'Future', 'Innovation', 'Dynamic', 'Premier', 'Elite'];
                const englishSuffixes = [' Corp', ' Inc', ' LLC', ' Ltd', ' Technologies', ' Solutions', ' Systems', ' Group', ' Enterprises', ' Industries'];
                const englishPrefix = englishPrefixes[Math.floor(Math.random() * englishPrefixes.length)];
                const englishSuffix = englishSuffixes[Math.floor(Math.random() * englishSuffixes.length)];
                return englishPrefix + englishSuffix;
        }
    }

    /**
     * 生成UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 生成IP地址
     */
    generateIP(config = {}) {
        const {
            type = 'ipv4' // ipv4, ipv6
        } = config;

        switch (type) {
            case 'ipv6':
                let ipv6 = '';
                for (let i = 0; i < 8; i++) {
                    if (i > 0) ipv6 += ':';
                    ipv6 += Math.floor(Math.random() * 65536).toString(16);
                }
                return ipv6;
            case 'ipv4':
            default:
                return [1,2,3,4].map(() => Math.floor(Math.random() * 256)).join('.');
        }
    }

    /**
     * 生成随机颜色
     */
    generateColor(config = {}) {
        const {
            format = 'hex' // hex, rgb, hsl, name
        } = config;

        switch (format) {
            case 'rgb':
                const r = Math.floor(Math.random() * 256);
                const g = Math.floor(Math.random() * 256);
                const b = Math.floor(Math.random() * 256);
                return `rgb(${r}, ${g}, ${b})`;
            case 'hsl':
                const h = Math.floor(Math.random() * 360);
                const s = Math.floor(Math.random() * 101);
                const l = Math.floor(Math.random() * 101);
                return `hsl(${h}, ${s}%, ${l}%)`;
            case 'name':
                const colorNames = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'cyan', 'magenta'];
                return colorNames[Math.floor(Math.random() * colorNames.length)];
            case 'hex':
            default:
                return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        }
    }

    /**
     * 根据格式配置生成数据
     */
    generateByFormat(formatType, config = {}) {
        switch (formatType) {
            case 'text':
                return this.generateText(config);
            case 'number':
                return this.generateNumber(config);
            case 'date':
                return this.generateDate(config);
            case 'email':
                return this.generateEmail(config);
            case 'phone':
                return this.generatePhone(config);
            case 'boolean':
                return this.generateBoolean(config);
            case 'name':
                return this.generateName(config);
            case 'address':
                return this.generateAddress(config);
            case 'company':
                return this.generateCompany(config);
            case 'uuid':
                return this.generateUUID();
            case 'ip':
                return this.generateIP(config);
            case 'color':
                return this.generateColor(config);
            default:
                return this.generateText(config);
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVFormats;
} else {
    window.CSVFormats = CSVFormats;
}