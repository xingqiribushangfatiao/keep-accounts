# 随手记账 - 后端服务

> MVP 阶段实现:用户注册 / 登录 / 登出 / 当前用户信息

## 技术栈

| 组件 | 选型 | 说明 |
|---|---|---|
| 运行时 | Node.js >= 18 | 推荐 22 LTS |
| Web 框架 | Express.js | 4.x |
| 数据库 | MySQL 9.7.0 (Docker) | 字符集 `utf8mb4` |
| 数据库驱动 | mysql2 / promise | 连接池 |
| 密码哈希 | SHA-256 + 16 字节盐 | 对齐 PRD 5.2(生产建议升 bcrypt) |
| 会话 | DB sessions | UUID token,`Authorization: Bearer <token>` |
| 环境变量 | dotenv | `.env` 文件 |

## 目录结构

```
004/backend/
├── db/                  # 数据库相关
│   ├── schema.sql       #   建表脚本
│   └── my.cnf           #   字符集配置参考
├── src/                 # 源码
│   ├── config/
│   │   └── db.js        #   MySQL 连接池
│   ├── middleware/
│   │   └── auth.js      #   认证中间件
│   ├── routes/
│   │   └── auth.js      #   /api/auth 路由
│   ├── services/
│   │   ├── userService.js
│   │   ├── sessionService.js
│   │   └── bookService.js
│   ├── utils/
│   │   ├── crypto.js    #   密码哈希/校验
│   │   └── validators.js
│   ├── app.js           #   Express 应用
│   └── server.js        #   启动入口
├── scripts/
│   └── seed.js          #   种子用户脚本
├── .env                 #   当前环境配置(已 gitignore)
├── .env.example         #   环境配置模板
├── package.json
└── README.md
```

## 快速开始

### 1. 启动 MySQL 容器

```bash
docker run -d --name mysql-9.7.0 \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -v mysql-9.7.0-data:/var/lib/mysql \
  mysql:9.7.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

### 2. 初始化数据库

```bash
docker exec -i mysql-9.7.0 mysql -uroot -proot < db/schema.sql
```

### 3. 安装依赖

```bash
cd 004/backend
npm install
```

### 4. (可选)灌入 demo 用户

```bash
npm run seed
# 用户名: petal_love  密码: password123
```

### 5. 启动服务

```bash
# 生产模式
npm start

# 开发模式(文件变更自动重启,Node >= 18)
npm run dev
```

服务默认监听 `http://127.0.0.1:3000`。

## API 文档

> 基础路径:`/api/auth`
> 鉴权方式:除 `register` / `login` 外,均需在请求头携带 `Authorization: Bearer <token>`

### POST `/api/auth/register`

**Body**

| 字段 | 必填 | 规则 |
|---|---|---|
| username | ✅ | 3-20 位,中英文/字母/数字/下划线 |
| password | ✅ | 6-20 位,至少含一个字母和一个数字 |
| confirmPassword | ✅ | 与 password 一致 |

**成功响应 (201)**

```json
{
  "code": "OK",
  "message": "注册成功",
  "data": {
    "user": { "id": 1, "uuid": "...", "username": "alice" },
    "session": { "token": "<32位UUID>", "expiresAt": "2026-08-18T08:00:00Z", "rememberMe": false }
  }
}
```

**失败响应**

| code | HTTP | 场景 |
|---|---|---|
| `REGISTER_FIELDS_MISSING`   | 400 | 字段缺失 |
| `REGISTER_USERNAME_INVALID`  | 400 | 用户名格式错误 |
| `REGISTER_PASSWORD_INVALID`  | 400 | 密码格式错误 |
| `REGISTER_PASSWORD_MISMATCH` | 400 | 两次密码不一致 |
| `REGISTER_USERNAME_TAKEN`    | 409 | 用户名已存在 |

### POST `/api/auth/login`

**Body**

| 字段 | 必填 | 说明 |
|---|---|---|
| username | ✅ | 用户名 |
| password | ✅ | 密码 |
| rememberMe | ❌ | `true`=7 天免登录 / 默认 `false`=1 天 |

**成功响应 (200)** — 同 register,但 `message` 为 `"登录成功"`

**失败响应** — `LOGIN_INVALID` (401),统一文案 `"用户名或密码错误"`,不区分用户不存在/密码错(防枚举)

### POST `/api/auth/logout`  *(需登录)*

删除当前 token 对应的会话。

**成功响应 (200)**: `{ "code": "OK", "message": "已退出登录" }`

### GET `/api/auth/me`  *(需登录)*

返回当前登录用户与会话信息。

**成功响应 (200)**

```json
{
  "code": "OK",
  "data": {
    "user":    { "id", "uuid", "username", "lastLoginAt", "createdAt" },
    "session": { "token", "expiresAt", "rememberMe" }
  }
}
```

### GET `/api/health`

健康检查(同时验证 DB 连通性)。

```json
{ "code": "OK", "data": { "service": "...", "uptime": 12.3, "db": "connected", "ts": "..." } }
```

## 测试用例(curl)

```bash
BASE=http://127.0.0.1:3000

# 1. 注册
curl -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"pass123","confirmPassword":"pass123"}'

# 2. 登录(保存 token)
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"pass123","rememberMe":true}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.session.token))")

# 3. 当前用户
curl $BASE/api/auth/me -H "Authorization: Bearer $TOKEN"

# 4. 登出
curl -X POST $BASE/api/auth/logout -H "Authorization: Bearer $TOKEN"
```

## 后续规划

- [ ] 账本 CRUD(`/api/books`)
- [ ] 分类管理(`/api/categories`)
- [ ] 交易记录(`/api/transactions`)
- [ ] 统计接口(`/api/stats`)
- [ ] 密码升级为 bcrypt
- [ ] 速率限制(防爆破)
- [ ] refresh token + access token 双 token
- [ ] 单元测试 + 集成测试

## 故障排查

| 现象 | 排查 |
|---|---|
| 启动报 `数据库连接失败` | 确认 MySQL 容器已运行:`docker ps \| grep mysql-9.7.0` |
| 中文入库变成 `??` | 确认容器启动时带 `--character-set-server=utf8mb4` |
| 401 `AUTH_INVALID` 但 token 没错 | 检查 `sessions.expires_at > NOW()` 是否成立 |
| `MODULE_NOT_FOUND` | 执行 `npm install` 安装依赖 |
