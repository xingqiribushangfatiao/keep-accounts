/**
 * 统计路由
 * ----------------------------------------------------------------------------
 * GET /api/stats/summary?range=week|month|year&bookId=
 *  返回:总支出/总收入/结余 + 分类排行(支出)
 */
'use strict';

const express    = require('express');
const router     = express.Router();
const transactionService = require('../services/transactionService');
const { requireAuth } = require('../middleware/auth');

/* ==========================================================================
 * GET /api/stats/summary
 * ========================================================================== */
router.get('/summary', requireAuth, async (req, res, next) => {
    try {
        const range = req.query.range || 'month';
        if (!['week', 'month', 'year'].includes(range)) {
            return res.status(400).json({ code: 'STATS_RANGE_INVALID', message: 'range 须为 week/month/year' });
        }
        const bookId = req.query.bookId ? parseInt(req.query.bookId, 10) : undefined;
        const data = await transactionService.summary({
            userId: req.user.id,
            range,
            bookId,
        });
        return res.json({ code: 'OK', data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
