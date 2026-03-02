# 七夜博客 (qiye-think)

基于 [dumi 2](https://d.umijs.org/) 搭建的技术博客与文档站点，专注前端工程化、企业级应用与实践复盘。

## 项目信息

| 项目 | 说明 |
|------|------|
| **名称** | qiye-think |
| **版本** | 0.0.1 |
| **描述** | 技术博客 - 前端开发与企业级应用 |
| **作者** | qiye |
| **协议** | MIT |
| **站点** | 日研技，夜写心 |

## 目录结构

```
qiye/
├── docs/                 # 文档与博客内容
│   ├── index.md          # 首页
│   ├── project/          # 项目（企业级应用与项目复盘）
│   ├── tech/             # 技术（前端开发、后端开发、AI编程）
│   │   ├── frontend/     # 前端开发
│   │   ├── backend/      # 后端开发
│   │   └── ai/           # AI编程
│   └── my/               # 简历
├── .dumirc.ts            # dumi 配置
├── package.json
└── README.md
```

## 首页

首页为文章列表：按 **项目**（鞋材ERP、企业应用、电商应用）与 **技术**（前端开发、后端开发、AI编程、运维）共 7 个分类展示，一行 2 块，每块最多 10 篇最近文章。数据由 `npm run gen:articles` 在 dev/build 前自动生成（`scripts/generate-article-list.js` → `.dumi/public/article-list.json`）。本站仅中文，英文博客计划用 Next.js 单独建设。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:8000，会先生成文章列表）
npm start
# 或
npm run dev

# 构建生产文档
npm run build

# 本地预览构建结果
npm run preview
```

## 写作规范

- 文档使用 **Markdown**，支持 frontmatter 配置 `title`、`nav`、`order`、`group` 等。
- 导航与分组在各目录下的 `index.md` 或单篇文档的 frontmatter 中通过 `nav`、`group`、`order` 控制。

## 技术栈

- **文档框架**: dumi 2.x
- **规范**: ESLint / Prettier、Commitlint（Conventional Commits）、Husky + lint-staged

## LICENSE

MIT
