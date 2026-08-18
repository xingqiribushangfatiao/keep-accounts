import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@shared/components/Toast.jsx';
import Spinner from '@shared/components/Spinner.jsx';

/**
 * 注册页
 *  - 校验:用户名 3-20(中英文/字母/数字/下划线) / 密码 6-20 含字母+数字 / 两次一致
 *  - 注册成功 → 自动登录 → /
 */
export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const { showToast }              = useToast();
  const navigate                    = useNavigate();

  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [submitting, setSub] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft-pink">
        <Spinner size={32} />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const { username, password, confirm } = form;
    if (!/^[一-龥_a-zA-Z0-9]{3,20}$/.test(username)) {
      return '用户名需 3-20 位(中英文/字母/数字/下划线)';
    }
    if (password.length < 6 || password.length > 20) {
      return '密码需 6-20 位';
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return '密码需同时包含字母和数字';
    }
    if (password !== confirm) {
      return '两次输入的密码不一致';
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const err = validate();
    if (err) {
      showToast({ type: 'error', message: err });
      return;
    }
    setSub(true);
    try {
      await register({
        username:        form.username.trim(),
        password:        form.password,
        confirmPassword: form.confirm,
      });
      navigate('/', { replace: true });
    } catch (e2) {
      showToast({ type: 'error', message: e2?.message || '注册失败' });
    } finally {
      setSub(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft-pink flex flex-col">
      <div className="h-1/4 bg-primary-gradient flex items-center justify-center text-on-primary pt-safe">
        <div className="text-center">
          <div className="text-5xl mb-1">🌸</div>
          <div className="font-display text-xl font-bold">创建新账号</div>
        </div>
      </div>

      <form onSubmit={submit} className="flex-1 px-6 pt-6 pb-12">
        <label className="block text-xs text-text-muted mb-2 ml-4">用户名</label>
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 20 }}>person</span>
          <input
            value={form.username}
            onChange={update('username')}
            placeholder="3-20 位(中英文/字母/数字/下划线)"
            className="input-field"
            autoComplete="username"
          />
        </div>

        <label className="block text-xs text-text-muted mb-2 ml-4">密码</label>
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 20 }}>lock</span>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="6-20 位,含字母和数字"
            className="input-field"
            autoComplete="new-password"
          />
        </div>

        <label className="block text-xs text-text-muted mb-2 ml-4">确认密码</label>
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 20 }}>lock_reset</span>
          <input
            type="password"
            value={form.confirm}
            onChange={update('confirm')}
            placeholder="再输入一次"
            className="input-field"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-full bg-primary-gradient text-on-primary font-semibold shadow-level-2 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? <Spinner size={18} className="border-on-primary border-t-transparent" /> : null}
          {submitting ? '注册中…' : '注 册'}
        </button>

        <div className="mt-4 text-center text-sm text-text-muted">
          已有账号?{' '}
          <Link to="/login" className="text-primary font-semibold">返回登录</Link>
        </div>
      </form>
    </div>
  );
}
