/**
 * 服务启动入口
 */
'use strict';

require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
    // 启动前先检查 DB 连通性
    try {
        const ok = await testConnection();
        if (!ok) throw new Error('DB ping returned non-1');
        console.log('✅ 数据库连接成功');
    } catch (err) {
        console.error('❌ 数据库连接失败:', err.message);
        console.error('请检查 .env 配置与 MySQL 容器是否运行');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`🚀 随手记账后端已启动: http://127.0.0.1:${PORT}`);
        console.log(`   健康检查: http://127.0.0.1:${PORT}/api/health`);
        console.log(`   认证接口: http://127.0.0.1:${PORT}/api/auth`);
    });
}

main();
