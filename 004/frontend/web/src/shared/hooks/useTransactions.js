import { useCallback, useMemo, useState } from 'react';
import { MOCK_TRANSACTIONS, hydrateTransaction } from '@shared/lib/mockData';
import { useCategories } from './useCategories';

/**
 * 交易列表(本轮用 mock,后端 /api/transactions 上线后切换为 React Query)
 *   filters: { month?: 'YYYY-MM', type?: 'expense'|'income', bookId? }
 *   返回:{ items, total, addTx, updateTx, removeTx }
 */
export function useTransactions(filters = {}) {
  const categories = useCategories();
  const [list, setList] = useState(() => MOCK_TRANSACTIONS.map((tx) => hydrateTransaction(tx, categories)));

  // 筛选
  const items = useMemo(() => {
    return list.filter((tx) => {
      if (filters.type && tx.type !== filters.type) return false;
      if (filters.month && !tx.transactionDate.startsWith(filters.month)) return false;
      return true;
    });
  }, [list, filters.type, filters.month]);

  const addTx = useCallback((tx) => {
    const hydrated = hydrateTransaction({ uuid: 't-' + Date.now(), ...tx }, categories);
    setList((arr) => [hydrated, ...arr]);
  }, [categories]);

  const updateTx = useCallback((uuid, patch) => {
    setList((arr) =>
      arr.map((t) => (t.uuid === uuid ? hydrateTransaction({ ...t, ...patch }, categories) : t))
    );
  }, [categories]);

  const removeTx = useCallback((uuid) => {
    setList((arr) => arr.filter((t) => t.uuid !== uuid));
  }, []);

  return { items, total: items.length, addTx, updateTx, removeTx };
}
