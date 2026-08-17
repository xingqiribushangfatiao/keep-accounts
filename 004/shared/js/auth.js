/**
 * Petal Ledger (004) - Auth State
 *
 * Storage:
 *   - petal_ledger_004_session: 当前登录会话 { userId, username, expiresAt, rememberMe }
 *   - petal_ledger_004_users:    已注册用户列表 [{ id, username, password(哈希), createdAt }]
 *
 * 修复记录：
 *   - register() 现在会存储哈希后的密码
 *   - login()   现在校验用户名是否存在 + 密码是否匹配
 *   - session.userId 不再写死为 'demo-user-001'
 */

const Auth = (() => {
    const STORAGE_KEY = 'petal_ledger_004_session';
    const USERS_KEY   = 'petal_ledger_004_users';

    /* ========== 工具：密码哈希（演示用，生产请用 bcrypt）========== */
    const hashPassword = (password) => btoa(encodeURIComponent(password));

    /* ========== 会话状态 ========== */
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

    const getSession = () => {
        const session = localStorage.getItem(STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    };

    const logout = () => localStorage.removeItem(STORAGE_KEY);

    /* ========== 用户列表读写 ========== */
    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        } catch {
            return [];
        }
    };
    const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

    /* ========== 创建会话（内部使用）========== */
    const createSession = (user, rememberMe) => {
        const session = {
            userId:    user.id,
            username:  user.username,
            expiresAt: rememberMe
                ? Date.now() + 7 * 24 * 60 * 60 * 1000   // 7 天
                : Date.now() + 24 * 60 * 60 * 1000,       // 1 天
            rememberMe,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    };

    /* ========== 注册 ========== */
    const register = (username, password) => {
        if (!username || !password) {
            return { ok: false, message: '请填写完整的注册信息' };
        }
        if (username.length < 3 || username.length > 20) {
            return { ok: false, message: '用户名为 3-20 位' };
        }
        if (password.length < 6 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            return { ok: false, message: '密码需 6-20 位，且至少包含字母和数字' };
        }

        const users = getUsers();
        if (users.find((u) => u.username === username)) {
            return { ok: false, message: '该用户名已被注册' };
        }

        const newUser = {
            id:        'u_' + Date.now(),
            username,
            password:  hashPassword(password),   // 修复：存储哈希密码
            createdAt: Date.now(),
        };
        users.push(newUser);
        saveUsers(users);

        // 自动登录：直接用刚注册的用户创建会话
        createSession(newUser, false);
        return { ok: true };
    };

    /* ========== 登录（修复：必须校验密码）========== */
    const login = (username, password, rememberMe = false) => {
        if (!username || !password) {
            return { ok: false, message: '请填写用户名和密码' };
        }

        const users = getUsers();
        const user  = users.find((u) => u.username === username);

        // 1. 用户不存在
        if (!user) {
            return { ok: false, message: '用户名或密码错误' };
        }

        // 2. 旧账号没有密码字段（升级前注册的数据）→ 提示重新注册
        if (!user.password) {
            return { ok: false, message: '该账号数据异常，请重新注册' };
        }

        // 3. 密码不匹配
        if (user.password !== hashPassword(password)) {
            return { ok: false, message: '用户名或密码错误' };
        }

        // 4. 校验通过：创建会话
        createSession(user, rememberMe);
        return { ok: true };
    };

    /* ========== 路由守卫 ========== */
    const requireAuth = () => {
        const path     = window.location.pathname;
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        const publicPages = ['login.html', 'register.html', ''];
        if (!publicPages.includes(fileName) && !isLoggedIn()) {
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
