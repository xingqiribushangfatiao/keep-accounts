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

/**
 * 把 mysql2 返回的 Date(已按 timezone 偏移)转成本地 YYYY-MM-DD
 * 注意:db.js 配的 timezone=+08:00 + dateStrings=false,
 *      Date 对象内部存的是 UTC 时刻(对应 +08:00 的本地时刻),
 *      toISOString().slice(0,10) 会拿到 UTC 日期(早一天)
 *      必须用 getFullYear / getMonth / getDate 这种"本地字段"才对得上 Utils.today()
 */
const pad2 = (n) => String(n).padStart(2, '0');
const localDateStr = (d) => {
    if (!(d instanceof Date)) return d;
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

function rowToDto(row) {
    if (!row) return null;
    return {
        id:              row.id,
        uuid:            row.uuid,
        bookId:          row.book_id,
        categoryId:      row.category_id,
        type:            row.type,
        amount:          Number(row.amount),
        transactionDate: localDateStr(row.transaction_date),
        note:            row.note,
        createdAt:       row.created_at,
        updatedAt:       row.updated_at,
    };
}

/**
 * 列表(支持按 bookId / type / 月份 / categoryId 筛选,按日期降序)
 * - month  按 transaction_date 月份过滤(账目所属月)
 * - createdMonth 按 created_at 月份过滤(实际录入月)
 * - limit / offset  分页;传 limit 时返回 {items, total, hasMore, limit, offset},
 *                  否则返回数组(向后兼容 home / stats 等老调用方)
 * @param {object} opts { userId, bookId?, type?, month?, createdMonth?, categoryId?, limit?, offset? }
 */
async function list({ userId, bookId, type, month, createdMonth, categoryId, limit, offset }) {
    const baseParams = [userId];
    let where = 'user_id = ?';
    if (bookId) {
        where += ' AND book_id = ?';
        baseParams.push(bookId);
    }
    if (type) {
        where += ' AND type = ?';
        baseParams.push(type);
    }
    if (month && /^\d{4}-\d{2}$/.test(month)) {
        const [y, m] = month.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        where += ' AND transaction_date BETWEEN ? AND ?';
        baseParams.push(`${month}-01`, `${month}-${String(lastDay).padStart(2, '0')}`);
    }
    if (createdMonth && /^\d{4}-\d{2}$/.test(createdMonth)) {
        // DATE_FORMAT 用 MySQL session 时区;keep_accounts 的 session 是 +08:00,
        // 这样 created_at = '2026-08-20 23:30:00' (UTC+8) 会归到 2026-08
        where += ` AND DATE_FORMAT(created_at, '%Y-%m') = ?`;
        baseParams.push(createdMonth);
    }
    if (categoryId) {
        where += ' AND category_id = ?';
        baseParams.push(categoryId);
    }

    // 总数(分页用)
    const [countResult] = await pool.query(
        `SELECT COUNT(*) AS total FROM transactions WHERE ${where}`,
        baseParams
    );
    const total = Number(countResult[0].total);

    let sql = `SELECT * FROM transactions WHERE ${where} ORDER BY transaction_date DESC, id DESC`;

    // 分页
    if (limit !== undefined && limit !== null) {
        const safeLimit  = Math.min(Math.max(parseInt(limit,  10) || 20, 1), 100);
        const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);
        sql += ' LIMIT ? OFFSET ?';
        const [rows] = await pool.query(sql, [...baseParams, safeLimit, safeOffset]);
        return {
            items:   rows.map(rowToDto),
            total,
            limit:   safeLimit,
            offset:  safeOffset,
            hasMore: safeOffset + safeLimit < total,
        };
    }

    // 不分页:向后兼容,最多 500 条
    sql += ' LIMIT 500';
    const [rows] = await pool.query(sql, baseParams);
    return rows.map(rowToDto);
}

/**
 * 列出当前用户有 created_at 数据的月份(YYYY-MM),按月份倒序
 * 给 list 页"月份选择器"用,UI 上能选的就是真实有数据的月
 */
async function getAvailableMonths({ userId, bookId }) {
    const params = [userId];
    let where = 'user_id = ?';
    if (bookId) {
        where += ' AND book_id = ?';
        params.push(bookId);
    }
    const [rows] = await pool.query(
        `SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m') AS month
           FROM transactions
          WHERE ${where}
          ORDER BY month DESC`,
        params
    );
    return rows.map((r) => r.month);
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
 * 清空某用户(可限定账本)下的所有交易记录
 * 用于"设置 → 清空记录"功能
 * @returns {number} 被删除的条数
 */
async function removeAll({ userId, bookId }) {
    const params = [userId];
    let where = 'user_id = ?';
    if (bookId) {
        where += ' AND book_id = ?';
        params.push(bookId);
    }
    const [result] = await pool.query(
        `DELETE FROM transactions WHERE ${where}`,
        params
    );
    return result.affectedRows;
}

/**
 * 范围汇总(week/month/year) + 分类排行(支出 + 收入分开)
 * @returns {object} {
 *   range, startDate, endDate,
 *   totalExpense, totalIncome, balance,
 *   byCategory:        [{categoryId,name,icon,color,amount,count,percent}],
 *   byCategoryIncome:  [{categoryId,name,icon,color,amount,count,percent}],
 * }
 *   支出和收入各算各的 percent(分母分别为 totalExpense / totalIncome)
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

    // 2. 分类排行(支出)
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

    const totalExp = byCategory.reduce((s, x) => s + Number(x.amount), 0);
    const byCategoryDto = byCategory.map((x) => ({
        categoryId: x.categoryId,
        name:       x.name,
        icon:       x.icon,
        color:      x.color,
        amount:     Number(x.amount),
        count:      x.cnt,
        percent:    totalExp > 0 ? Math.round((Number(x.amount) / totalExp) * 1000) / 10 : 0,
    }));

    // 3. 分类排行(收入) — 与支出结构对称,percent 以 totalIncome 为分母
    const [byCategoryIncome] = await pool.query(
        `SELECT t.category_id AS categoryId,
                c.name, c.icon, c.color,
                SUM(t.amount) AS amount,
                COUNT(*)      AS cnt
           FROM transactions t
           JOIN categories c ON c.id = t.category_id
          WHERE ${where} AND t.type = 'income'
          GROUP BY t.category_id, c.name, c.icon, c.color
          ORDER BY amount DESC
          LIMIT 20`,
        params
    );

    const totalInc = byCategoryIncome.reduce((s, x) => s + Number(x.amount), 0);
    const byCategoryIncomeDto = byCategoryIncome.map((x) => ({
        categoryId: x.categoryId,
        name:       x.name,
        icon:       x.icon,
        color:      x.color,
        amount:     Number(x.amount),
        count:      x.cnt,
        percent:    totalInc > 0 ? Math.round((Number(x.amount) / totalInc) * 1000) / 10 : 0,
    }));

    return {
        range,
        startDate,
        endDate,
        totalExpense,
        totalIncome,
        balance,
        byCategory:       byCategoryDto,
        byCategoryIncome: byCategoryIncomeDto,
    };
}

module.exports = {
    list, findById, create, update, remove, removeAll,
    validateCategory, summary, getAvailableMonths,
};
