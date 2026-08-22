/**
 * 认证路由
 * ----------------------------------------------------------------------------
 * POST /api/auth/register  注册
 * POST /api/auth/login     登录
 * POST /api/auth/logout    登出(需登录)
 * GET  /api/auth/me        当前用户信息(需登录)
 */
'use strict';

const express = require('express');
const router  = express.Router();

const userService    = require('../services/userService');
const sessionService = require('../services/sessionService');
const bookService    = require('../services/bookService');
const { verifyPassword } = require('../utils/crypto');
const { validateUsername, validatePassword } = require('../utils/validators');
const { requireAuth } = require('../middleware/auth');

/* =============================================================================
 * POST /api/auth/register
 * Body: { username, password, confirmPassword }
 * 成功: 201 { code:'OK', data: { user, session } }
 * 失败: 400 / 409
 * ========================================================================== */
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, confirmPassword } = req.body || {};

        // 1. 字段完整性
        if (!username || !password || !confirmPassword) {
            return res.status(400).json({
                code: 'REGISTER_FIELDS_MISSING',
                message: '请填写完整的注册信息',
            });
        }

        // 2. 用户名校验
        const usernameError = validateUsername(username);
        if (usernameError) {
            return res.status(400).json({ code: 'REGISTER_USERNAME_INVALID', message: usernameError });
        }

        // 3. 密码校验
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ code: 'REGISTER_PASSWORD_INVALID', message: passwordError });
        }

        // 4. 两次密码一致性
        if (password !== confirmPassword) {
            return res.status(400).json({ code: 'REGISTER_PASSWORD_MISMATCH', message: '两次输入的密码不一致' });
        }

        // 5. 唯一性检查
        const existing = await userService.findByUsername(username);
        if (existing) {
            return res.status(409).json({ code: 'REGISTER_USERNAME_TAKEN', message: '该用户名已被注册，请更换' });
        }

        // 6. 创建用户 + 默认账本 + 默认设置(在 service 内部事务化)
        const user = await userService.create({ username, password });
        await bookService.setupForNewUser(user.id);

        // 7. 自动登录:创建会话
        const meta = {
            ip:        req.ip,
            userAgent: req.headers['user-agent'],
        };
        const session = await sessionService.create(user.id, user.username, false, meta);

        return res.status(201).json({
            code: 'OK',
            message: '注册成功',
            data: {
                user: {
                    id:       user.id,
                    uuid:     user.uuid,
                    username: user.username,
                },
                session: {
                    token:      session.token,
                    expiresAt:  session.expiresAt,
                    rememberMe: session.rememberMe,
                },
            },
        });
    } catch (err) {
        next(err);
    }
});

/* =============================================================================
 * POST /api/auth/login
 * Body: { username, password, rememberMe? }
 * 成功: 200 { code:'OK', data: { user, session } }
 * 失败: 401 (不区分用户名/密码错误,防枚举)
 * ========================================================================== */
router.post('/login', async (req, res, next) => {
    try {
        const { username, password, rememberMe = false } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                code: 'LOGIN_FIELDS_MISSING',
                message: '请填写用户名和密码',
            });
        }

        const user = await userService.findByUsername(username);

        // 防枚举:用户不存在或密码错误统一返回 401 + 相同文案
        const invalidResponse = () => res.status(401).json({
            code: 'LOGIN_INVALID',
            message: '用户名或密码错误',
        });

        if (!user) return invalidResponse();
        if (user.status !== 1) return invalidResponse();

        const ok = verifyPassword(password, user.salt, user.password_hash);
        if (!ok) return invalidResponse();

        // 更新最后登录时间
        await userService.touchLastLogin(user.id);

        // 创建会话
        const meta = {
            ip:        req.ip,
            userAgent: req.headers['user-agent'],
        };
        const session = await sessionService.create(user.id, user.username, !!rememberMe, meta);

        return res.json({
            code: 'OK',
            message: '登录成功',
            data: {
                user: {
                    id:       user.id,
                    uuid:     user.uuid,
                    username: user.username,
                },
                session: {
                    token:      session.token,
                    expiresAt:  session.expiresAt,
                    rememberMe: session.rememberMe,
                },
            },
        });
    } catch (err) {
        next(err);
    }
});

/* =============================================================================
 * POST /api/auth/logout  (需登录)
 * 删除当前 token 对应的会话
 * ========================================================================== */
router.post('/logout', requireAuth, async (req, res, next) => {
    try {
        await sessionService.deleteByToken(req.token);
        return res.json({ code: 'OK', message: '已退出登录' });
    } catch (err) {
        next(err);
    }
});

/* =============================================================================
 * GET /api/auth/me  (需登录)
 * ========================================================================== */
router.get('/me', requireAuth, async (req, res) => {
    return res.json({
        code: 'OK',
        data: {
            user: {
                id:            req.user.id,
                uuid:          req.user.uuid,
                username:      req.user.username,
                lastLoginAt:   req.user.last_login_at,
                createdAt:     req.user.created_at,
            },
            session: {
                token:      req.session.token,
                expiresAt:  req.session.expires_at,
                rememberMe: req.session.remember_me === 1,
            },
        },
    });
});

module.exports = router;
