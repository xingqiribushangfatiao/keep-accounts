import { api, tokenStore } from './client';

/**
 * 认证 API
 *   - login   → POST /api/auth/login
 *   - register→ POST /api/auth/register
 *   - logout  → POST /api/auth/logout
 *   - me      → GET  /api/auth/me
 */

export const authApi = {
  async login({ username, password, rememberMe = false }) {
    const data = await api.post('/auth/login', { username, password, rememberMe });
    if (data?.session?.token) tokenStore.set(data.session.token);
    return data;
  },

  async register({ username, password, confirmPassword }) {
    const data = await api.post('/auth/register', { username, password, confirmPassword });
    if (data?.session?.token) tokenStore.set(data.session.token);
    return data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // 即便后端失败,前端也强制清掉
    } finally {
      tokenStore.clear();
    }
  },

  async me() {
    return api.get('/auth/me');
  },
};
