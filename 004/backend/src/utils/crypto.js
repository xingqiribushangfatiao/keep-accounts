/**
 * 密码哈希工具
 * ----------------------------------------------------------------------------
 * 严格对齐 PRD 5.2 节:SHA-256(password + ':' + salt),salt 为 16 字节 base64
 *
 * ⚠️ 生产环境建议升级为 bcrypt/argon2(本项目为 MVP,先与前端规则保持一致)
 */
'use strict';

const crypto = require('crypto');

/**
 * 生成 16 字节随机盐值(base64 编码)
 */
function generateSalt() {
    return crypto.randomBytes(16).toString('base64');
}

/**
 * SHA-256 单次哈希
 */
function sha256(text) {
    return crypto
        .createHash('sha256')
        .update(text, 'utf8')
        .digest('hex');
}

/**
 * 用 salt 哈希密码(对齐 PRD crypto.js 实现)
 */
function hashPassword(password, salt) {
    return sha256(`${password}:${salt}`);
}

/**
 * 验证密码
 * @returns {boolean}
 */
function verifyPassword(password, salt, expectedHash) {
    if (!password || !salt || !expectedHash) return false;
    const actual = hashPassword(password, salt);
    // 用 timingSafeEqual 防时序攻击
    const a = Buffer.from(actual, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

module.exports = { generateSalt, sha256, hashPassword, verifyPassword };
