import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@shared/api/books';

/**
 * 当前默认账本
 *   后端真实接口:GET /api/books/current
 *   失败/未登录时返回 null
 */
export function useCurrentBook(enabled = true) {
  return useQuery({
    queryKey: ['books', 'current'],
    queryFn:  () => booksApi.current().then((d) => d.book).catch(() => null),
    enabled,
    staleTime: 60_000,
  });
}
