/**
 * 用户服务层
 * ----------------------------------------------------------------------------
 * 封装 users 表的 CRUD 逻辑
 */
'use strict';

const { pool } = require('../config/db');
const { generateSalt, hashPassword } = require('../utils/crypto');

/**
 * 通过 username 查询用户
 * @returns {object|null}
 */
async function findByUsername(username) {
    const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ? LIMIT 1',
        [username]
    );
    return rows[0] || null;
}

/**
 * 通过 id 查询用户
 */
async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id, uuid, username, status, last_login_at, created_at FROM users WHERE id = ? LIMIT 1',
        [id]
    );
    return rows[0] || null;
}

/**
 * 创建新用户
 * @returns {object} 新创建的用户(不含敏感字段)
 */
async function create({ username, password }) {
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const [result] = await pool.query(
        `INSERT INTO users (uuid, username, password_hash, salt, status, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, 1, NOW(), NOW())`,
        [username, passwordHash, salt]
    );

    return findById(result.insertId);
}

/**
 * 更新最后登录时间
 */
async function touchLastLogin(id) {
    await pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = ?',
        [id]
    );
}

module.exports = { findByUsername, findById, create, touchLastLogin };
