/**
 * 账本服务层
 * ----------------------------------------------------------------------------
 * 封装 books / user_settings 表的初始化逻辑
 * 新用户注册时自动创建"我的账本"和默认设置
 */
'use strict';

const { pool } = require('../config/db');

/**
 * 为新用户创建默认账本与设置(在事务中执行,保证一致性)
 * @param {number} userId
 * @returns {Promise<{bookId: number, settingsId: number}>}
 */
async function setupForNewUser(userId) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. 创建默认账本
        const [bookResult] = await conn.query(
            `INSERT INTO books (uuid, user_id, name, type, currency, is_default, created_at, updated_at)
             VALUES (UUID(), ?, '我的账本', 'personal', 'CNY', 1, NOW(), NOW())`,
            [userId]
        );
        const bookId = bookResult.insertId;

        // 2. 创建用户设置
        await conn.query(
            `INSERT INTO user_settings
                (user_id, first_visit, current_book_id, currency, theme, created_at, updated_at)
             VALUES (?, 1, ?, 'CNY', 'light', NOW(), NOW())`,
            [userId, bookId]
        );

        await conn.commit();
        return { bookId };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * 获取用户当前生效账本
 */
async function getCurrentBook(userId) {
    const [rows] = await pool.query(
        `SELECT b.*
           FROM user_settings s
           JOIN books b ON b.id = s.current_book_id
          WHERE s.user_id = ?
          LIMIT 1`,
        [userId]
    );
    return rows[0] || null;
}

module.exports = { setupForNewUser, getCurrentBook };
