import { useNavigate } from 'react-router-dom';
import BottomNav from '@shared/components/BottomNav.jsx';
import TopBar from '@shared/components/TopBar.jsx';
import { useAuth } from '@context/AuthContext';
import { useCurrentBook } from '@shared/hooks/useBooks';
import { useToast } from '@shared/components/Toast.jsx';

/**
 * 设置页
 *  - 用户名 + 简短 ID
 *  - 账本(只读:从 /api/books/current)
 *  - 5 个占位项(主题/货币/预算/导出/清空)→ alert
 *  - 退出登录
 */
const PLACEHOLDERS = [
  { icon: 'palette',        label: '主题',   note: 'v1.1 开放' },
  { icon: 'payments',       label: '货币',   note: 'CNY ¥'    },
  { icon: 'savings',        label: '预算',   note: 'v1.1 开放' },
  { icon: 'ios_share',      label: '导出',   note: 'v1.1 开放' },
  { icon: 'delete_sweep',   label: '清空',   note: 'v1.1 开放' },
];

export default function SettingsPage() {
  const navigate    = useNavigate();
  const { user, logout } = useAuth();
  const { data: book }   = useCurrentBook(!!user);
  const { showToast }    = useToast();

  const handleLogout = async () => {
    if (!window.confirm('确定退出当前账号吗?')) return;
    await logout();
    navigate('/login', { replace: true });
  };

  const handlePlaceholder = (label) => {
    showToast({ type: 'success', message: `${label} · v1.1 开放` });
  };

  return (
    <div className="min-h-screen bg-bg-soft-pink pb-24">
      <TopBar title="我的" />

      {/* 用户卡 */}
      <section className="px-4">
        <div className="rounded-3xl bg-surface-white border border-border-blush p-5 flex items-center gap-4 shadow-soft">
          <div className="w-14 h-14 rounded-full bg-primary-gradient text-on-primary flex items-center justify-center font-display font-bold text-2xl">
            {(user?.username || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-on-surface truncate">{user?.username || '游客'}</div>
            <div className="text-xs text-text-muted mt-0.5">ID: {user?.uuid?.slice(0, 8) || '-'}</div>
            <div className="text-xs text-text-muted">加入于 {user?.createdAt?.slice(0, 10) || '-'}</div>
          </div>
        </div>
      </section>

      {/* 账本 */}
      <section className="px-4 mt-5">
        <h3 className="text-xs text-text-muted mb-2 ml-2">账本</h3>
        <div className="rounded-2xl bg-surface-white border border-border-blush divide-y divide-border-blush">
          <div className="flex items-center gap-3 p-4">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>menu_book</span>
            <div className="flex-1">
              <div className="text-sm text-on-surface">{book?.name || '加载中…'}</div>
              <div className="text-xs text-text-muted">{book?.type || '-'} · {book?.currency || 'CNY'}</div>
            </div>
            {book?.isDefault && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-semibold">默认</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => showToast({ type: 'success', message: '新建账本 · v1.1 开放' })}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>add_circle</span>
            <span className="text-sm text-on-surface">新建账本</span>
            <span className="ml-auto text-xs text-text-muted">v1.1</span>
          </button>
        </div>
      </section>

      {/* 偏好 */}
      <section className="px-4 mt-5">
        <h3 className="text-xs text-text-muted mb-2 ml-2">偏好</h3>
        <div className="rounded-2xl bg-surface-white border border-border-blush divide-y divide-border-blush">
          {PLACEHOLDERS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePlaceholder(p.label)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>{p.icon}</span>
              <span className="flex-1 text-sm text-on-surface">{p.label}</span>
              <span className="text-xs text-text-muted">{p.note}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 退出 */}
      <section className="px-4 mt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-12 rounded-full bg-surface-white border border-error text-error font-semibold active:scale-[0.98]"
        >
          退出登录
        </button>
        <div className="text-center text-[11px] text-text-muted mt-3">Petal Ledger v2 · 004</div>
      </section>

      <BottomNav active="settings" />
    </div>
  );
}
