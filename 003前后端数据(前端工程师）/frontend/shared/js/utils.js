/**
 * Petal Ledger (004) - Utility Functions
 */

const Utils = (() => {
    /* ========== 货币(localStorage 持久化)========== */
    const CURRENCIES = {
        CNY: { code: 'CNY', name: '人民币', symbol: '¥', flag: '🇨🇳', desc: 'CNY · 人民币元' },
        USD: { code: 'USD', name: '美元',   symbol: '$', flag: '🇺🇸', desc: 'USD · US Dollar' },
        EUR: { code: 'EUR', name: '欧元',   symbol: '€', flag: '🇪🇺', desc: 'EUR · Euro' },
    };
    const CURRENCY_KEY = 'petal:settings:currency';
    const getCurrency        = () => localStorage.getItem(CURRENCY_KEY) || 'CNY';
    const setCurrency        = (code) => { if (CURRENCIES[code]) localStorage.setItem(CURRENCY_KEY, code); };
    const getCurrencySymbol  = (code = getCurrency()) => (CURRENCIES[code] || CURRENCIES.CNY).symbol;
    const getCurrencyName    = (code = getCurrency()) => (CURRENCIES[code] || CURRENCIES.CNY).name;

    const formatCurrency = (amount, withSymbol = true) => {
        const num = Number(amount) || 0;
        const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return withSymbol ? `${getCurrencySymbol()}${formatted}` : formatted;
    };

    /* ========== 主题外观(localStorage 持久化)========== */
    const THEMES = {
        pink:   { id: 'pink',   name: '浅粉色', desc: '甜蜜樱花粉', swatch: 'linear-gradient(135deg, #FF6B9D 0%, #FFB1C5 100%)' },
        mint:   { id: 'mint',   name: '薄荷绿', desc: '清新薄荷绿', swatch: 'linear-gradient(135deg, #10AC84 0%, #6EE7B7 100%)' },
        orange: { id: 'orange', name: '橘子橙', desc: '活力橘子橙', swatch: 'linear-gradient(135deg, #FF8C42 0%, #FFB088 100%)' },
        purple: { id: 'purple', name: '浅紫色', desc: '梦幻薰衣草', swatch: 'linear-gradient(135deg, #A78BFA 0%, #C4B0FF 100%)' },
        blue:   { id: 'blue',   name: '浅蓝色', desc: '清爽天空蓝', swatch: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)' },
    };
    const THEME_KEY = 'petal:settings:theme';
    const getTheme    = () => localStorage.getItem(THEME_KEY) || 'pink';
    const setTheme    = (id) => { if (THEMES[id]) { localStorage.setItem(THEME_KEY, id); applyTheme(id); } };
    const applyTheme  = (id = getTheme()) => {
        if (!THEMES[id]) id = 'pink';
        document.documentElement.dataset.theme = id;
    };
    // 脚本一加载即应用保存的主题,避免页面先以粉色渲染再切换的闪烁
    applyTheme();

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    };

    /* ========== 长日期(2026年08月21日)给 list 页分组标题用 ========== */
    // pad2 复用下面"日期(本地时区)"区块已声明的版本,避免 const 重名 SyntaxError
    const formatDateLong = (date) => {
        const d = (date instanceof Date) ? date : new Date(date);
        if (Number.isNaN(d.getTime())) return '';
        return `${d.getFullYear()}年${pad2(d.getMonth() + 1)}月${pad2(d.getDate())}日`;
    };

    const formatDateWithWeekday = (dateStr) => {
        const d = new Date(dateStr);
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    };

    const relativeDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.floor((today - d) / 86400000);
        if (diffDays === 0) return '今天';
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return `${diffDays}天前`;
        return formatDate(dateStr);
    };

    /* ========== 日期(本地时区)==========
     * toISOString().slice(0,10) 永远返回 UTC 日期,在 UTC+8 凌晨会少一天
     * 用本地年月日组装,确保与"今天/本月"一致
     */
    const pad2 = (n) => String(n).padStart(2, '0');
    const localDateStr = (d) => {
        d = d || new Date();
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    };
    const localMonthStr = (d) => {
        d = d || new Date();
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    };
    const today = () => localDateStr();
    const currentMonth = () => localMonthStr();

    const escapeHtml = (str) =>
        String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const formatTime = (timestamp) => {
        const d = new Date(timestamp);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return {
        formatCurrency,
        formatDate,
        formatDateLong,
        formatDateWithWeekday,
        relativeDate,
        today,
        currentMonth,
        escapeHtml,
        formatTime,
        CURRENCIES,
        CURRENCY_KEY,
        getCurrency,
        setCurrency,
        getCurrencySymbol,
        getCurrencyName,
        THEMES,
        THEME_KEY,
        getTheme,
        setTheme,
        applyTheme,
    };
})();

if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
