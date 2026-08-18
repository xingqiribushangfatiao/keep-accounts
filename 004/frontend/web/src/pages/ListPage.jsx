import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@shared/components/BottomNav.jsx';
import TopBar from '@shared/components/TopBar.jsx';
import SwipeRow from '@shared/components/SwipeRow.jsx';
import { useTransactions } from '@shared/hooks/useTransactions';
import { useToast } from '@shared/components/Toast.jsx';
import { formatCurrency, formatDate, currentMonth } from '@shared/lib/formatDate';

/**
 * 明细页
 *  - 月份下拉(近 3 月)+ 类型筛(全部/支出/收入)
 *  - 列表按日期分组
 *  - 左滑删除(桌面端显示小红 ×)
 */
const MONTH_OPTS = (() => {
  const out = [];
  const base = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ value: ym, label: `${d.getMonth() + 1}月` });
  }
  return out;
})();

export default function ListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [month, setMonth]   = useState(currentMonth());
  const [type,  setType]    = useState('all'); // 'all' | 'expense' | 'income'
  const { items, removeTx } = useTransactions({ month });

  const filtered = useMemo(() => {
    if (type === 'all') return items;
    return items.filter((t) => t.type === type);
  }, [items, type]);

  // 按日期分组
  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((tx) => {
      const d = tx.transactionDate;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(tx);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleDelete = (tx) => {
    removeTx(tx.uuid);
    showToast({ type: 'success', message: '已删除' });
  };

  return (
    <div className="min-h-screen bg-bg-soft-pink pb-24">
      <TopBar title="明细" />

      {/* 筛选条 */}
      <div className="px-4 pt-2 pb-3 flex items-center gap-2">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-9 px-3 rounded-full bg-surface-white border border-border-blush text-sm text-on-surface"
        >
          {MONTH_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="flex-1 flex bg-surface-white rounded-full p-0.5 border border-border-blush text-sm">
          {[
            { v: 'all',     l: '全部' },
            { v: 'expense', l: '支出' },
            { v: 'income',  l: '收入' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setType(opt.v)}
              className={[
                'flex-1 h-8 rounded-full transition',
                type === opt.v ? 'bg-primary text-on-primary font-semibold' : 'text-text-muted',
              ].join(' ')}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      <div className="px-4">
        {groups.length === 0 ? (
          <div className="mt-12 text-center text-text-muted text-sm">
            还没有记录,快去 <button onClick={() => navigate('/record')} className="text-primary font-semibold">记一笔</button>
          </div>
        ) : (
          groups.map(([date, txs]) => {
            const daySum = txs.reduce((s, t) => s + (t.type === 'expense' ? -Number(t.amount) : Number(t.amount)), 0);
            return (
              <section key={date} className="mb-4">
                <div className="flex items-center justify-between px-1 py-2 text-xs text-text-muted">
                  <span>{formatDate(date)}</span>
                  <span className={daySum < 0 ? 'text-expense-red' : 'text-income-teal'}>
                    {daySum < 0 ? '-' : '+'}{formatCurrency(Math.abs(daySum))}
                  </span>
                </div>
                <ul className="space-y-2">
                  {txs.map((tx) => (
                    <li key={tx.uuid}>
                      <SwipeRow onDelete={() => handleDelete(tx)}>
                        <div
                          onClick={() => navigate(`/record/${tx.uuid}`)}
                          className="flex items-center gap-3 p-3 cursor-pointer"
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
                            <div className="text-xs text-text-muted">{tx.category?.name}</div>
                          </div>
                          <div
                            className={[
                              'font-display font-semibold text-base',
                              tx.type === 'expense' ? 'text-expense-red' : 'text-income-teal',
                            ].join(' ')}
                          >
                            {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                          </div>
                        </div>
                      </SwipeRow>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>

      <BottomNav active="list" />
    </div>
  );
}
