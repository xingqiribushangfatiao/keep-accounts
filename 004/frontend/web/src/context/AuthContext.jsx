import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@shared/api/auth';
import { authEvents, tokenStore } from '@shared/api/client';

/**
 * AuthContext
 * --------------------------------------------------------------------------
 *   user       : { id, uuid, username, lastLoginAt, createdAt } | null
 *   loading    : true 表示启动期 /me 还未完成
 *   login()    : 登录,写入 user
 *   register() : 注册,自动登录
 *   logout()   : 退出,清 user
 *   refresh()  : 重新拉 /me
 *
 * 401 全局监听:client.js 触发 unauthorized 事件 → 强制清 user,
 * 让 ProtectedRoute 跳 /login。
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // 启动期:有 token → /me 验证
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const data = await authApi.me();
        if (alive) setUser(data.user);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 401 全局监听
  useEffect(() => {
    return authEvents.onUnauthorized(() => setUser(null));
  }, []);

  const login = useCallback(async (payload) => {
    const data = await authApi.login(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
