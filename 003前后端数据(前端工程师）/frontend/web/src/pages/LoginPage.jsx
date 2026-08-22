import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@shared/components/Toast.jsx';
import Spinner from '@shared/components/Spinner.jsx';

/**
 * 登录页
 *  - 已登录访问 → 强制跳 /
 *  - 校验:用户名 3-20 / 密码 ≥6
 *  - 错误码 401 → 红 toast
 */
export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const { showToast }           = useToast();
  const navigate                 = useNavigate();
  const location                 = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSub]     = useState(false);

  // 已登录 → /
  useEffect(() => {
    if (!loading && user) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft-pink">
        <Spinner size={32} />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const u = username.trim();
    if (u.length < 3 || u.length > 20) {
      showToast({ type: 'error', message: '用户名需 3-20 字符' });
      return;
    }
    if (password.length < 6) {
      showToast({ type: 'error', message: '密码至少 6 位' });
      return;
    }
    setSub(true);
    try {
      await login({ username: u, password });
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      showToast({ type: 'error', message: err?.message || '登录失败' });
    } finally {
      setSub(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft-pink flex flex-col">
      {/* 顶部插画区 */}
      <div className="h-1/3 bg-primary-gradient flex flex-col items-center justify-center text-on-primary pt-safe">
        <div className="text-6xl mb-2">💖</div>
        <div className="font-display text-2xl font-bold">Petal Ledger</div>
        <div className="text-sm opacity-90 mt-1">随手记账 · 让生活更轻盈</div>
      </div>

      <form onSubmit={submit} className="flex-1 px-6 pt-8 pb-12">
        <h2 className="text-xl font-display font-bold text-on-surface mb-6">欢迎回来</h2>

        <label className="block text-xs text-text-muted mb-2 ml-4">用户名</label>
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 20 }}>person</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            autoComplete="username"
            className="input-field"
          />
        </div>

        <label className="block text-xs text-text-muted mb-2 ml-4">密码</label>
        <div className="relative mb-2">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 20 }}>lock</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 h-12 rounded-full bg-primary-gradient text-on-primary font-semibold shadow-level-2 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? <Spinner size={18} className="border-on-primary border-t-transparent" /> : null}
          {submitting ? '登录中…' : '登 录'}
        </button>

        <div className="mt-4 text-center text-sm text-text-muted">
          还没有账号?{' '}
          <Link to="/register" className="text-primary font-semibold">立即注册</Link>
        </div>

        <div className="mt-8 p-3 rounded-2xl bg-surface-white border border-border-blush text-xs text-text-muted">
          <div className="font-semibold text-on-surface mb-1">演示账号</div>
          <div>用户名:<code className="text-primary">petal_love</code> / 密码:<code className="text-primary">password123</code></div>
        </div>
      </form>
    </div>
  );
}
