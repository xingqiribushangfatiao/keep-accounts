# Petal Ledger · 随手记账 MVP

> 一人团队项目实战 · 004 前端工程化版本

## 📖 项目说明

Petal Ledger 是一款轻量、贴心的手机记账 App。本目录是**前端实现代码**，采用单文件 HTML + Tailwind Play CDN，**无需构建**，双击 HTML 即可在浏览器中运行。

## 🚀 快速开始

### 方式 1：VSCode Live Server（推荐）

1. 安装 VSCode 插件 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. 右键 `pages/home.html` → "Open with Live Server"
3. 浏览器自动打开 `http://127.0.0.1:5500/004/pages/home.html`

### 方式 2：直接打开

双击 `pages/home.html` 即可，部分功能（如 localStorage 跨页面）需要 HTTP 协议。

## 📁 目录结构

```
004/
├── index.html              # 入口（重定向到 home.html）
├── pages/                  # 页面
│   ├── home.html           # 首页 - Hero 卡 + 今日支出 + 最近记录
│   ├── list.html           # 明细 - 全部交易列表 + 筛选
│   ├── record.html         # 记一笔 - 数字键盘 + 分类选择
│   ├── stats.html          # 统计 - 环形图 + 分类排行
│   ├── settings.html       # 设置 - 偏好 + 数据 + 退出
│   ├── login.html          # 登录
│   └── register.html       # 注册
├── shared/                 # 共享资源
│   ├── css/
│   │   ├── tokens.css      # 设计令牌（颜色 / 间距 / 阴影）
│   │   └── base.css        # 全局基础样式
│   └── js/
│       ├── auth.js         # localStorage 模拟登录
│       ├── utils.js        # 工具函数（金额 / 日期格式化）
│       ├── data.js         # Mock 数据 + 分类定义
│       └── nav.js          # 底部导航组件
└── README.md
```

## 🛠 技术栈

| 类别 | 选型 |
|---|---|
| 标记 | HTML5 |
| 样式 | Tailwind CSS（Play CDN，无需构建） |
| 脚本 | 原生 JavaScript（ES6+），无框架 |
| 存储 | `localStorage`（演示用数据持久化） |
| 图表 | SVG 环形图（统计页） |
| 图标 | Material Symbols Outlined |
| 字体 | Be Vietnam Pro + Plus Jakarta Sans |

## ✨ 核心功能

- ✅ **首页**：本月支出 Hero 卡 + 今日支出 + 预算结余 + 最近记录
- ✅ **明细**：全部交易流水分组显示
- ✅ **记账**：支出/收入切换 + 8 大分类 + 数字键盘 + 备注
- ✅ **统计**：本周/本月/本年切换 + 环形图 + 分类排行
- ✅ **设置**：账号 + 偏好（月度预算、货币、主题、提醒）+ 数据管理
- ✅ **登录/注册**：用户名 + 密码（演示用 btoa 哈希）

## 🎨 设计规范

- **主色调**：Petal Pink `#FF6B9D`（暖粉）+ Mint Teal `#4ECDC4`（薄荷）
- **背景**：Soft Pink `#FFF0F3`
- **圆角**：卡片 `2xl` (16px)，按钮 `full` (圆形)
- **阴影**：底部导航 + 浮层专用 token
- **设计稿**：`pages/*-screen.png` 1:1 还原

## 🔐 演示账号

- 直接点 "注册" 创建一个新账号即可登录
- 数据全部存在浏览器 `localStorage`，清除浏览器数据会重置

## 📝 版本

**v1.0.0** - MVP 初始化版本

## 🤝 后续规划

- [ ] 数据导出/导入（CSV）
- [ ] 真实后端接入
- [ ] 月度预算可视化
- [ ] 记账提醒（Notification API）
- [ ] 多账本支持
- [ ] 深色模式
