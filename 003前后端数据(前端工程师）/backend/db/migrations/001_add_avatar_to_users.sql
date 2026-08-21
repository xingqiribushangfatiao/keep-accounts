-- =============================================================================
-- 迁移 001:为 users 表增加 avatar 字段(base64 内联,MEDIUMTEXT 容纳约 16MB)
-- 用途:legacy 前端的"上传头像"功能落库
-- 兼容:已建库直接 ALTER;新库走 schema.sql(已同步)
-- =============================================================================

USE `keep_accounts`;

-- 1. 头像列(允许 NULL,老用户不受影响)
ALTER TABLE `users`
    ADD COLUMN `avatar` MEDIUMTEXT NULL
        COMMENT '头像 base64 dataURL(JPEG,256x256,质量 0.85)'
        AFTER `salt`;

-- 2. 验证
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
  FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = 'keep_accounts' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar';
