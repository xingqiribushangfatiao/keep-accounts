/**
 * Petal Ledger - Utility Functions
 * --------------------------------------------------------------------------
 * 通用工具：金额格式化、日期格式化、HTML 转义。
 */

const Utils = (() => {
    /**
     * 格式化金额（千分位 + 两位小数）
     */
    const formatCurrency = (amount, withSymbol = true) => {
        const num = Number(amount) || 0;
        const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return withSymbol ? `¥${formatted}` : formatted;
    };

    /**
     * YYYY-MM-DD → M月D日
     */
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    };

    /**
     * YYYY-MM-DD → M月D日 星期X
     */
    const formatDateWithWeekday = (dateStr) => {
        const d = new Date(dateStr);
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
    };

    /**
     * 相对日期（今天 / 昨天 / N天前 / M月D日）
     */
    const relativeDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.floor((today - d) / 86400000);
        if (diffDays === 0) return '今天';
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return `${diffDays}天前`;
        return formatDate(dateStr);
    };

    /**
     * 获取今天日期（YYYY-MM-DD）
     */
    const today = () => new Date().toISOString().slice(0, 10);

    /**
     * 获取月份字符串（YYYY-MM）
     */
    const currentMonth = () => new Date().toISOString().slice(0, 7);

    /**
     * HTML 转义
     */
    const escapeHtml = (str) =>
        String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    return {
        formatCurrency,
        formatDate,
        formatDateWithWeekday,
        relativeDate,
        today,
        currentMonth,
        escapeHtml,
    };
})();

if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
