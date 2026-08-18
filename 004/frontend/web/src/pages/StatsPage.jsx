import { useState } from 'react';
import BottomNav from '@shared/components/BottomNav.jsx';
import TopBar from '@shared/components/TopBar.jsx';
import DonutChart from '@shared/components/DonutChart.jsx';
import { useStats } from '@shared/hooks/useStats';
import { formatCurrency } from '@shared/lib/formatDate';

/**
 * 统计页
 *  - range:week / month / year(本轮 month 数据完整,其他按 hook 计算)
 *  - 环形图 + 分类排行(全段显示,不截断)
 */
const RANGES = [
  { v: 'week',  l: '本周' },
  { v: 'month', l: '本月' },
  { v: 'year',  l: '本年' },
];

export default function StatsPage() {
  const [range, setRange] = useState('month');
  const stats = useStats({ range });

  const segments = stats.byCategory.map((c) => ({ value: c.amount, color: c.color }));
  const centerLabel = '支出';
  const centerValue = formatCurrency(stats.totalExpense);

  return (
    <div className="min-h-screen bg-bg-soft-pink pb-24">
      <TopBar title="统计" />

      {/* range tab */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex bg-surface-white rounded-full p-1 border border-border-blush">
          {RANGES.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => setRange(r.v)}
              className={[
                'flex-1 h-9 rounded-full text-sm transition',
                range === r.v ? 'bg-primary text-on-primary font-semibold' : 'text-text-muted',
              ].join(' ')}
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {/* 总览卡 */}
      <section className="px-4">
        <div className="rounded-3xl bg-primary-gradient text-on-primary p-5 shadow-level-2">
          <div className="text-xs opacity-90">收入</div>
          <div className="font-display font-bold text-2xl">{formatCurrency(stats.totalIncome)}</div>
          <div className="mt-2 text-xs opacity-90">支出</div>
          <div className="font-display font-bold text-2xl">{formatCurrency(stats.totalExpense)}</div>
          <div className="mt-3 pt-3 border-t border-white/20 flex justify-between text-sm">
            <span>结余</span>
            <span className="font-display font-bold">{formatCurrency(stats.balance)}</span>
          </div>
        </div>
      </section>

      {/* 环形图 + 排行 */}
      <section className="px-4 mt-5">
        <h3 className="font-display font-bold text-on-surface mb-3">分类占比</h3>
        {stats.totalExpense > 0 ? (
          <div className="rounded-3xl bg-surface-white border border-border-blush p-5 flex flex-col items-center">
            <DonutChart segments={segments} centerLabel={centerLabel} centerValue={centerValue} />
            <ul className="mt-4 w-full space-y-2">
              {stats.byCategory.map((c) => (
                <li key={c.categoryId} className="flex items-center gap-3 text-sm">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-lg">{c.icon}</span>
                  <span className="flex-1 text-on-surface">{c.name}</span>
                  <span className="text-text-muted">{c.percent}%</span>
                  <span className="font-display font-semibold text-on-surface w-24 text-right">
                    {formatCurrency(c.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-white border border-border-blush p-8 text-center text-text-muted text-sm">
            暂无支出数据
          </div>
        )}
      </section>

      <BottomNav active="stats" />
    </div>
  );
}
