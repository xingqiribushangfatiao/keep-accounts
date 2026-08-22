/**
 * Petal Ledger (004) - Auth State (real backend)
 *
 * 与旧版的差异:
 *   - 注册/登录/登出 全部走真实后端(/api/auth/*)
 *   - 会话存 token,后续接口通过 Authorization: Bearer 鉴权
 *   - 旧 localStorage 用户(session 不带 token)被自动清理,首次访问会跳登录页
 *
 * Session shape(向后兼容旧页面):
 *   {
 *     userId:     <number|string>,   // 后端 user.id
 *     username:   string,
 *     token:      string,            // 新增:后端 session token
 *     expiresAt:  <ISO 字符串 / 数字毫秒>,
 *     rememberMe: boolean,
 *   }
 */

const Auth = (() => {
    const SESSION_KEY       = 'petal_ledger_004_session';
    const LEGACY_USERS_KEY  = 'petal_ledger_004_users';   // 旧 localStorage 用户列表(检测 + 清理)

    /* ========== 后端基础 URL ==========
     * 1. 优先用 window.PETAL_API_BASE(便于跨域/部署时手动指定)
     * 2. 否则:legacy 端口 != 3000 → 后端在 :3000
     * 3. 否则:同源 → '/api'
     */
    const API_BASE = (() => {
        if (typeof window !== 'undefined' && window.PETAL_API_BASE) {
            return window.PETAL_API_BASE.replace(/\/+$/, '');
        }
        if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
            const port = window.location.port;
            if (port && port !== '3000' && port !== '') {
                return `${window.location.protocol}//${window.location.hostname}:3000/api`;
            }
            return '/api';
        }
        return 'http://localhost:3000/api';
    })();

    /* ========== 会话读写 ========== */
    const getSession = () => {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const s = JSON.parse(raw);
            // 兜底:旧版无 token 的会话视为过期(老用户需重新登录)
            if (!s.token) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }
            return s;
        } catch {
            return null;
        }
    };

    const setSession = (s) => localStorage.setItem(SESSION_KEY, JSON.stringify(s));

    const isLoggedIn = () => {
        const s = getSession();
        if (!s) return false;
        if (s.expiresAt) {
            const exp = (typeof s.expiresAt === 'number')
                ? s.expiresAt
                : new Date(s.expiresAt).getTime();
            if (exp && exp < Date.now()) {
                localStorage.removeItem(SESSION_KEY);
                return false;
            }
        }
        return true;
    };

    const getToken = () => {
        const s = getSession();
        return s ? s.token : null;
    };

    const logout = async () => {
        const token = getToken();
        if (token) {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method:  'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            } catch {
                // 网络异常也清本地会话,避免半死状态
            }
        }
        localStorage.removeItem(SESSION_KEY);
    };

    /* ========== 通用 fetch 封装 ========== */
    const postJSON = async (path, body) => {
        let res;
        try {
            res = await fetch(`${API_BASE}${path}`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body),
            });
        } catch (netErr) {
            // fetch 直接抛错 = 网络层就连不上(后端没起 / 跨域被拦 / file:// 协议)
            // 把干巴巴的 "Failed to fetch" 翻译成可操作的提示
            const isFileProtocol = typeof window !== 'undefined'
                && window.location.protocol === 'file:';
            let hint;
            if (isFileProtocol) {
                hint = '检测到当前页面是 file:// 协议,浏览器会拦截跨源请求。请改用 VSCode Live Server 或 http:// 方式打开';
            } else {
                hint = `请确认后端已启动(默认 ${API_BASE.replace(/\/api$/, '')})`;
            }
            const err = new Error(`无法连接后端 (${netErr.message || 'network error'})。${hint}`);
            err.code    = 'NETWORK_ERROR';
            err.cause   = netErr;
            throw err;
        }
        let data = null;
        try { data = await res.json(); } catch { /* 非 JSON 响应 */ }
        if (!res.ok || (data && data.code && data.code !== 'OK')) {
            const msg = (data && data.message) || `请求失败 (${res.status})`;
            const err = new Error(msg);
            err.code = (data && data.code) || `HTTP_${res.status}`;
            err.status = res.status;
            throw err;
        }
        return data;
    };

    /* ========== 启动时清理旧 localStorage 数据(仅一次)========== */
    const _cleanupLegacy = () => {
        try { localStorage.removeItem(LEGACY_USERS_KEY); } catch { /* ignore */ }
    };

    /* ========== 注册 ========== */
    const register = async (username, password, confirmPassword) => {
        try {
            const data = await postJSON('/auth/register', {
                username,
                password,
                confirmPassword: confirmPassword || password,
            });
            setSession({
                userId:     data.data.user.id,
                username:   data.data.user.username,
                token:      data.data.session.token,
                expiresAt:  data.data.session.expiresAt,
                rememberMe: !!data.data.session.rememberMe,
            });
            _cleanupLegacy();
            return { ok: true };
        } catch (err) {
            return { ok: false, message: err.message };
        }
    };

    /* ========== 登录 ========== */
    const login = async (username, password, rememberMe = false) => {
        try {
            const data = await postJSON('/auth/login', {
                username,
                password,
                rememberMe: !!rememberMe,
            });
            setSession({
                userId:     data.data.user.id,
                username:   data.data.user.username,
                token:      data.data.session.token,
                expiresAt:  data.data.session.expiresAt,
                rememberMe: !!data.data.session.rememberMe,
            });
            _cleanupLegacy();
            return { ok: true };
        } catch (err) {
            return { ok: false, message: err.message };
        }
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

    /* ========== 公共:带 token 的 API 调用 ==========
     * 其他脚本如 avatar 上传可用:Auth.apiFetch('/users/me/avatar', { method:'PUT', body:... })
     */
    const apiFetch = async (path, options = {}) => {
        const token = getToken();
        const headers = Object.assign(
            { 'Content-Type': 'application/json' },
            options.headers || {},
            token ? { 'Authorization': `Bearer ${token}` } : {}
        );
        const res = await fetch(`${API_BASE}${path}`, Object.assign({}, options, { headers }));
        let data = null;
        try { data = await res.json(); } catch { /* ignore */ }
        if (res.status === 401) {
            // 401 自动清会话 + 跳登录
            localStorage.removeItem(SESSION_KEY);
            if (typeof window !== 'undefined') {
                window.location.href = 'login.html';
            }
            throw new Error('会话已过期,请重新登录');
        }
        if (!res.ok) {
            const msg = (data && data.message) || `请求失败 (${res.status})`;
            const err = new Error(msg);
            err.code = (data && data.code) || `HTTP_${res.status}`;
            throw err;
        }
        return data;
    };

    return {
        isLoggedIn, getSession, getToken, requireAuth,
        login, register, logout, apiFetch,
        // 给 settings 头像上传等需要直传后端的场景用
        API_BASE,
        // 登录页用:探测后端是否可达,返回 { ok, message, apiBase, isFileProtocol }
        async checkBackend() {
            const apiBase = API_BASE;
            const isFileProtocol = typeof window !== 'undefined'
                && window.location.protocol === 'file:';
            try {
                const res = await fetch(`${apiBase}/health`, { method: 'GET' });
                if (!res.ok) {
                    return { ok: false, apiBase, isFileProtocol,
                        message: `后端返回 HTTP ${res.status},请检查服务是否正常` };
                }
                const data = await res.json().catch(() => null);
                if (data && data.code === 'OK') {
                    return { ok: true, apiBase, isFileProtocol, message: '后端在线 ✓' };
                }
                return { ok: false, apiBase, isFileProtocol,
                    message: '后端响应格式异常,可能是版本不匹配' };
            } catch (err) {
                let hint;
                if (isFileProtocol) {
                    hint = '当前是 file:// 协议,浏览器会拦截跨源请求。请用 VSCode Live Server 打开 pages/login.html';
                } else {
                    hint = '请在 backend/ 目录执行 npm start 启动服务(默认 :3000)';
                }
                return { ok: false, apiBase, isFileProtocol,
                    message: `后端不可达 (${err.message || 'network error'})。${hint}` };
            }
        },
    };
})();

if (typeof window !== 'undefined') {
    window.Auth = Auth;
}
