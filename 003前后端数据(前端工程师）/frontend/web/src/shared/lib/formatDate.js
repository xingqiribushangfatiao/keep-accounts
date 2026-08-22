/**
 * 日期/金额格式化工具集
 * --------------------------------------------------------------------------
 * 从 004/frontend/shared/js/utils.js 迁移并修复:
 *   - formatDateWithWeekday 真正返回 "8月17日 周日"
 *   - 其余 6 个工具保持原行为
 */

const PAD = (n) => String(n).padStart(2, '0');

/** 数字 → ¥1,234.50  */
export function formatCurrency(num) {
  const n = Number(num) || 0;
  const sign = n < 0 ? '-' : '';
  const abs  = Math.abs(n);
  return `${sign}¥${abs.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 'YYYY-MM-DD' → '8月17日' */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 'YYYY-MM-DD' → '8月17日 周日' */
export function formatDateWithWeekday(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

/** 'YYYY-MM-DD' → '今天' / '昨天' / 'N 天前' */
export function relativeDate(dateStr) {
  if (!dateStr) return '';
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return dateStr;
  const now = new Date();
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(target, now)) return '今天';
  if (sameDay(target, yesterday)) return '昨天';
  const diffDays = Math.floor((now - target) / (1000 * 60 * 60 * 24));
  if (diffDays > 0 && diffDays < 30) return `${diffDays} 天前`;
  return formatDate(dateStr);
}

/** 今天 → 'YYYY-MM-DD' */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${PAD(d.getMonth() + 1)}-${PAD(d.getDate())}`;
}

/** 本月 → 'YYYY-MM' */
export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${PAD(d.getMonth() + 1)}`;
}

/** 任意 Date → 'HH:mm' */
export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${PAD(d.getHours())}:${PAD(d.getMinutes())}`;
}

/** XSS 防御 */
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
