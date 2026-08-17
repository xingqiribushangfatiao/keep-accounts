/**
 * Petal Ledger (004) - Utility Functions
 */

const Utils = (() => {
    const formatCurrency = (amount, withSymbol = true) => {
        const num = Number(amount) || 0;
        const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return withSymbol ? `¥${formatted}` : formatted;
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}月${d.getDate()}日`;
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

    const today = () => new Date().toISOString().slice(0, 10);
    const currentMonth = () => new Date().toISOString().slice(0, 7);

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
        formatDateWithWeekday,
        relativeDate,
        today,
        currentMonth,
        escapeHtml,
        formatTime,
    };
})();

if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
