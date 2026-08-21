/**
 * 分类路由
 * ----------------------------------------------------------------------------
 * GET    /api/categories?type=expense|income     列表(预设 + 当前用户自定义)
 * POST   /api/categories                         新建自定义分类
 * DELETE /api/categories/:id                     删除自定义分类(预设不可删)
 */
'use strict';

const express      = require('express');
const router       = express.Router();
const categoryService = require('../services/categoryService');
const { requireAuth }  = require('../middleware/auth');

/* ==========================================================================
 * GET /api/categories
 * ========================================================================== */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const type = req.query.type;
        if (type && !['expense', 'income'].includes(type)) {
            return res.status(400).json({ code: 'CATEGORY_TYPE_INVALID', message: 'type 须为 expense/income' });
        }
        const list = await categoryService.listForUser(req.user.id, type);
        return res.json({ code: 'OK', data: list });
    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
 * POST /api/categories
 * Body: { code, name, icon, color, type, bookId? }
 * ========================================================================== */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { code, name, icon, color, type, bookId } = req.body || {};
        if (!code || !name || !icon || !color || !type) {
            return res.status(400).json({ code: 'CATEGORY_FIELDS_MISSING', message: '缺少必填字段' });
        }
        if (!['expense', 'income'].includes(type)) {
            return res.status(400).json({ code: 'CATEGORY_TYPE_INVALID', message: 'type 须为 expense/income' });
        }
        if (typeof code !== 'string' || code.length > 50) {
            return res.status(400).json({ code: 'CATEGORY_CODE_INVALID', message: 'code 长度 ≤ 50' });
        }
        if (typeof name !== 'string' || name.length > 20) {
            return res.status(400).json({ code: 'CATEGORY_NAME_INVALID', message: 'name 长度 ≤ 20' });
        }
        const cat = await categoryService.create({
            userId: req.user.id, code, name, icon, color, type,
            bookId: bookId || null,
        });
        return res.status(201).json({ code: 'OK', message: '分类已创建', data: cat });
    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
 * DELETE /api/categories/:id
 * ========================================================================== */
router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) {
            return res.status(400).json({ code: 'CATEGORY_ID_INVALID', message: 'id 无效' });
        }
        const ok = await categoryService.remove(id, req.user.id);
        if (!ok) {
            return res.status(404).json({ code: 'CATEGORY_NOT_FOUND', message: '分类不存在或为系统预设,不可删' });
        }
        return res.json({ code: 'OK', message: '分类已删除' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
