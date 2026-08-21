/**
 * 数据库连接池(mysql2/promise)
 * ----------------------------------------------------------------------------
 * 通过环境变量配置连接信息,默认连接本地 Docker MySQL 容器
 * 使用连接池以提升并发性能
 *
 * 字符集:utf8mb4 + utf8mb4_unicode_ci(支持中文 + emoji)
 * 双保险:除 pool.charset 外,每个新连接建立后用 connection 事件再发一次
 *         SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci,
 *         防止服务端 init_connect / character_set_* 默认值覆盖造成 Mojibake
 *         (症状:写入的 UTF-8 字节被按 latin1 重新编码,中文全部变乱码)
 */
'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:            process.env.DB_HOST     || '127.0.0.1',
    port:            parseInt(process.env.DB_PORT || '3306', 10),
    user:            process.env.DB_USER     || 'root',
    password:        process.env.DB_PASSWORD || 'root',
    database:        process.env.DB_NAME     || 'keep_accounts',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    charset:            'utf8mb4',        // mysql2 内部用,部分版本不可靠
    dateStrings:        false,
    timezone:           '+08:00',
    supportBigNumbers:  true,
    bigNumberStrings:   false,
});

// 兜底:每条新连接建立后,显式重发 SET NAMES
// (服务端 init_connect / 配置默认值可能把 character_set_connection 改回 latin1)
pool.on('connection', (conn) => {
    conn.query(
        "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        (err) => {
            if (err) console.error('[db] SET NAMES utf8mb4 failed:', err.message);
        }
    );
});

/**
 * 测试数据库连接 + 校验字符集是否正确生效
 * @returns {Promise<boolean>} 整体可用性(true / false)
 */
async function testConnection() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query('SELECT 1 AS ok');
        const [vars] = await conn.query("SHOW VARIABLES LIKE 'character_set%'");
        const charset = {};
        vars.forEach((v) => { charset[v.Variable_name] = v.Value; });
        const utf8Ok =
            charset.character_set_client    === 'utf8mb4' &&
            charset.character_set_connection === 'utf8mb4' &&
            charset.character_set_database   === 'utf8mb4' &&
            charset.character_set_results    === 'utf8mb4' &&
            charset.character_set_server     === 'utf8mb4';
        if (!utf8Ok) {
            console.error('[db] ⚠ 字符集未全部为 utf8mb4,中文/emoji 写入会乱码!');
            console.error('[db] 实际值:', JSON.stringify(charset, null, 2));
        } else {
            console.log('[db] ✓ 字符集 utf8mb4 OK');
        }
        return rows[0].ok === 1;
    } finally {
        conn.release();
    }
}

module.exports = { pool, testConnection };
