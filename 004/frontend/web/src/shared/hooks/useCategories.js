import { useMemo } from 'react';
import { MOCK_CATEGORIES } from '@shared/lib/mockData';

/**
 * 分类列表(本轮用 mock,后端 /api/categories 上线后切换)
 *   type: 'expense' | 'income' | undefined(全部)
 */
export function useCategories(type) {
  const items = useMemo(() => {
    if (!type) return MOCK_CATEGORIES;
    return MOCK_CATEGORIES.filter((c) => c.type === type);
  }, [type]);
  return items;
}
