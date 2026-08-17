-- =============================================================================
-- 随手记账 MVP - 数据库初始化脚本
-- =============================================================================
-- 文档:    001产品prd(项目经理)/随手记账MVP_v1.0.1_PRD.md
-- 版本:    v1.0.1
-- 数据库:  MySQL 9.7.0
-- 字符集:  utf8mb4 / utf8mb4_unicode_ci  (支持 emoji 与中文)
-- 存储引擎: InnoDB
-- -----------------------------------------------------------------------------
-- 设计要点:
--   1. 所有业务表带 user_id,实现 v1.0.1 的"数据按账号隔离"
--   2. 密码使用 SHA-256 + 盐值(前端规则),后端建议升级为 bcrypt
--   3. 分类(categories)统一管理,预设分类 user_id IS NULL
--   4. 账本(books)支持 v1.0 预留的多账本扩展
--   5. 索引聚焦"按用户 + 按日期"的高频查询路径
-- =============================================================================

-- 0. 环境准备
-- ---------------------------------------------------------------------------
-- 强制本会话使用 utf8mb4,防止 MySQL 客户端默认 latin1 导致中文/emoji
-- 被双重编码入库(经典 Mojibake 问题:每个 UTF-8 字节被当 latin1 字符
-- 再转 utf8,例如 "测" 由 E6 B5 8B 变成 C3 A6 C2 B5 E2 80 B9)
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `keep_accounts`;
CREATE DATABASE `keep_accounts`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `keep_accounts`;

-- 为整个会话设置字符集,避免客户端连接导致乱码
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;  -- 关闭外键检查以便按依赖顺序重建


-- =============================================================================
-- 1. users(用户表)
-- =============================================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT      COMMENT '内部主键',
    `uuid`            CHAR(36)        NOT NULL                     COMMENT '对外 UUID(与前端保持一致)',
    `username`        VARCHAR(50)     NOT NULL                     COMMENT '用户名(3-20位,中英文/字母/数字/下划线)',
    `password_hash`   VARCHAR(255)    NOT NULL                     COMMENT '密码哈希值(SHA-256+salt 或 bcrypt)',
    `salt`            VARCHAR(64)     NOT NULL                     COMMENT '盐值(base64,16字节)',
    `status`          TINYINT         NOT NULL DEFAULT 1           COMMENT '0=禁用 1=正常',
    `last_login_at`   DATETIME        NULL                         COMMENT '最近登录时间',
    `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_uuid`     (`uuid`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';


-- =============================================================================
-- 2. sessions(会话表)
-- =============================================================================
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT          COMMENT '内部主键',
    `token`         VARCHAR(128)    NOT NULL                         COMMENT '会话 token(UUID 或 JWT)',
    `user_id`       BIGINT UNSIGNED NOT NULL                         COMMENT '所属用户',
    `username`      VARCHAR(50)     NOT NULL                         COMMENT '冗余用户名,避免关联查询',
    `expires_at`    DATETIME        NOT NULL                         COMMENT '过期时间(记住我=7d,否则=1d)',
    `remember_me`   TINYINT(1)      NOT NULL DEFAULT 0               COMMENT '是否7天免登录',
    `ip`            VARCHAR(45)     NULL                             COMMENT '登录 IP(可选)',
    `user_agent`    VARCHAR(255)    NULL                             COMMENT '客户端 UA(可选)',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_token`     (`token`),
    KEY        `idx_user_id`  (`user_id`),
    KEY        `idx_expires`  (`expires_at`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='会话表';


-- =============================================================================
-- 3. books(账本表)
-- =============================================================================
DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT              COMMENT '内部主键',
    `uuid`        CHAR(36)        NOT NULL                             COMMENT '对外 UUID',
    `user_id`     BIGINT UNSIGNED NOT NULL                             COMMENT '所属用户',
    `name`        VARCHAR(50)     NOT NULL                             COMMENT '账本名称',
    `type`        VARCHAR(20)     NOT NULL DEFAULT 'personal'          COMMENT 'personal/family/business',
    `currency`    VARCHAR(10)     NOT NULL DEFAULT 'CNY'                COMMENT '货币代码 ISO 4217',
    `is_default`  TINYINT(1)      NOT NULL DEFAULT 0                   COMMENT '是否默认账本(每用户唯一)',
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_uuid`    (`uuid`),
    KEY        `idx_user`   (`user_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='账本表(支持多账本扩展,v1 默认每人一个)';


-- =============================================================================
-- 4. categories(分类表)
-- =============================================================================
-- user_id IS NULL 表示系统预设分类;非空表示该用户的自定义分类
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT          COMMENT '内部主键',
    `code`        VARCHAR(50)     NOT NULL                         COMMENT '分类代码(food/transport/...)',
    `name`        VARCHAR(20)     NOT NULL                         COMMENT '分类名称',
    `icon`        VARCHAR(16)     NOT NULL                         COMMENT 'emoji 图标',
    `color`       VARCHAR(20)     NOT NULL DEFAULT '#8395A7'       COMMENT '主题色 HEX',
    `type`        ENUM('expense','income') NOT NULL                COMMENT 'expense=支出 / income=收入',
    `is_preset`   TINYINT(1)      NOT NULL DEFAULT 0               COMMENT '1=系统预设 0=用户自定义',
    `user_id`     BIGINT UNSIGNED NULL                             COMMENT 'NULL=系统预设,非空=所属用户',
    `book_id`     BIGINT UNSIGNED NULL                             COMMENT 'NULL=全局,非空=限定账本',
    `sort_order`  INT             NOT NULL DEFAULT 0               COMMENT '排序权重(小的在前)',
    `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_code` (`user_id`, `code`),
    KEY        `idx_type`     (`type`),
    KEY        `idx_user`     (`user_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='分类表(系统预设 + 用户自定义)';


-- =============================================================================
-- 5. transactions(交易记录表)
-- =============================================================================
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT                   COMMENT '内部主键',
    `uuid`             CHAR(36)        NOT NULL                                  COMMENT '对外 UUID',
    `user_id`          BIGINT UNSIGNED NOT NULL                                  COMMENT '所属用户(数据隔离关键字段)',
    `book_id`          BIGINT UNSIGNED NOT NULL                                  COMMENT '所属账本',
    `category_id`      BIGINT UNSIGNED NOT NULL                                  COMMENT '分类',
    `type`             ENUM('expense','income') NOT NULL                         COMMENT 'expense=支出 / income=收入',
    `amount`           DECIMAL(12,2)   NOT NULL                                  COMMENT '金额(正数,最大 9999999.99)',
    `transaction_date` DATE            NOT NULL                                  COMMENT '业务发生日期(可补记)',
    `note`             VARCHAR(255)    NULL                                      COMMENT '备注(前端限制 50 字)',
    `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_uuid`         (`uuid`),
    KEY        `idx_user_date`   (`user_id`, `transaction_date`),
    KEY        `idx_user_book`   (`user_id`, `book_id`),
    KEY        `idx_category`    (`category_id`),
    KEY        `idx_date`        (`transaction_date`),
    CONSTRAINT `chk_amount_positive` CHECK (`amount` > 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='交易记录表';


-- =============================================================================
-- 6. user_settings(用户设置表)
-- =============================================================================
-- v1.0.1 改造:每个用户一条独立记录,避免账号切换设置串台
DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT                  COMMENT '内部主键',
    `user_id`           BIGINT UNSIGNED NOT NULL                                 COMMENT '所属用户(唯一)',
    `first_visit`       TINYINT(1)      NOT NULL DEFAULT 1                       COMMENT '是否首次访问(用于引导流程)',
    `current_book_id`   BIGINT UNSIGNED NULL                                     COMMENT '当前选中账本',
    `currency`          VARCHAR(10)     NOT NULL DEFAULT 'CNY'                    COMMENT '默认货币',
    `theme`             VARCHAR(20)     NOT NULL DEFAULT 'light'                  COMMENT '主题 light/dark',
    `budget`            DECIMAL(12,2)   NULL                                     COMMENT '月度预算(v1.1 预留,当前可空)',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user` (`user_id`),
    KEY        `idx_book` (`current_book_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='用户设置表';


SET FOREIGN_KEY_CHECKS = 1;  -- 恢复外键检查


-- =============================================================================
-- 7. 外键约束(单独追加,避免 DROP TABLE 时级联问题)
-- =============================================================================
ALTER TABLE `sessions`
    ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

ALTER TABLE `books`
    ADD CONSTRAINT `fk_books_user`     FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

ALTER TABLE `categories`
    ADD CONSTRAINT `fk_categories_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    ADD CONSTRAINT `fk_categories_book` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE;

ALTER TABLE `transactions`
    ADD CONSTRAINT `fk_tx_user`     FOREIGN KEY (`user_id`)     REFERENCES `users`(`id`)      ON DELETE CASCADE,
    ADD CONSTRAINT `fk_tx_book`     FOREIGN KEY (`book_id`)     REFERENCES `books`(`id`)      ON DELETE CASCADE,
    ADD CONSTRAINT `fk_tx_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`);

ALTER TABLE `user_settings`
    ADD CONSTRAINT `fk_settings_user` FOREIGN KEY (`user_id`)           REFERENCES `users`(`id`) ON DELETE CASCADE,
    ADD CONSTRAINT `fk_settings_book` FOREIGN KEY (`current_book_id`) REFERENCES `books`(`id`) ON DELETE SET NULL;


-- =============================================================================
-- 8. 种子数据:15 个系统预设分类(与前端 mock 数据一致)
-- =============================================================================
-- 9 个支出分类
INSERT INTO `categories` (`code`,`name`,`icon`,`color`,`type`,`is_preset`,`user_id`,`sort_order`) VALUES
    ('food',      '餐饮', '🍜', '#FF6B9D', 'expense', 1, NULL, 10),
    ('transport', '交通', '🚗', '#4ECDC4', 'expense', 1, NULL, 20),
    ('shopping',  '购物', '🛒', '#FECA57', 'expense', 1, NULL, 30),
    ('housing',   '住房', '🏠', '#FFB1C5', 'expense', 1, NULL, 40),
    ('fun',       '娱乐', '🎮', '#E83E8C', 'expense', 1, NULL, 50),
    ('health',    '医疗', '💊', '#FF4D4F', 'expense', 1, NULL, 60),
    ('pets',      '宠物', '🐱', '#FF9FF3', 'expense', 1, NULL, 70),
    ('social',    '社交', '☕', '#48DBFB', 'expense', 1, NULL, 80),
    ('other_exp', '其他', '📦', '#8395A7', 'expense', 1, NULL, 99);

-- 6 个收入分类
INSERT INTO `categories` (`code`,`name`,`icon`,`color`,`type`,`is_preset`,`user_id`,`sort_order`) VALUES
    ('salary',    '工资', '💰', '#10AC84', 'income', 1, NULL, 10),
    ('bonus',     '奖金', '🧧', '#FF6B9D', 'income', 1, NULL, 20),
    ('invest',    '投资', '📈', '#1DD1A1', 'income', 1, NULL, 30),
    ('parttime',  '兼职', '🕒', '#FECA57', 'income', 1, NULL, 40),
    ('gift_in',   '礼金', '🎁', '#FF9FF3', 'income', 1, NULL, 50),
    ('other_inc', '其他', '🪙', '#C8D6E5', 'income', 1, NULL, 99);


-- =============================================================================
-- 9. 表清单/汇总(便于回看)
-- =============================================================================
-- users            用户表
-- sessions         会话表
-- books            账本表
-- categories       分类表(预设 + 自定义)
-- transactions     交易记录表
-- user_settings    用户设置表
-- -----------------------------------------------------------------------------
-- 常用查询示例:
--   -- 本月某用户支出汇总
--   SELECT category_id, SUM(amount) total
--     FROM transactions
--    WHERE user_id = ? AND type = 'expense'
--      AND transaction_date BETWEEN '2026-08-01' AND '2026-08-31'
--    GROUP BY category_id ORDER BY total DESC;
--
--   -- 当前有效会话
--   SELECT * FROM sessions WHERE token = ? AND expires_at > NOW();
-- =============================================================================
