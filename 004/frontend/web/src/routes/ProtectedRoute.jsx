import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import Spinner from '@shared/components/Spinner.jsx';

/**
 * 鉴权守卫
 *   - loading:展示 spinner,不直接跳(避免刷新闪烁到 /login)
 *   - 未登录:跳 /login,并保留 from = 当前路径
 *   - 已登录:渲染 <Outlet />
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft-pink">
        <Spinner size={32} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <OutletPlaceholder />;
}

// 不引入 react-router 的 Outlet 也能跑(本文件只服务于鉴权)
import { Outlet } from 'react-router-dom';
function OutletPlaceholder() {
  return <Outlet />;
}
