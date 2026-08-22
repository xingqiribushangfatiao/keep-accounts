/**
 * 会话服务层
 * ----------------------------------------------------------------------------
 * 封装 sessions 表的 CRUD 逻辑
 * token 格式:UUID 字符串,客户端通过 Authorization: Bearer <token> 传递
 */
'use strict';

const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_TTL = parseInt(process.env.SESSION_TTL_DEFAULT  || '86400000',  10); // 1 天
const REMEMBER_TTL = parseInt(process.env.SESSION_TTL_REMEMBER || '604800000', 10); // 7 天

/**
 * 创建会话
 * @param {number} userId
 * @param {string} username
 * @param {boolean} rememberMe
 * @param {object} meta - { ip, userAgent }
 * @returns {Promise<{token, expiresAt, rememberMe}>}
 */
async function create(userId, username, rememberMe = false, meta = {}) {
    const token = uuidv4().replace(/-/g, ''); // 32 位无连字符 UUID
    const ttl = rememberMe ? REMEMBER_TTL : DEFAULT_TTL;
    const expiresAt = new Date(Date.now() + ttl);

    await pool.query(
        `INSERT INTO sessions (token, user_id, username, expires_at, remember_me, ip, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            token,
            userId,
            username,
            expiresAt,
            rememberMe ? 1 : 0,
            meta.ip       || null,
            meta.userAgent ? String(meta.userAgent).slice(0, 255) : null,
        ]
    );

    return { token, expiresAt, rememberMe };
}

/**
 * 通过 token 查询有效会话(未过期)
 * @returns {object|null}
 */
async function findValidByToken(token) {
    if (!token) return null;
    const [rows] = await pool.query(
        `SELECT * FROM sessions
          WHERE token = ? AND expires_at > NOW()
          LIMIT 1`,
        [token]
    );
    return rows[0] || null;
}

/**
 * 删除单个会话(登出)
 */
async function deleteByToken(token) {
    const [result] = await pool.query(
        'DELETE FROM sessions WHERE token = ?',
        [token]
    );
    return result.affectedRows > 0;
}

/**
 * 删除用户的所有会话(强制下线)
 */
async function deleteByUserId(userId) {
    const [result] = await pool.query(
        'DELETE FROM sessions WHERE user_id = ?',
        [userId]
    );
    return result.affectedRows;
}

/**
 * 清理过期会话(可由定时任务调用)
 */
async function cleanExpired() {
    const [result] = await pool.query(
        'DELETE FROM sessions WHERE expires_at <= NOW()'
    );
    return result.affectedRows;
}

module.exports = {
    create,
    findValidByToken,
    deleteByToken,
    deleteByUserId,
    cleanExpired,
    DEFAULT_TTL,
    REMEMBER_TTL,
};
