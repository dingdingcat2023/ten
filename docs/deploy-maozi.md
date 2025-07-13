# 帽子云部署指南（deploy-maozi.md）

本项目适合在帽子云进行前后端分离部署，前端为静态网页，后端为Node.js API，排行榜等数据持久化采用JSON文件，无需数据库。

---

## 1. 前端部署（静态网页）

1. **代码准备**：确保前端为纯SPA项目（如React/Vue/Svelte），构建产物在 `dist/` 或 `build/` 目录。
2. **推送代码到GitHub**。
3. **登录帽子云**：[https://dash.maoziyun.com/login](https://dash.maoziyun.com/login)
4. **创建应用**，选择你的GitHub仓库。
5. **配置构建命令**：如 `npm run build`，发布目录填写 `dist` 或 `build`。
6. **一键部署**，等待构建完成即可通过分配域名访问。

## 2. 后端部署（Node.js API）

1. **后端代码准备**：仅用Node.js（如Express/Koa），数据持久化采用本地JSON文件（如 `leaderboard.json`），无需数据库。
2. **推送后端代码到GitHub**。
3. **在帽子云新建后端应用**，选择Node.js环境。
4. **配置启动命令**：如 `npm run build` 或 `npm start`。
5. **部署上线**，获取API访问地址。
6. **注意CORS跨域**：如前后端分开部署，需在后端允许前端域名跨域访问。

## 3. 其他建议
- 排行榜等数据仅记录前五名，存储于JSON文件（如 `leaderboard.json`）。
- .gitignore 已配置忽略 node_modules、dist、build、.env、日志等。
- 如需自定义域名、HTTPS、环境变量等，可在帽子云后台设置。

## 4. 参考文档
- [帽子云快速开始](https://www.maoziyun.com/docs/quick-start)
- [帽子云文档首页](https://www.maoziyun.com/docs/)

---

如有问题可查阅帽子云官方文档或联系开发者。 