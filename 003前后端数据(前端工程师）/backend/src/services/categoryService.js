/**
 * 分类服务层
 * ----------------------------------------------------------------------------
 * 封装 categories 表的 CRUD
 * 分类有两类:
 *   - 系统预设(user_id IS NULL,所有用户可见,is_preset=1):只读
 *   - 用户自定义(user_id = <当前用户>,is_preset=0):可增删
 */
'use strict';

const { pool } = require('../config/db');

/**
 * 列出某用户可见的全部分类(预设 + 自定义),按 sort_order 升序
 * @param {number} userId
 * @param {string} [type] 'expense' | 'income' | undefined(全部)
 */
async function listForUser(userId, type) {
    const params = [userId];
    let sql = `SELECT id, code, name, icon, color, type, is_preset, sort_order
                 FROM categories
                WHERE (user_id IS NULL OR user_id = ?)`;
    if (type) {
        sql += ' AND type = ?';
        params.push(type);
    }
    sql += ' ORDER BY is_preset DESC, sort_order ASC, id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
}

/**
 * 查一条(校验归属)
 * @returns {object|null}
 */
async function findById(id, userId) {
    const [rows] = await pool.query(
        `SELECT id, code, name, icon, color, type, is_preset, user_id, book_id
           FROM categories WHERE id = ? LIMIT 1`,
        [id]
    );
    const cat = rows[0];
    if (!cat) return null;
    // 系统预设 / 本人自定义 → 允许;别人的自定义 → 视为不存在
    if (cat.user_id !== null && cat.user_id !== userId) return null;
    return cat;
}

/**
 * 创建用户自定义分类
 */
async function create({ userId, code, name, icon, color, type, bookId = null }) {
    const [result] = await pool.query(
        `INSERT INTO categories
            (code, name, icon, color, type, is_preset, user_id, book_id, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, 50, NOW())`,
        [code, name, icon, color, type, userId, bookId]
    );
    return findById(result.insertId, userId);
}

/**
 * 删除(仅允许删自己的自定义分类,预设禁止删)
 * @returns {boolean} 是否真的删了
 */
async function remove(id, userId) {
    const [result] = await pool.query(
        `DELETE FROM categories
          WHERE id = ? AND user_id = ? AND is_preset = 0`,
        [id, userId]
    );
    return result.affectedRows > 0;
}

module.exports = { listForUser, findById, create, remove };
