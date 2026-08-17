# Petal Ledger · 随手记账 MVP

> 移动端记账 Web App 原型 · v1.0.1
> 配套 PRD：[001产品prd(项目经理)/随手记账MVP_v1.0.1_PRD.md](../001产品prd%28项目经理%29/随手记账MVP_v1.0.1_PRD.md)

![技术栈](https://img.shields.io/badge/Stack-HTML%20%2B%20Tailwind%20CDN-pink) ![状态](https://img.shields.io/badge/Status-Prototype-pink) ![版本](https://img.shields.io/badge/Version-v1.0.1-pink)

---

## 🚀 快速开始

入口页是 **`pages/login.html`**（项目根目录不再有 `index.html`）。

```bash
# 1. 打开登录页（默认入口；已登录会自动跳首页）
open pages/login.html

# 2. 或直接打开任意页面
open pages/register.html     # 注册
open pages/home.html         # 首页
```

> 由于使用了 `localStorage` 鉴权，**需要通过 HTTP 服务访问**（不要直接双击打开 `file://`）。推荐：
>
> ```bash
> # 在仓库根目录启动一个静态服务器
> python -m http.server 8000
> # 然后访问 http://localhost:8000/pages/login.html
> ```
>
> 如果使用 **Apache**，根目录的 `.htaccess` 已配置 `DirectoryIndex pages/login.html`，
> 直接访问 `http://localhost:8000/` 即可进入登录页。

---

## 📂 项目结构

```
003前端代码（前端工程师）/
├── .htaccess               # Apache 配置：把 pages/login.html 设为目录默认入口
│
├── pages/                  # 所有业务页面（含入口）
│   ├── login.html          # /login  登录（项目入口）
│   ├── register.html       # /register  注册
│   ├── home.html           # /  首页（看板 + 最近记录 + FAB 记账）
│   ├── record.html         # /record  记账（数字键盘 + 分类选择）
│   ├── list.html           # /list  明细（按月/分类筛选 + 左滑删除）
│   ├── stats.html          # /stats  统计（趋势图 + 分类占比）
│   └── settings.html       # /settings  设置（账号 / 退出登录）
│
├── shared/                 # 共享资源
│   ├── css/
│   │   ├── tokens.css              # 设计令牌（CSS 变量）
│   │   ├── base.css                # 全局基础样式
│   │   └── tailwind.config.js      # Tailwind 配置（共享）
│   └── js/
│       ├── data.js                 # 模拟数据（分类 / 记录 / 用户）
│       ├── auth.js                 # 鉴权状态（localStorage + 路由守卫）
│       ├── nav.js                  # 底部导航组件
│       └── utils.js                # 工具函数（金额/日期格式化）
│
├── logo/                   # 品牌 Logo
├── docs/
│   └── DESIGN.md           # 设计规范（颜色 / 字体 / 间距）
│
└── README.md               # 本文件
```

---

## 🔄 页面跳转关系

```
                        ┌──────────────┐
                        │  login.html  │  入口（项目根目录无 index.html）
                        └──────┬───────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                未登录                  已登录
                  │                         │
                  ▼                         ▼
          ┌────────────┐            ┌────────────┐
          │  login.html│ ◄──登录─── │  home.html │
          └─────┬──────┘            └─────┬──────┘
                │                          │
          ┌─────┴──────┐                   │
          │register.html                   │
          └────────────┘                   │
                                       （record / list / stats / settings）
```

### 路由守卫

| 路径 | 是否需登录 | 说明 |
|------|------------|------|
| `/pages/login.html` | ❌ | 项目入口；已登录访问会被踢回首页 |
| `/pages/register.html` | ❌ | 已登录访问会被踢回首页 |
| `/pages/home.html` | ✅ | 未登录访问会被踢到登录页 |
| `/pages/record.html` | ✅ | 同上 |
| `/pages/list.html` | ✅ | 同上 |
| `/pages/stats.html` | ✅ | 同上 |
| `/pages/settings.html` | ✅ | 同上 |

> 守卫逻辑由 `shared/js/auth.js` 的 `Auth.requireAuth()` 提供，每个业务页面都会在 `init()` 之前调用。
> 退出登录（设置页 → 退出登录）后会跳回 `/pages/login.html`。

---

## 🎨 设计系统

所有设计令牌（颜色、字体、间距、圆角、阴影）统一在 [`docs/DESIGN.md`](docs/DESIGN.md) 中定义，并在 [`shared/css/tokens.css`](shared/css/tokens.css) 中以 CSS 变量形式落地。

### 核心色板

| 角色 | 变量 | 色值 |
|------|------|------|
| 主色 | `--primary` | `#ac2a5d` |
| 主容器 | `--primary-container` | `#FF6B9D` |
| 收入/正向 | `--income-teal` | `#7EDDD3` |
| 支出/负向 | `--expense-red` | `#FF6B9D` |
| 背景 | `--bg-soft-pink` | `#FFF0F3` |
| 卡片 | `--surface-white` | `#FFFFFF` |

### 字体

| 用途 | 字体 | 变量 |
|------|------|------|
| 标题 / 金额 | Plus Jakarta Sans | `--font-headline-lg` |
| 正文 / 标签 | Be Vietnam Pro | `--font-body-lg` |
| 图标 | Material Symbols Outlined | — |

---

## 🧩 共享资源使用示例

### 1. 引入 Tailwind + 共享配置

```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script src="../shared/css/tailwind.config.js"></script>
<link rel="stylesheet" href="../shared/css/tokens.css" />
<link rel="stylesheet" href="../shared/css/base.css" />
```

### 2. 渲染底部导航

```html
<!-- 占位容器（指定当前激活的 Tab）-->
<div id="bottom-nav" data-active="home"></div>

<script src="../shared/js/nav.js"></script>
<script>BottomNav.init();</script>
```

### 3. 鉴权与路由守卫

```js
if (!Auth.requireAuth()) {
    // 未登录，已自动跳转
} else {
    init();   // 业务初始化
}
```

### 4. 数据访问

```js
const records = MockData.transactions;
const food = MockData.getCategoryById('food');
console.log(Utils.formatCurrency(125.5));   // "¥125.50"
```

---

## 📱 页面功能清单

| 页面 | 主要功能 |
|------|----------|
| 登录 | 用户名 + 密码 + 记住我（7天免登录）|
| 注册 | 3 段校验：格式、唯一性、确认密码；注册成功自动登录 |
| 首页 | 月支出看板 + 最近 5 条记录 + FAB 快速记账 |
| 记账 | 数字键盘 + 12 支出 / 6 收入分类 + 备注 + 日期选择 + 保存 |
| 明细 | 月份切换 + 分类筛选 + 日分组 + 左滑删除 |
| 统计 | 周/月/年切换 + 收支趋势 + 分类占比 |
| 设置 | 账号信息 + 退出登录 + 偏好 + 关于 |

---

## 🛠️ 技术选型

| 技术 | 用途 | 说明 |
|------|------|------|
| HTML5 | 页面结构 | 语义化标签 |
| Tailwind CSS (CDN) | 样式 | 配合 tokens.css 复用设计令牌 |
| Vanilla JS | 交互 | 无框架依赖，原型阶段保持轻量 |
| localStorage | 鉴权 | 演示用，生产环境应替换为 IndexedDB + SHA-256 哈希 |

---

## 🚧 后续工作

- [ ] 接入 IndexedDB（localForage）持久化记账数据
- [ ] 接入 SHA-256 哈希 + salt 加密密码
- [ ] 用 ECharts 替换手写 SVG 趋势图
- [ ] 增加「我的账本」「预算」「搜索」等 P1/P2 功能
- [ ] 引入 Vant 4 + Vue 3 重构为正式 SPA

---

## 📜 变更记录

| 版本 | 日期 | 内容 |
|------|------|------|
| v1.0 | 2026-08-12 | 6 个独立原型（`_1` ~ `_6`），仅可预览不可跳转 |
| **v1.0.1** | **2026-08-14** | **重构：共享 CSS/JS、按页拆分、可互相跳转、补充明细页** |

> v1.0 时期的 6 个独立原型（`_1` ~ `_6`）已删除。重构前曾短暂归档至 `archive/`，新版稳定后清理掉。
