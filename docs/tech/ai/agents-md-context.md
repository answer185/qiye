---
title: 使用 AGENTS.md 管理 AI 编程上下文
toc: content
order: 2
---

# 使用 AGENTS.md 管理 AI 编程上下文

## 背景
当一个产品引入前后端分享、微服务、分布式、云原生等相关技术后，通常底层的代码会被分成多个项目。比如：

```
flowpulse/
│
├── api/                    # 主api
├── web/                    # webu端
├── mobile/                 # 手机端
│
├── api-gateway/             # Spring Cloud Gateway
│
├── api-mdm/                # MDM 服务
├── api-order/              # 订单服务
├── api-purchase/           # 采购服务
├── api-production/         # 生产服务
├── api-inventory/          # 库存服务
├── api-system/             # 系统的基础功能服务
│
├── bi-web/
├── bi-mobile/
│
└── infrastructure/
    │
    ├── docker-compose.yml
    │
    ├── mysql/
    ├── redis/
    ├── nacos/
    ├── minio/
    ├── clickhouse/
    ├── meilisearch/
    └── mailpit/
```

以上是线脉产品的部分目录规划。当我们开发一个默认功能时，经常会涉及多个目录，以问题反馈的功能为例，可能会涉及：
- web: web开发上报的按钮及相关的列表展示和操作
- mobile: mobile端开发上报的按钮
- api-system: 新增相关的api接口及数据库表

现在的AI编程已经很强大，只要告诉它目标，它就可以自动把前后端同时实现出来。为了让它更高效做这些事，它需要知道这个项目的一些基础信息。这时就需要AGENTS.md这样的文件。

## AGENTS.md
这是写给AI看的文件，可以记录：项目说明、开发约束、运行方式和代码规范等。方便AI理解项目，并按要求开发。

对于拆分成多个的项目，最好每个子项目的文件夹下也要有一个。用于说明子项目的情况。

## AGENTS.md的内容组成
### 项目说明
用于说明项目的基础信息，如：
```
项目包含旧版 Laravel API、Spring Boot 微服务、统一 API 网关、PC 前端、移动端 H5 以及公共基础设施。

开发过程中，应优先考虑业务边界、系统职责、服务间调用关系和整体架构的一致性，而不是仅从当前文件或单个项目出发进行修改。

各子目录另有独立的 `AGENTS.md`，描述该项目的职责、技术栈、启动方式和本地约定。进入具体目录开发时，应同时阅读该目录下的说明。
```

### 技术栈
项目所使用的相关技术，如：

| 配置 | 值 |
|---|---|
| 构建 | Maven（`./mvnw` / `run.sh`） |
| Language | Java 21 |
| Spring Boot | 4.1.1 |
| Spring Cloud / Alibaba | 配合 Nacos 注册与配置 |
| Group / Artifact | `com.deepshadow` / `api-system` |
| 包名 | `com.deepshadow.apisystem` |
| Packaging | Jar |
| 本地端口 | `8210` |
| 库表迁移 | Flyway（`src/main/resources/db/migration/`） |
| 数据源 | Nacos 配置 `api-system-db.yml`（**不在本仓库写死 JDBC**） |
| 数据库名 | `flowpulse_system`（本地与线上库名相同） |

### 请求及代理
#### 前端
一般前端需要说明api是如何调用的。如：

开发环境（`REACT_APP_ENV=dev`）：

- `/api/` → `http://127.0.0.1:8215`（**api-gateway**）

不要改回直连 Laravel `8206`，除非专门排查网关。

鉴权：登录后将 token 存本地，请求头带 `Authorization: Bearer …`；期望业务响应含 `success` 等约定字段（见 `src/requestErrorConfig.ts`）。

#### 后端
后端服务可以说明网关的路径信息，如：

网关路由：`/api/system/**` → `lb://api-system`，并 `StripPrefix=2`。

经网关访问时前缀为 `/api/system`，转发后路径需与 Controller 映射一致。新增接口时同步：

1. 本服务 Controller 路径  
2. `api-gateway` 路由（若需新前缀）  
3. 前端 `services` 调用路径  

### 目录结构说明
说明重要的目录信息即可。如：
```
api-system/
  src/main/java/com/deepshadow/apisystem/
    ApiSystemApplication.java
    controller/ … entity/ … repository/ … service/
  src/main/resources/
    application.yml
    db/migration/
  pom.xml
  run.sh                 # source .env 后 mvn spring-boot:run
  .env                   # NACOS_*（勿把生产密钥写入仓库）
```


### 相关命令
如启动的方式：
```bash
cd api-system
./run.sh
```

docker类型的项目启动：
```bash
docker compose up -d
```

前端类型的项目操作：
```bash
cd web
pnpm install          # 或团队约定的包管理器
pnpm run start:dev    # 或 npm run start:dev / npm run dev（以 package.json 为准）
pnpm run build
pnpm run lint
```

### 开发规范
书写项目的相关开发规范，比如：

1. 新页面：在 `config/routes.ts` 注册，并处理 `access` / 权限名（与后端 RBAC 对齐）。
2. 接口调用放在 `src/services/`，页面内避免散落裸 URL。
3. 表单、表格、布局优先用 pro-components，保持与现有页面一致。
4. 反馈 / 版本日志：迁移完成并切换后，走网关 `/api/system/...`（`api-system`）；切换前仍可能走 Laravel。对照 `docs/feedback-and-changelog.md`，切换时改 `src/services/` 路径即可。
5. 当前只维护本地开发（代理 → `8215`）；线上环境后续再补。
6. 本目录 `docs/` 为前端功能笔记，与仓库根 `docs/` 区分开。

### 与周边关系
与周边系统的有关系，如：

| 组件 | 关系 |
|---|---|
| `api-gateway` | 开发代理目标 |
| `api` | 当前大部分业务 API 实际提供者 |
| `api-system` | 系统模块目标服务（独立库）；切换时改 `services` 路径 |


## AI自动生成这些文件
可以通过提示词，提供一些基础信息，让AI自己扫描项目并初始化这些文档出来。并让AI自己指出还需要哪些信息。适当补充即可。

## 总结
AI 编程现在已经非常强大，但是如果没有适当的约束及项目的上下文信息，写出来的内容还是会产生偏移。