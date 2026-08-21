/**
 * Petal Ledger (004) - Bottom Navigation
 *
 * 使用：<div id="bottom-nav" data-active="home"></div>
 *
 * 布局（默认 5 项 — 首页/明细/[+]/统计/设置）：
 *   [Home] [List] [+] [Stats] [Settings]
 *
 * 4 项布局（在挂载点上加 data-show-fab="false"）：
 *   [Home] [List] [Stats] [Settings]
 *   中间无凸起 [+] 按钮，4 等分
 */
(function () {
    const TABS_LEFT  = [
        { key: 'home',  label: '首页', icon: 'home',         href: 'home.html' },
        { key: 'list',  label: '明细', icon: 'receipt_long', href: 'list.html' },
    ];
    const TABS_RIGHT = [
        { key: 'stats',    label: '统计', icon: 'pie_chart', href: 'stats.html' },
        { key: 'settings', label: '设置', icon: 'settings',  href: 'settings.html' },
    ];

    const renderTab = (tab, activeTab) => {
        const isActive = tab.key === activeTab;
        const colorCls = isActive ? 'text-primary' : 'text-text-muted';
        const fill = isActive ? "style=\"font-variation-settings: 'FILL' 1;\"" : '';
        return `
        <a href="${tab.href}"
           class="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors ${colorCls}">
            <span class="material-symbols-outlined" ${fill}>${tab.icon}</span>
            <span class="text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}">${tab.label}</span>
        </a>`;
    };

    // 5 项布局 — 中间 [+] 按钮与其他 Tab 齐平
    const renderWithFab = (activeTab) => `
<nav class="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white/95 backdrop-blur-lg z-50 border-t border-border-blush"
     style="box-shadow: var(--shadow-bottom-nav);">
    <div class="flex justify-around items-stretch h-16 px-1 pb-safe">
        ${TABS_LEFT.map((t) => renderTab(t, activeTab)).join('')}
        <a href="record.html" aria-label="记一笔"
           class="add-fab flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors text-primary">
            <span class="material-symbols-outlined w-9 h-9 rounded-full text-white text-[24px] flex items-center justify-center"
                  style="background: var(--primary-gradient-strong); box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent); font-variation-settings: 'FILL' 1;">add</span>
            <span class="text-[11px] font-semibold">记一笔</span>
        </a>
        ${TABS_RIGHT.map((t) => renderTab(t, activeTab)).join('')}
    </div>
</nav>`;

    // 4 项布局 — 1:1 还原 Figma 设计，4 等分无 [+]
    const renderFourTabs = (activeTab) => {
        const allTabs = [...TABS_LEFT, ...TABS_RIGHT];
        return `
<nav class="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white/95 backdrop-blur-lg z-50 border-t border-border-blush"
     style="box-shadow: var(--shadow-bottom-nav);">
    <div class="flex justify-around items-center h-16 px-2 pb-safe">
        ${allTabs.map((t) => renderTab(t, activeTab)).join('')}
    </div>
</nav>`;
    };

    const init = () => {
        const el = document.getElementById('bottom-nav');
        if (!el) return;
        const active = el.dataset.active || '';
        const showFab = el.dataset.showFab !== 'false';
        el.outerHTML = showFab ? renderWithFab(active) : renderFourTabs(active);
    };

    if (typeof window !== 'undefined') {
        window.BottomNav = { init, renderWithFab, renderFourTabs };
    }
})();
