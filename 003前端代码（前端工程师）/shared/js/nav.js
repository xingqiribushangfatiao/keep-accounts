/**
 * Petal Ledger - Bottom Navigation (Shared Component)
 * --------------------------------------------------------------------------
 * 渲染底部导航栏，自动根据当前页面高亮对应 Tab。
 * 使用方式：<div id="bottom-nav" data-active="home"></div>
 */

const BottomNav = (() => {
    const TABS = [
        { key: 'home',     label: '首页', icon: 'home',         href: 'home.html' },
        { key: 'list',     label: '明细', icon: 'receipt_long', href: 'list.html' },
        { key: 'stats',    label: '统计', icon: 'leaderboard',  href: 'stats.html' },
        { key: 'settings', label: '设置', icon: 'settings',     href: 'settings.html' },
    ];

    /**
     * 渲染 HTML 字符串
     */
    const renderHTML = (activeTab) => `
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-surface/90 backdrop-blur-lg px-2 pb-safe z-50 rounded-t-xl border-t border-border-blush"
     style="box-shadow: var(--shadow-bottom-nav);">
    ${TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const cls = isActive
            ? 'text-primary font-bold bg-primary-container/20 rounded-xl scale-90'
            : 'text-text-muted hover:text-primary';
        const fill = isActive ? "style=\"font-variation-settings: 'FILL' 1;\"" : '';
        return `
    <a href="${tab.href}"
       class="flex flex-col items-center justify-center px-4 py-1 transition-colors flex-1 ${cls}">
        <span class="material-symbols-outlined" ${fill}>${tab.icon}</span>
        <span class="font-label-caps text-label-caps mt-1">${tab.label}</span>
    </a>`;
    }).join('')}
</nav>`;

    /**
     * 自动初始化：查找 #bottom-nav 容器并替换
     */
    const init = () => {
        const el = document.getElementById('bottom-nav');
        if (!el) return;
        const active = el.dataset.active || '';
        el.outerHTML = renderHTML(active);
    };

    return { renderHTML, init };
})();

if (typeof window !== 'undefined') {
    window.BottomNav = BottomNav;
}
