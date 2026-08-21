/**
 * 交易服务层
 * ----------------------------------------------------------------------------
 * 封装 transactions 表的 CRUD 与汇总统计
 * 字段映射:DB snake_case <-> API camelCase
 *   - book_id      ↔ bookId
 *   - category_id  ↔ categoryId
 *   - transaction_date ↔ transactionDate(API 出入都用 YYYY-MM-DD)
 */
'use strict';

const { pool } = require('../config/db');

/**
 * 驼峰 <-> 下划线 转换(给 list 返回用)
 */
function rowToDto(row) {
    if (!row) return null;
    return {
        id:              row.id,
        uuid:            row.uuid,
        bookId:          row.book_id,
        categoryId:      row.category_id,
        type:            row.type,
        amount:          Number(row.amount),
        transactionDate: row.transaction_date instanceof Date
            ? row.transaction_date.toISOString().slice(0, 10)
            : row.transaction_date,
        note:            row.note,
        createdAt:       row.created_at,
        updatedAt:       row.updated_at,
    };
}

/**
 * 列表(支持按 bookId / type / 月份筛选,按日期降序)
 * @param {object} opts { userId, bookId?, type?, month? 'YYYY-MM' }
 */
async function list({ userId, bookId, type, month }) {
    const params = [userId];
    let sql = `SELECT * FROM transactions WHERE user_id = ?`;
    if (bookId) {
        sql += ' AND book_id = ?';
        params.push(bookId);
    }
    if (type) {
        sql += ' AND type = ?';
        params.push(type);
    }
    if (month && /^\d{4}-\d{2}$/.test(month)) {
        const [y, m] = month.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        sql += ' AND transaction_date BETWEEN ? AND ?';
        params.push(`${month}-01`, `${month}-${String(lastDay).padStart(2, '0')}`);
    }
    sql += ' ORDER BY transaction_date DESC, id DESC LIMIT 500';

    const [rows] = await pool.query(sql, params);
    return rows.map(rowToDto);
}

/**
 * 查一条(校验归属)
 */
async function findById(id, userId) {
    const [rows] = await pool.query(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ? LIMIT 1',
        [id, userId]
    );
    return rowToDto(rows[0]);
}

/**
 * 校验分类是否属于本用户(预设或本人自定义均可)
 */
async function validateCategory(categoryId, userId) {
    const [rows] = await pool.query(
        `SELECT id, type FROM categories
          WHERE id = ? AND (user_id IS NULL OR user_id = ?)
          LIMIT 1`,
        [categoryId, userId]
    );
    return rows[0] || null;
}

/**
 * 创建
 */
async function create({ userId, bookId, categoryId, type, amount, transactionDate, note }) {
    const [result] = await pool.query(
        `INSERT INTO transactions
            (uuid, user_id, book_id, category_id, type, amount, transaction_date, note, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, bookId, categoryId, type, amount, transactionDate, note || null]
    );
    return findById(result.insertId, userId);
}

/**
 * 更新(部分字段)
 */
async function update(id, userId, patch) {
    const sets = [];
    const params = [];
    if (patch.categoryId      !== undefined) { sets.push('category_id = ?');      params.push(patch.categoryId); }
    if (patch.type             !== undefined) { sets.push('type = ?');              params.push(patch.type); }
    if (patch.amount           !== undefined) { sets.push('amount = ?');            params.push(patch.amount); }
    if (patch.transactionDate  !== undefined) { sets.push('transaction_date = ?'); params.push(patch.transactionDate); }
    if (patch.note             !== undefined) { sets.push('note = ?');              params.push(patch.note); }
    if (!sets.length) return findById(id, userId);
    sets.push('updated_at = NOW()');
    params.push(id, userId);
    await pool.query(
        `UPDATE transactions SET ${sets.join(', ')}
          WHERE id = ? AND user_id = ?`,
        params
    );
    return findById(id, userId);
}

/**
 * 删除
 */
async function remove(id, userId) {
    const [result] = await pool.query(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return result.affectedRows > 0;
}

/**
 * 范围汇总(week/month/year) + 分类排行
 * @returns {object} { range, totalExpense, totalIncome, balance, byCategory: [{categoryId,name,icon,color,amount,percent}] }
 */
async function summary({ userId, range = 'month', bookId }) {
    // 计算起止日期(以 **本地时区** 00:00 切分)
    // 用 toISOString().slice(0,10) 会得到 UTC 日期,在 UTC+8 时区凌晨会少一天
    const pad = (n) => String(n).padStart(2, '0');
    const localDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today = new Date();
    let startDate, endDate;
    if (range === 'week') {
        // 本周一 ~ 今天(本地)
        const day = today.getDay() || 7; // 1~7,周一为 1
        const monday = new Date(today);
        monday.setDate(today.getDate() - (day - 1));
        startDate = localDateStr(monday);
        endDate   = localDateStr(today);
    } else if (range === 'year') {
        startDate = `${today.getFullYear()}-01-01`;
        endDate   = localDateStr(today);
    } else {
        // month(默认)
        const y = today.getFullYear();
        const m = pad(today.getMonth() + 1);
        const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();
        startDate = `${y}-${m}-01`;
        endDate   = `${y}-${m}-${pad(lastDay)}`;
    }

    const params = [userId, startDate, endDate];
    let where = 't.user_id = ? AND t.transaction_date BETWEEN ? AND ?';
    if (bookId) {
        where += ' AND t.book_id = ?';
        params.push(bookId);
    }

    // 1. 总收入 / 总支出
    const [totals] = await pool.query(
        `SELECT t.type, COALESCE(SUM(t.amount), 0) AS total
           FROM transactions t
          WHERE ${where}
          GROUP BY t.type`,
        params
    );
    const totalExpense = Number(totals.find((r) => r.type === 'expense')?.total || 0);
    const totalIncome  = Number(totals.find((r) => r.type === 'income')?.total  || 0);
    const balance      = totalIncome - totalExpense;

    // 2. 分类排行(只算支出)
    const [byCategory] = await pool.query(
        `SELECT t.category_id AS categoryId,
                c.name, c.icon, c.color,
                SUM(t.amount) AS amount,
                COUNT(*)      AS cnt
           FROM transactions t
           JOIN categories c ON c.id = t.category_id
          WHERE ${where} AND t.type = 'expense'
          GROUP BY t.category_id, c.name, c.icon, c.color
          ORDER BY amount DESC
          LIMIT 20`,
        params
    );

    const total = byCategory.reduce((s, x) => s + Number(x.amount), 0);
    const byCategoryDto = byCategory.map((x) => ({
        categoryId: x.categoryId,
        name:       x.name,
        icon:       x.icon,
        color:      x.color,
        amount:     Number(x.amount),
        count:      x.cnt,
        percent:    total > 0 ? Math.round((Number(x.amount) / total) * 1000) / 10 : 0,
    }));

    return {
        range:       range,
        startDate,
        endDate,
        totalExpense,
        totalIncome,
        balance,
        byCategory:  byCategoryDto,
    };
}

module.exports = {
    list, findById, create, update, remove,
    validateCategory, summary,
};
