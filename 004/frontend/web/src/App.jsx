import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@context/AuthContext';
import { ToastProvider } from '@shared/components/Toast.jsx';
import { queryClient } from '@shared/lib/queryClient';
import ProtectedRoute from '@routes/ProtectedRoute';

import LoginPage     from '@pages/LoginPage.jsx';
import RegisterPage  from '@pages/RegisterPage.jsx';
import HomePage      from '@pages/HomePage.jsx';
import ListPage      from '@pages/ListPage.jsx';
import RecordPage    from '@pages/RecordPage.jsx';
import StatsPage     from '@pages/StatsPage.jsx';
import SettingsPage  from '@pages/SettingsPage.jsx';

/**
 * Petal Ledger v2 — App 根
 *  HashRouter(file:// 友好)+ QueryClient + Auth + Toast
 *  /login /register 公开;其他全部经 ProtectedRoute
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/"             element={<HomePage />} />
                <Route path="/list"         element={<ListPage />} />
                <Route path="/record"       element={<RecordPage />} />
                <Route path="/record/:uuid" element={<RecordPage />} />
                <Route path="/stats"        element={<StatsPage />} />
                <Route path="/settings"     element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  );
}
