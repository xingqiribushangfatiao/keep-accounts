/**
 * Express 应用入口
 * ----------------------------------------------------------------------------
 * 挂载中间件与路由,定义 404 / 错误处理
 */
'use strict';

const express = require('express');
const cors    = require('cors');

const authRouter          = require('./routes/auth');
const booksRouter         = require('./routes/books');
const usersRouter         = require('./routes/users');
const categoriesRouter    = require('./routes/categories');
const transactionsRouter  = require('./routes/transactions');
const statsRouter         = require('./routes/stats');
const { testConnection }  = require('./config/db');

const app = express();

/* ============================ 全局中间件 ============================ */
app.use(cors({
    origin:      process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// 简单访问日志(开发期可见)
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

/* ============================ 健康检查 ============================ */
app.get('/api/health', async (_req, res) => {
    try {
        const dbOk = await testConnection();
        res.json({
            code: 'OK',
            data: {
                service: 'keep-accounts-backend',
                uptime:  process.uptime(),
                db:      dbOk ? 'connected' : 'down',
                ts:      new Date().toISOString(),
            },
        });
    } catch (err) {
        res.status(503).json({ code: 'SERVICE_UNAVAILABLE', message: err.message });
    }
});

/* ============================ 业务路由 ============================ */
app.use('/api/auth',         authRouter);
app.use('/api/books',        booksRouter);
app.use('/api/users',        usersRouter);
app.use('/api/categories',   categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/stats',        statsRouter);

/* ============================ 404 处理 ============================ */
app.use((req, res) => {
    res.status(404).json({
        code: 'NOT_FOUND',
        message: `路径不存在: ${req.method} ${req.originalUrl}`,
    });
});

/* ============================ 全局错误处理 ============================ */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err);
    // 区分业务错误与系统错误
    if (err && err.business) {
        return res.status(err.status || 400).json({
            code:    err.code    || 'BUSINESS_ERROR',
            message: err.message || '业务错误',
        });
    }
    res.status(500).json({
        code:    'INTERNAL_ERROR',
        message: '服务器内部错误',
    });
});

module.exports = app;
