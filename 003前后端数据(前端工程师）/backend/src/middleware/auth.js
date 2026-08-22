/**
 * 认证中间件
 * ----------------------------------------------------------------------------
 * 从 Authorization: Bearer <token> 中提取会话 token
 * 校验通过后将 session / user 挂载到 req 上,供下游路由使用
 */
'use strict';

const sessionService = require('../services/sessionService');
const userService    = require('../services/userService');

/**
 * 提取 token
 */
function extractToken(req) {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || typeof auth !== 'string') return null;
    const m = auth.match(/^Bearer\s+(.+)$/i);
    return m ? m[1].trim() : null;
}

/**
 * 必须登录(保护路由)
 * 失败返回 401
 */
async function requireAuth(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ code: 'AUTH_REQUIRED', message: '未登录或会话已过期' });
        }

        const session = await sessionService.findValidByToken(token);
        if (!session) {
            return res.status(401).json({ code: 'AUTH_INVALID', message: '会话无效或已过期' });
        }

        const user = await userService.findById(session.user_id);
        if (!user || user.status !== 1) {
            return res.status(401).json({ code: 'AUTH_USER_INVALID', message: '账号不存在或已禁用' });
        }

        req.session = session;
        req.user    = user;
        req.token   = token;
        next();
    } catch (err) {
        next(err);
    }
}

/**
 * 可选登录(不强制)
 * 命中则挂载 req.user,未命中继续 next()
 */
async function optionalAuth(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) return next();
        const session = await sessionService.findValidByToken(token);
        if (!session) return next();
        const user = await userService.findById(session.user_id);
        if (user && user.status === 1) {
            req.session = session;
            req.user    = user;
            req.token   = token;
        }
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = { requireAuth, optionalAuth, extractToken };
