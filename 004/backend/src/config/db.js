/**
 * 数据库连接池(mysql2/promise)
 * ----------------------------------------------------------------------------
 * 通过环境变量配置连接信息,默认连接本地 Docker MySQL 容器
 * 使用连接池以提升并发性能
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
    charset:            'utf8mb4',
    dateStrings:        false,
    timezone:           '+08:00',
    supportBigNumbers:  true,
    bigNumberStrings:   false,
});

/**
 * 测试数据库连接
 */
async function testConnection() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query('SELECT 1 AS ok');
        return rows[0].ok === 1;
    } finally {
        conn.release();
    }
}

module.exports = { pool, testConnection };
