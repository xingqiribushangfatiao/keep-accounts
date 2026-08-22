/**
 * 种子用户脚本
 * ----------------------------------------------------------------------------
 * 用法:npm run seed
 * 创建一个 demo 用户,便于前端联调
 *
 * 默认账号:
 *   用户名: petal_love
 *   密码:   password123
 */
'use strict';

require('dotenv').config();
const { pool, testConnection } = require('../src/config/db');
const { generateSalt, hashPassword } = require('../src/utils/crypto');
const bookService = require('../src/services/bookService');

const DEMO_USER = {
    username: 'petal_love',
    password: 'password123',
};

async function main() {
    console.log('▶ 开始灌入 demo 用户...');

    const ok = await testConnection();
    if (!ok) throw new Error('数据库连接失败');
    console.log('  ✓ 数据库连接正常');

    // 1. 检查是否已存在
    const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ?',
        [DEMO_USER.username]
    );

    if (existing.length > 0) {
        console.log(`  ⚠️  用户 ${DEMO_USER.username} 已存在 (id=${existing[0].id}),跳过创建`);
        console.log('  💡 如需重置,先手动删除该用户:DELETE FROM users WHERE username = ?');
        await pool.end();
        return;
    }

    // 2. 创建用户
    const salt = generateSalt();
    const passwordHash = hashPassword(DEMO_USER.password, salt);
    const [result] = await pool.query(
        `INSERT INTO users (uuid, username, password_hash, salt, status, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, 1, NOW(), NOW())`,
        [DEMO_USER.username, passwordHash, salt]
    );
    const userId = result.insertId;
    console.log(`  ✓ 用户创建成功 (id=${userId})`);

    // 3. 创建默认账本与设置
    await bookService.setupForNewUser(userId);
    console.log('  ✓ 默认账本 + 用户设置已创建');

    console.log('\n✅ Seed 完成!');
    console.log('────────────────────────────────────');
    console.log(`  用户名: ${DEMO_USER.username}`);
    console.log(`  密  码: ${DEMO_USER.password}`);
    console.log('────────────────────────────────────');

    await pool.end();
}

main().catch(async (err) => {
    console.error('❌ Seed 失败:', err);
    try { await pool.end(); } catch (_) { /* ignore */ }
    process.exit(1);
});
