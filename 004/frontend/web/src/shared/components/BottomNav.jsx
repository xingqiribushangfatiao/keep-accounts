import { NavLink } from 'react-router-dom';

/**
 * 底部导航 — 4 项
 *   active: 'home' | 'list' | 'stats' | 'settings'
 */
const ITEMS = [
  { key: 'home',     path: '/',         label: '首页', icon: 'home'        },
  { key: 'list',     path: '/list',     label: '明细', icon: 'receipt_long'},
  { key: 'stats',    path: '/stats',    label: '统计', icon: 'pie_chart'   },
  { key: 'settings', path: '/settings', label: '我的', icon: 'person'      },
];

export default function BottomNav({ active }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-surface-white border-t border-border-blush pb-safe shadow-bottom-nav"
      style={{ height: 'calc(64px + var(--safe-area-bottom, 0px))' }}
    >
      <ul className="grid grid-cols-4 h-16">
        {ITEMS.map((it) => {
          const isActive = it.key === active;
          return (
            <li key={it.key}>
              <NavLink
                to={it.path}
                end={it.path === '/'}
                className="h-full flex flex-col items-center justify-center gap-0.5 text-xs"
              >
                <span
                  className={`material-symbols-outlined ${isActive ? 'fill text-primary' : 'text-text-muted'}`}
                  style={{ fontSize: 24 }}
                >
                  {it.icon}
                </span>
                <span className={isActive ? 'text-primary font-semibold' : 'text-text-muted'}>
                  {it.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
