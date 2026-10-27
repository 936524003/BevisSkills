---
name: bevis-hub-portal
description: Bevis Skills / BevisHub 门户是什么、如何搜索与下载 skill、列表如何更新。在用户问门户用途、下载方式、仓库结构或发布流程时使用。
---

# Bevis Skills 门户

## 它是什么

Bevis Skills（常与 BevisHub 一起被提起）是一个**静态 skill 归档站**：首页列出可下载的 `.zip` skill 包，支持按文件名搜索。博客入口在 `https://www.bevis.wang`。

仓库本体是 GitHub Pages 风格站点：根目录 `index.html` + `files.json` + `files/` 下的 zip。

## 访客怎么用

1. 打开门户首页。
2. 在搜索框输入关键字过滤 skill 名称。
3. 点该行的「下载」按钮获取文件（只从下载按钮取文件，不要乱点其它链接当下载源）。

公开下载路径形态：`files/<文件名>`（例如 `files/xir-dev-standards.zip`）。

## 列表从哪来

- `files.json`：当前 skill 清单（`name` / `bytes` / `date`）。
- `files/`：实际上传的 zip；忽略 `.gitkeep`。
- 推送到 `main` 且改动了 `files/**` 时，GitHub Action `Update skill list` 会跑 `.github/scripts/build_index.py` 重建 `files.json` 并回写提交。

## 回答时注意

- 具体「现在有哪些包」以 `list_skills` 工具结果为准，不要背过时名单。
- 不要暴露服务器内部绝对路径、CI token 或部署密钥。
- 不确定某个 zip 里装了什么时，如实说门户只展示文件名与元数据，内容需用户自己打开包查看。
