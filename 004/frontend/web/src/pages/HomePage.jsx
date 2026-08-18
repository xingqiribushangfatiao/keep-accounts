import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '@shared/components/BottomNav.jsx';
import { useAuth } from '@context/AuthContext';
import { useCurrentBook } from '@shared/hooks/useBooks';
import { useStats } from '@shared/hooks/useStats';
import { useTransactions } from '@shared/hooks/useTransactions';
import { formatCurrency, formatDateWithWeekday, today } from '@shared/lib/formatDate';

/**
 * 首页
 *  - Hero 卡:本月支出 / 本月收入 / 今日支出
 *  - 最近 4 条交易(跳详情:暂无,先做占位)
 *  - FAB [+] 跳 /record
 *  - BottomNav 4 项
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: book } = useCurrentBook(!!user);
  const stats         = useStats({ range: 'month' });
  const { items }     = useTransactions();

  const recent = items.slice(0, 4);
  const ymd    = today();

  return (
    <div className="min-h-screen bg-bg-soft-pink pb-24">
      {/* 顶部用户信息 */}
      <header className="px-5 pt-4 pb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-gradient text-on-primary flex items-center justify-center font-display font-bold">
          {(user?.username || '?').slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-sm text-text-muted">Hi, {user?.username || '游客'} 👋</div>
          <div className="text-xs text-text-muted">{formatDateWithWeekday(ymd)}</div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full bg-surface-white border border-border-blush flex items-center justify-center"
          aria-label="设置"
        >
          <span className="material-symbols-outlined text-text-muted" style={{ fontSize: 20 }}>settings</span>
        </button>
      </header>

      {/* Hero 卡 */}
      <section className="px-5 mt-2">
        <div className="rounded-3xl bg-primary-gradient text-on-primary p-5 shadow-level-2">
          <div className="text-xs opacity-90">本月支出</div>
          <div className="font-display font-bold text-3xl mt-1">
            {formatCurrency(stats.totalExpense)}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div className="text-xs opacity-90">本月收入</div>
              <div className="font-display font-semibold text-base mt-0.5">
                {formatCurrency(stats.totalIncome)}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-90">今日支出</div>
              <div className="font-display font-semibold text-base mt-0.5">
                {formatCurrency(stats.todayExpense)}
              </div>
            </div>
          </div>
          <div className="mt-4 text-[11px] opacity-80 flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>menu_book</span>
            {book ? book.name : '加载账本中…'}
          </div>
        </div>
      </section>

      {/* 快捷入口 */}
      <section className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-3">
          <Link to="/record" className="rounded-2xl bg-surface-white border border-border-blush p-3 text-center active:scale-95 transition">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>edit_note</span>
            <div className="text-xs text-on-surface mt-1">记一笔</div>
          </Link>
          <Link to="/list" className="rounded-2xl bg-surface-white border border-border-blush p-3 text-center active:scale-95 transition">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>receipt_long</span>
            <div className="text-xs text-on-surface mt-1">明细</div>
          </Link>
          <Link to="/stats" className="rounded-2xl bg-surface-white border border-border-blush p-3 text-center active:scale-95 transition">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>pie_chart</span>
            <div className="text-xs text-on-surface mt-1">统计</div>
          </Link>
        </div>
      </section>

      {/* 最近交易 */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-on-surface">最近记录</h3>
          <Link to="/list" className="text-xs text-primary">查看全部 →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl bg-surface-white border border-border-blush p-6 text-center text-text-muted text-sm">
            还没有记录,快去 <Link to="/record" className="text-primary font-semibold">记一笔</Link> 吧~
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((tx) => (
              <li
                key={tx.uuid}
                onClick={() => navigate(`/record/${tx.uuid}`)}
                className="rounded-2xl bg-surface-white border border-border-blush p-3 flex items-center gap-3 active:scale-[0.99] cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: tx.category?.color + '22' }}
                >
                  <span style={{ fontSize: 20 }}>{tx.category?.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-on-surface truncate">
                    {tx.note || tx.category?.name || '未分类'}
                  </div>
                  <div className="text-xs text-text-muted">
                    {formatDateWithWeekday(tx.transactionDate)}
                  </div>
                </div>
                <div
                  className={[
                    'font-display font-semibold text-base',
                    tx.type === 'expense' ? 'text-expense-red' : 'text-income-teal',
                  ].join(' ')}
                >
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FAB */}
      <button
        type="button"
        onClick={() => navigate('/record')}
        className="fixed right-5 bottom-20 w-14 h-14 rounded-full bg-primary-gradient text-on-primary shadow-level-2 flex items-center justify-center active:scale-95"
        aria-label="记一笔"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
      </button>

      <BottomNav active="home" />
    </div>
  );
}
