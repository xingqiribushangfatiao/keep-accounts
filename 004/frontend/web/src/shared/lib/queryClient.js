import { QueryClient } from '@tanstack/react-query';

/**
 * 全局 QueryClient
 *   - staleTime 30s:期间内复用缓存,减少重复请求
 *   - retry 1:失败重试一次(网络抖动场景)
 *   - refetchOnWindowFocus false:窗口聚焦不重拉(账本数据稳定)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
