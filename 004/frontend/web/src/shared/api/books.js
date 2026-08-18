import { api } from './client';

/**
 * 账本 API
 *   - current → GET /api/books/current
 *   - 完整 CRUD 待后端补齐后追加
 */

export const booksApi = {
  async current() {
    return api.get('/books/current');
  },
};
