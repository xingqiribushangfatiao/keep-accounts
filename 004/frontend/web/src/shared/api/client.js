/**
 * 通用 fetch 客户端
 * --------------------------------------------------------------------------
 *  - 路径以 /api/* 形式传入(开发期 Vite 代理到 :3000)
 *  - 自动注入 Authorization: Bearer <token>(从 localStorage)
 *  - 401 时清 token + 触发 emitter 事件,AuthContext 监听后清 user
 *  - 业务错误格式: { code, message },抛出 ApiError
 */

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code || '请求失败');
    this.name    = 'ApiError';
    this.status  = status;
    this.code    = code;
  }
}

const TOKEN_KEY = 'pl_token';
const emitter   = new EventTarget();

export const authEvents = {
  onUnauthorized(handler) {
    const fn = () => handler();
    emitter.addEventListener('unauthorized', fn);
    return () => emitter.removeEventListener('unauthorized', fn);
  },
  emitUnauthorized() {
    emitter.dispatchEvent(new Event('unauthorized'));
  },
};

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * @param {string} path  e.g. '/auth/login'
 * @param {object} opts  { method, body, query, headers }
 */
export async function request(path, { method = 'GET', body, query, headers } = {}) {
  const url = new URL(path, '/api');
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, v);
    });
  }

  const token = tokenStore.get();
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  let json = null;
  try { json = await res.json(); } catch { /* 非 JSON 响应 */ }

  if (res.status === 401) {
    tokenStore.clear();
    authEvents.emitUnauthorized();
    throw new ApiError(401, json?.code || 'AUTH_INVALID', json?.message || '请重新登录');
  }
  if (!res.ok) {
    throw new ApiError(res.status, json?.code || 'API_ERROR', json?.message || `请求失败 (${res.status})`);
  }
  return json?.data;
}

export const api = {
  get:    (path, opts) => request(path, { ...opts, method: 'GET'    }),
  post:   (path, body, opts) => request(path, { ...opts, method: 'POST',   body }),
  patch:  (path, body, opts) => request(path, { ...opts, method: 'PATCH',  body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
