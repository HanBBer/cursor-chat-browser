# Cursor Chat Browser

**简体中文** | [English](README.en.md)

一个用于浏览、管理和导出 Cursor 编辑器 AI 对话记录的 Web 应用。可以查看、搜索并将你的 AI 对话导出为多种格式。

> 本仓库是 [thomas-pedersen/cursor-chat-browser](https://github.com/thomas-pedersen/cursor-chat-browser) 的增强分支，针对 Windows/远程环境的对话归类问题做了修复，并新增了「未归类对话」分组与「按最后修改时间排序」等功能（详见下方 [本分支新增功能](#本分支新增功能)）。

## 功能特性

- 🔍 浏览并搜索所有包含 Cursor 对话历史的工作区
- 🌐 同时支持工作区独立存储与全局存储（适配较新版本的 Cursor）
- 🤖 同时查看 AI Chat 记录与 Composer 记录
- 📁 按工作区组织对话
- 🔎 支持对 chat/composer 记录进行全文搜索与过滤
- 🪟 **跨平台稳健的对话归类**：正确处理 Windows、WSL、SSH 远程路径（URL 解码、盘符/斜杠/大小写归一化）
- 🗂️ **「未归类对话」虚拟分组**：无法匹配到任何工作区的对话也能浏览，不再被丢弃
- ↕️ **按最后修改时间排序**：项目列表与对话列表均可在「最新优先 / 最旧优先」之间切换
- 📱 响应式设计，支持深色 / 浅色模式
- ⬇️ 将对话导出为：
  - Markdown 文件
  - HTML 文档（带语法高亮）
  - PDF 文档
- 🎨 代码块语法高亮
- 📌 可收藏的对话 URL
- ⚙️ 自动检测工作区路径

## 本分支新增功能

### 1. 修复 Windows / 远程环境下「找不到某段时间之后的对话」

原代码在把对话归类到对应工作区时，只去掉了 `file://` 前缀、且从不做 URL 解码。因此在 Windows（如 `file:///e%3A/...`，`%3A` 未被还原为 `:`）以及 WSL / SSH 远程场景下，几乎没有对话能匹配上工作区，于是被代码静默丢弃（典型表现：某个时间点之后的对话全部消失）。

本分支新增 `src/utils/project-match.ts`，对路径做统一归一化：

- `decodeURIComponent` 还原 URL 编码（`%3A → :`、`%2B → +` 等）
- 去掉 `scheme://authority` 前缀（`file://`、`vscode-remote://host` 等）
- 统一反斜杠 / 去掉前导斜杠 / 转小写（按平台大小写不敏感比较）
- 采用「最长前缀 + 路径边界」匹配，避免 `e:/code` 误匹配 `e:/code2/...`

并移除了原代码中硬编码的 `/Users/evaran/` 路径。

### 2. 「未归类对话」虚拟分组

部分对话既没有 `projectLayouts`，也不引用任何文件（例如纯问答、部分远程会话），无法判断归属哪个工作区。现在这类**有实际内容**的对话会被收进首页的「Unassigned conversations」虚拟项目中，保证「一条不漏」、都能浏览到。

### 3. 按最后修改时间排序

- **项目列表**：右上角新增切换按钮，可在「最新优先 / 最旧优先」之间切换。
- **对话列表**（工作区详情页）：侧栏新增 `Newest / Oldest` 切换，默认按时间倒序，并默认选中最新一条对话。

## 环境要求

- Node.js 18+ 与 npm
- 已安装且有对话历史的 Cursor 编辑器

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/HanBBer/cursor-chat-browser.git
cd cursor-chat-browser
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 配置

应用会根据你的操作系统自动检测 Cursor 工作区存储位置：

- Windows：`%APPDATA%\Cursor\User\workspaceStorage`
- WSL2：`/mnt/c/Users/<USERNAME>/AppData/Roaming/Cursor/User/workspaceStorage`
- macOS：`~/Library/Application Support/Cursor/User/workspaceStorage`
- Linux：`~/.config/Cursor/User/workspaceStorage`
- Linux（远程 / SSH）：`~/.cursor-server/data/User/workspaceStorage`

如果自动检测失败，可在配置页面（⚙️）手动设置路径。

**说明：** 较新版本的 Cursor 已将对话数据从工作区独立位置迁移到全局存储。本应用同时支持两种存储方式，以兼容所有 Cursor 版本。

## 使用

### 浏览记录

- 在首页查看所有工作区
- 按工作区浏览 AI 对话记录
- 从导航菜单访问 Composer 记录
- 在同一工作区内的不同对话标签间切换
- 查看带类型标识的合并记录
- 查看每个工作区的 chat / composer 数量
- 通过「未归类对话」分组查看未能匹配到工作区的对话
- 使用排序切换按钮按最后修改时间排列项目与对话

### 搜索

- 使用导航栏的搜索框跨所有记录搜索
- 按 chat 记录、composer 记录或全部进行过滤
- 搜索结果展示：
  - 类型标记（Chat / Composer）
  - 匹配的文本片段
  - 工作区位置
  - 标题
  - 时间戳

### 导出

每条记录可导出为：

- Markdown：纯文本 + 代码块
- HTML：带语法高亮的样式化文档
- PDF：适合分享的排版文档

## 技术栈

- Next.js 14（App Router）
- TypeScript
- Tailwind CSS
- shadcn/ui 组件
- 使用 SQLite 读取 Cursor 的对话数据库

## 贡献

1. Fork 本仓库
2. 创建你的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交改动（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 发起 Pull Request

## 更新日志

变更列表见 [CHANGELOG.md](CHANGELOG.md)。

## 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE)。
