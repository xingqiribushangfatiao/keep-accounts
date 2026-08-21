/**
 * 交易路由
 * ----------------------------------------------------------------------------
 * GET    /api/transactions?bookId=&type=&month=YYYY-MM
 * POST   /api/transactions
 * PUT    /api/transactions/:id
 * DELETE /api/transactions/:id
 *
 * 入参字段(全部 camelCase):bookId, categoryId, type, amount, transactionDate, note
 */
'use strict';

const express         = require('express');
const router          = express.Router();
const transactionService = require('../services/transactionService');
const bookService     = require('../services/bookService');
const { requireAuth } = require('../middleware/auth');

/* 校验 amount 数字 + 范围 */
function validateAmount(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n > 9999999.99) return null;
    return Math.round(n * 100) / 100;
}

/* 校验 date YYYY-MM-DD */
function validateDate(v) {
    if (typeof v !== 'string') return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    const d = new Date(v + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return null;
    return v;
}

/* 解析账本 ID(不传则用默认账本) */
async function resolveBookId(userId, requested) {
    if (requested) {
        const n = parseInt(requested, 10);
        if (n) return n;
    }
    const book = await bookService.getCurrentBook(userId);
    return book ? book.id : null;
}

/* ==========================================================================
 * GET /api/transactions
 * ========================================================================== */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const { bookId, type, month } = req.query;
        if (type && !['expense', 'income'].includes(type)) {
            return res.status(400).json({ code: 'TX_TYPE_INVALID', message: 'type 须为 expense/income' });
        }
        const list = await transactionService.list({
            userId: req.user.id,
            bookId: bookId ? parseInt(bookId, 10) : undefined,
            type,
            month,
        });
        return res.json({ code: 'OK', data: list });
    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
 * POST /api/transactions
 * Body: { bookId?, categoryId, type, amount, transactionDate, note? }
 * ========================================================================== */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { bookId, categoryId, type, amount, transactionDate, note } = req.body || {};
        if (!categoryId || !type || amount === undefined || !transactionDate) {
            return res.status(400).json({ code: 'TX_FIELDS_MISSING', message: '缺少必填字段' });
        }
        if (!['expense', 'income'].includes(type)) {
            return res.status(400).json({ code: 'TX_TYPE_INVALID', message: 'type 须为 expense/income' });
        }
        const amt = validateAmount(amount);
        if (amt === null) {
            return res.status(400).json({ code: 'TX_AMOUNT_INVALID', message: 'amount 须为正数(≤ 9999999.99)' });
        }
        const date = validateDate(transactionDate);
        if (!date) {
            return res.status(400).json({ code: 'TX_DATE_INVALID', message: 'transactionDate 须为 YYYY-MM-DD' });
        }
        const cat = await transactionService.validateCategory(categoryId, req.user.id);
        if (!cat) {
            return res.status(400).json({ code: 'TX_CATEGORY_INVALID', message: '分类不存在或无权使用' });
        }
        if (cat.type !== type) {
            return res.status(400).json({ code: 'TX_CATEGORY_TYPE_MISMATCH', message: `分类[${cat.type}]与交易类型[${type}]不一致` });
        }
        const bookIdResolved = await resolveBookId(req.user.id, bookId);
        if (!bookIdResolved) {
            return res.status(400).json({ code: 'TX_BOOK_NOT_FOUND', message: '未找到可用账本' });
        }
        const tx = await transactionService.create({
            userId: req.user.id,
            bookId: bookIdResolved,
            categoryId,
            type,
            amount: amt,
            transactionDate: date,
            note: note ? String(note).slice(0, 255) : null,
        });
        return res.status(201).json({ code: 'OK', message: '已记账', data: tx });
    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
 * PUT /api/transactions/:id
 * Body: 部分字段更新
 * ========================================================================== */
router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) {
            return res.status(400).json({ code: 'TX_ID_INVALID', message: 'id 无效' });
        }
        const patch = {};
        const { categoryId, type, amount, transactionDate, note } = req.body || {};

        if (categoryId !== undefined) {
            const cat = await transactionService.validateCategory(categoryId, req.user.id);
            if (!cat) {
                return res.status(400).json({ code: 'TX_CATEGORY_INVALID', message: '分类不存在或无权使用' });
            }
            patch.categoryId = categoryId;
        }
        if (type !== undefined) {
            if (!['expense', 'income'].includes(type)) {
                return res.status(400).json({ code: 'TX_TYPE_INVALID', message: 'type 须为 expense/income' });
            }
            patch.type = type;
        }
        if (amount !== undefined) {
            const amt = validateAmount(amount);
            if (amt === null) {
                return res.status(400).json({ code: 'TX_AMOUNT_INVALID', message: 'amount 须为正数' });
            }
            patch.amount = amt;
        }
        if (transactionDate !== undefined) {
            const d = validateDate(transactionDate);
            if (!d) {
                return res.status(400).json({ code: 'TX_DATE_INVALID', message: 'transactionDate 须为 YYYY-MM-DD' });
            }
            patch.transactionDate = d;
        }
        if (note !== undefined) {
            patch.note = note ? String(note).slice(0, 255) : null;
        }

        const tx = await transactionService.update(id, req.user.id, patch);
        if (!tx) {
            return res.status(404).json({ code: 'TX_NOT_FOUND', message: '交易不存在' });
        }
        return res.json({ code: 'OK', message: '已更新', data: tx });
    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
 * DELETE /api/transactions/:id
 * ========================================================================== */
router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) {
            return res.status(400).json({ code: 'TX_ID_INVALID', message: 'id 无效' });
        }
        const ok = await transactionService.remove(id, req.user.id);
        if (!ok) {
            return res.status(404).json({ code: 'TX_NOT_FOUND', message: '交易不存在' });
        }
        return res.json({ code: 'OK', message: '已删除' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
