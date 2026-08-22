/**
 * 校验工具(对齐 PRD 12.3 节 AUTH_RULES 常量)
 * ----------------------------------------------------------------------------
 * USERNAME: 3-20 位,中英文/字母/数字/下划线
 * PASSWORD: 6-20 位,至少含一个字母和一个数字
 */
'use strict';

const RULES = {
    USERNAME_MIN: 3,
    USERNAME_MAX: 20,
    // 匹配中文字符 (一-龥) + 字母 + 数字 + 下划线
    USERNAME_PATTERN: /^[一-龥a-zA-Z0-9_]+$/,
    PASSWORD_MIN: 6,
    PASSWORD_MAX: 20,
    // 至少一个字母 + 至少一个数字
    PASSWORD_PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[\s\S]+$/,
};

/**
 * 校验用户名
 * @returns {string|null} 错误信息;通过返回 null
 */
function validateUsername(username) {
    if (username == null || username === '') return '请输入用户名';
    if (typeof username !== 'string')       return '用户名格式错误';
    if (username.length < RULES.USERNAME_MIN || username.length > RULES.USERNAME_MAX) {
        return `用户名需 ${RULES.USERNAME_MIN}-${RULES.USERNAME_MAX} 位`;
    }
    if (!RULES.USERNAME_PATTERN.test(username)) {
        return '用户名为3-20位，支持中英文、字母、数字、下划线';
    }
    return null;
}

/**
 * 校验密码
 * @returns {string|null} 错误信息;通过返回 null
 */
function validatePassword(password) {
    if (password == null || password === '') return '请输入密码';
    if (typeof password !== 'string')        return '密码格式错误';
    if (password.length < RULES.PASSWORD_MIN || password.length > RULES.PASSWORD_MAX) {
        return `密码需 ${RULES.PASSWORD_MIN}-${RULES.PASSWORD_MAX} 位`;
    }
    if (!RULES.PASSWORD_PATTERN.test(password)) {
        return '密码需6-20位，且至少包含字母和数字';
    }
    return null;
}

module.exports = { RULES, validateUsername, validatePassword };
