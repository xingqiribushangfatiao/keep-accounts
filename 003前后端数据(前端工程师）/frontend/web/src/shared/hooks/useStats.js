import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useCategories } from './useCategories';

/**
 * 月度统计(本轮用 mock,后端 /api/stats/summary 上线后切换)
 *   range: 'week' | 'month' | 'year'  (本轮只实现 month 完整逻辑)
 *   返回:
 *     { totalExpense, totalIncome, balance, todayExpense, todayCount,
 *       byCategory: [{ categoryId, amount, percent, color, name, icon }],
 *       byDate: [{ date, expense, income }] }
 */
export function useStats({ range = 'month' } = {}) {
  const categories = useCategories();
  const { items }   = useTransactions();

  return useMemo(() => {
    const today = new Date();
    const ym    = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const ymd   = `${ym}-${String(today.getDate()).padStart(2, '0')}`;

    // 范围筛选
    const inRange = (date) => {
      if (range === 'month') return date.startsWith(ym);
      if (range === 'year')  return date.startsWith(`${today.getFullYear()}-`);
      if (range === 'week') {
        const d = new Date(date);
        const day = d.getDay() || 7;        // 周日 → 7
        const monday = new Date(today);
        monday.setDate(today.getDate() - (day - 1));
        return d >= monday && d <= today;
      }
      return true;
    };

    const scoped = items.filter((t) => inRange(t.transactionDate));
    let totalExpense = 0, totalIncome = 0, todayExpense = 0, todayCount = 0;
    const byCategoryMap = new Map();
    const byDateMap     = new Map();

    scoped.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'expense') totalExpense += amt;
      else                       totalIncome  += amt;
      if (tx.transactionDate === ymd) {
        if (tx.type === 'expense') { todayExpense += amt; todayCount += 1; }
      }
      if (tx.type === 'expense') {
        const cur = byCategoryMap.get(tx.categoryId) || 0;
        byCategoryMap.set(tx.categoryId, cur + amt);
      }
      const d = tx.transactionDate;
      const cur = byDateMap.get(d) || { date: d, expense: 0, income: 0 };
      if (tx.type === 'expense') cur.expense += amt;
      else                       cur.income  += amt;
      byDateMap.set(d, cur);
    });

    const byCategory = [...byCategoryMap.entries()]
      .map(([cid, amt]) => {
        const cat = categories.find((c) => c.id === cid);
        return {
          categoryId: cid,
          amount:     amt,
          percent:    totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0,
          name:       cat?.name  || '其他',
          icon:       cat?.icon  || '📦',
          color:      cat?.color || '#8395A7',
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const byDate = [...byDateMap.values()].sort((a, b) => a.date.localeCompare(b.date));

    return {
      range,
      totalExpense: round2(totalExpense),
      totalIncome:  round2(totalIncome),
      balance:      round2(totalIncome - totalExpense),
      todayExpense: round2(todayExpense),
      todayCount,
      byCategory,
      byDate,
    };
  }, [items, categories, range]);
}

function round2(n) { return Math.round(n * 100) / 100; }
