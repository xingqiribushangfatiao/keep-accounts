/**
 * 账本路由
 * ----------------------------------------------------------------------------
 * 当前阶段:只衔接 bookService 已有方法(getCurrentBook)。
 * 完整 CRUD(GET 列表 / POST 创建 / PATCH 改名 / DELETE 删除)待后端补齐后
 * 再行添加,本轮不实现。
 *
 *   GET  /api/books/current   当前用户的默认账本(需登录)
 */
'use strict';

const express = require('express');
const router  = express.Router();

const { requireAuth } = require('../middleware/auth');
const bookService = require('../services/bookService');

/* =============================================================================
 * GET /api/books/current  (需登录)
 * 返回 user_settings.current_book_id 指向的账本
 * 成功: 200 { code:'OK', data: { book: { ... } } }
 * 失败: 404 BOOK_NO_DEFAULT
 * ========================================================================== */
router.get('/current', requireAuth, async (req, res, next) => {
    try {
        const book = await bookService.getCurrentBook(req.user.id);
        if (!book) {
            return res.status(404).json({
                code:    'BOOK_NO_DEFAULT',
                message: '尚未设置默认账本,请在「我的」中创建',
            });
        }
        return res.json({
            code: 'OK',
            data: {
                book: {
                    id:        book.id,
                    uuid:      book.uuid,
                    name:      book.name,
                    type:      book.type,
                    currency:  book.currency,
                    isDefault: book.is_default === 1,
                },
            },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
