/**
 * Petal Ledger - Auth State (Mock)
 * --------------------------------------------------------------------------
 * 模拟登录状态。生产环境应使用 localStorage + crypto.subtle 哈希密码。
 * 路由跳转：未登录 → login / 已登录 → home
 */

const Auth = (() => {
    const STORAGE_KEY = 'petal_ledger_session';
    const USERS_KEY = 'petal_ledger_users';

    /**
     * 当前是否已登录
     */
    const isLoggedIn = () => {
        const session = localStorage.getItem(STORAGE_KEY);
        if (!session) return false;
        try {
            const data = JSON.parse(session);
            return data.expiresAt > Date.now();
        } catch {
            return false;
        }
    };

    /**
     * 模拟注册（演示用：写入用户表 + 自动登录）
     */
    const register = (username, password) => {
        if (!username || !password) {
            return { ok: false, message: '请填写完整的注册信息' };
        }
        if (username.length < 3 || username.length > 20) {
            return { ok: false, message: '用户名为3-20位' };
        }
        if (password.length < 6 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            return { ok: false, message: '密码需6-20位，且至少包含字母和数字' };
        }

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        if (users.find((u) => u.username === username)) {
            return { ok: false, message: '该用户名已被注册，请更换' };
        }

        users.push({
            id: 'u_' + Date.now(),
            username,
            createdAt: Date.now(),
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        login(username, false);
        return { ok: true };
    };

    /**
     * 模拟登录（演示阶段任意密码都通过，正式版需 SHA-256 校验）
     */
    const login = (username, rememberMe = false) => {
        const session = {
            userId: 'demo-user-001',
            username,
            expiresAt: rememberMe
                ? Date.now() + 7 * 24 * 60 * 60 * 1000
                : Date.now() + 24 * 60 * 60 * 1000,
            rememberMe,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return { ok: true };
    };

    /**
     * 登出
     */
    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    /**
     * 获取当前 session
     */
    const getSession = () => {
        const session = localStorage.getItem(STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    };

    /**
     * 路由守卫：未登录访问受保护页面 → 跳 login
     */
    const requireAuth = () => {
        const path = window.location.pathname;
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        const publicPages = ['login.html', 'register.html', ''];
        const isPublic = publicPages.includes(fileName);
        if (!isPublic && !isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    };

    return { isLoggedIn, register, login, logout, getSession, requireAuth };
})();

if (typeof window !== 'undefined') {
    window.Auth = Auth;
}
