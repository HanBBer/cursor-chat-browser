# Cursor Chat Browser

[简体中文](README.md) | **English**

A web application for browsing and managing chat histories from the Cursor editor's AI chat feature. View, search, and export your AI conversations in various formats.

> This repository is an enhanced fork of [thomas-pedersen/cursor-chat-browser](https://github.com/thomas-pedersen/cursor-chat-browser). It fixes conversation-to-workspace matching on Windows/remote setups and adds an "Unassigned conversations" group and a "sort by last modified" toggle (see [Enhancements in this fork](#enhancements-in-this-fork)).

## Features

- 🔍 Browse and search all workspaces with Cursor chat history
- 🌐 Support for both workspace-specific and global storage (newer Cursor versions)
- 🤖 View both AI chat logs and Composer logs
- 📁 Organize chats by workspace
- 🔎 Full-text search with filters for chat/composer logs
- 🪟 **Robust cross-platform matching**: correctly handles Windows, WSL and SSH-remote paths (URL-decoding, drive/slash/case normalization)
- 🗂️ **"Unassigned conversations" group**: conversations that match no workspace folder are still browsable instead of being dropped
- ↕️ **Sort by last modified time**: toggle newest/oldest on both the project list and the conversation list
- 📱 Responsive design with dark/light mode support
- ⬇️ Export chats as:
  - Markdown files
  - HTML documents (with syntax highlighting)
  - PDF documents
- 🎨 Syntax highlighted code blocks
- 📌 Bookmarkable chat URLs
- ⚙️ Automatic workspace path detection

## Enhancements in this fork

### 1. Fix "conversations after a certain date are missing" on Windows/remote

The original project-detection only stripped the `file://` prefix and never URL-decoded the workspace folder. So on Windows (e.g. `file:///e%3A/...`, where `%3A` is never turned back into `:`) and on WSL/SSH-remote setups, almost no conversation matched a workspace and was silently dropped (a common symptom: every conversation after some point disappears).

A new `src/utils/project-match.ts` normalizes paths consistently:

- `decodeURIComponent` to restore URL encoding (`%3A → :`, `%2B → +`, etc.)
- strip the `scheme://authority` prefix (`file://`, `vscode-remote://host`, ...)
- normalize backslashes, trim leading slashes, lower-case (case-insensitive compare)
- longest-prefix + path-boundary matching to avoid `e:/code` matching `e:/code2/...`

It also removes the hardcoded `/Users/evaran/` path from the original code.

### 2. "Unassigned conversations" virtual group

Some conversations have neither `projectLayouts` nor any file references (e.g. plain Q&A or some remote sessions), so they cannot be attributed to a workspace. Those that have **real content** are now collected into an "Unassigned conversations" virtual project on the home page, so nothing is silently lost.

### 3. Sort by last modified time

- **Project list**: a toggle button (top-right) switches between newest-first and oldest-first.
- **Conversation list** (workspace page): a `Newest / Oldest` toggle in the sidebar; defaults to newest-first and auto-selects the most recent conversation.

## Prerequisites

- Node.js 18+ and npm
- A Cursor editor installation with chat history

## Installation

1. Clone the repository:

```bash
git clone https://github.com/HanBBer/cursor-chat-browser.git
cd cursor-chat-browser
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

The application automatically detects your Cursor workspace storage location based on your operating system:

- Windows: `%APPDATA%\Cursor\User\workspaceStorage`
- WSL2: `/mnt/c/Users/<USERNAME>/AppData/Roaming/Cursor/User/workspaceStorage`
- macOS: `~/Library/Application Support/Cursor/User/workspaceStorage`
- Linux: `~/.config/Cursor/User/workspaceStorage`
- Linux (remote/SSH): `~/.cursor-server/data/User/workspaceStorage`

If automatic detection fails, you can manually set the path in the Configuration page (⚙️).

**Note:** Recent versions of Cursor have moved chat data storage from workspace-specific locations to global storage. This application now supports both storage methods to ensure compatibility with all Cursor versions.

## Usage

### Browsing Logs

- View all workspaces on the home page
- Browse AI chat logs by workspace
- Access Composer logs from the navigation menu
- Navigate between different chat tabs within a workspace
- View combined logs with type indicators
- See chat and composer counts per workspace
- Use the "Unassigned conversations" group to view conversations not matched to any workspace
- Use the sort toggle to order projects and conversations by last modified time

### Searching

- Use the search bar in the navigation to search across all logs
- Filter results by chat logs, composer logs, or both
- Search results show:
  - Type badge (Chat/Composer)
  - Matching text snippets
  - Workspace location
  - Title
  - Timestamp

### Exporting

Each log can be exported as:

- Markdown: Plain text with code blocks
- HTML: Styled document with syntax highlighting
- PDF: Formatted document suitable for sharing

## Development

Built with:

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- SQLite for reading Cursor's chat database

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
