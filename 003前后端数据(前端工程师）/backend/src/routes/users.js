/**
 * 用户路由
 * ----------------------------------------------------------------------------
 * GET  /api/users/me/avatar  获取当前用户头像(需登录)
 * PUT  /api/users/me/avatar  上传/更新当前用户头像(需登录)
 *      Body: { avatar: "data:image/jpeg;base64,..." } 或 { avatar: null } 清除
 * 体积限制:avatar 字符串 ≤ 1MB(后端中间件 express.json limit 256KB,见 app.js)
 * 真实 256x256 JPEG base64 ≈ 30~60KB,留足余量
 */
'use strict';

const express    = require('express');
const router     = express.Router();
const userService = require('../services/userService');
const { requireAuth } = require('../middleware/auth');

/* 中间件:校验 avatar 字段 */
function validateAvatarPayload(req, res, next) {
    const body = req.body || {};
    // 必须显式带 avatar 字段(null/string)
    if (!('avatar' in body)) {
        return res.status(400).json({ code: 'AVATAR_FIELD_MISSING', message: '缺少 avatar 字段' });
    }
    const { avatar } = body;
    // 允许 null(显式清除)
    if (avatar === null) return next();
    if (typeof avatar !== 'string') {
        return res.status(400).json({ code: 'AVATAR_INVALID', message: '头像格式无效' });
    }
    // dataURL 头校验
    if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar)) {
        return res.status(400).json({ code: 'AVATAR_INVALID', message: '头像需为 base64 dataURL(image/jpeg|png|webp)' });
    }
    // 体积粗估:base64 长度 * 0.75 ≈ 字节数
    // 真实 256x256 JPEG 0.85 ≈ 30~60KB,留 200KB 上限(整体 body 受 express.json 256KB 约束)
    const sizeBytes = Math.floor(avatar.length * 0.75);
    if (sizeBytes > 200 * 1024) {
        return res.status(413).json({ code: 'AVATAR_TOO_LARGE', message: '头像大小不能超过 200KB' });
    }
    next();
}

/* =============================================================================
 * GET /api/users/me/avatar  (需登录)
 * 成功: 200 { code:'OK', data: { avatar: 'data:...' | null } }
 * ========================================================================== */
router.get('/me/avatar', requireAuth, async (req, res, next) => {
    try {
        const user = await userService.findByIdWithAvatar(req.user.id);
        if (!user) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: '用户不存在' });
        }
        return res.json({
            code: 'OK',
            data: { avatar: user.avatar || null },
        });
    } catch (err) {
        next(err);
    }
});

/* =============================================================================
 * PUT /api/users/me/avatar  (需登录)
 * Body: { avatar: 'data:image/jpeg;base64,...' | null }
 * 成功: 200 { code:'OK', message:'头像已更新' }
 * 失败: 400 / 413
 * ========================================================================== */
router.put('/me/avatar', requireAuth, validateAvatarPayload, async (req, res, next) => {
    try {
        const { avatar } = req.body || {};
        await userService.updateAvatar(req.user.id, avatar || null);
        return res.json({
            code:    'OK',
            message: avatar ? '头像已更新' : '头像已清除',
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
