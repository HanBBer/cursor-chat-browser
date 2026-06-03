// Utilities to robustly match a conversation's file reference to a workspace folder.
//
// Cursor stores workspace folders as URIs (e.g. "file:///e%3A/Code/foo",
// "vscode-remote://wsl%2Bubuntu/home/user/foo"). File references inside
// conversations come in many shapes (URL-encoded, with/without scheme, mixed
// slashes, Windows drive letters). The original code only stripped the "file://"
// prefix and never URL-decoded, so on Windows / remote setups almost nothing
// matched and those conversations were silently dropped.

/**
 * Reduce any URI / path to a normalized, comparable form:
 * - URL-decoded (%3A -> :, %2B -> +, etc.)
 * - scheme://authority prefix removed (file://, vscode-remote://host, ...)
 * - notebook cell fragment (#...) removed
 * - backslashes -> forward slashes, leading slashes trimmed
 * - lower-cased (paths on Windows/macOS are effectively case-insensitive)
 */
export function toComparablePath(input?: string | null): string {
  if (!input) return ''
  let s = String(input)
  try {
    s = decodeURIComponent(s)
  } catch {
    // keep raw value if it is not valid percent-encoding
  }
  const hashIdx = s.indexOf('#')
  if (hashIdx !== -1) s = s.slice(0, hashIdx)
  // Remove "scheme://authority" leaving only the path portion.
  s = s.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]*/, '')
  s = s.replace(/\\/g, '/')
  s = s.replace(/^\/+/, '')
  return s.toLowerCase()
}

export interface WorkspaceFolderEntry {
  id: string
  comparable: string
}

/**
 * Build a list of { workspaceId, comparablePath } from workspace.json folders,
 * sorted by path length descending so the most specific (nested) project wins.
 */
export function buildWorkspaceFolderList(
  workspaceEntries: Array<{ name: string; folder?: string | null }>
): WorkspaceFolderEntry[] {
  const list: WorkspaceFolderEntry[] = []
  for (const entry of workspaceEntries) {
    const comparable = toComparablePath(entry.folder)
    if (comparable) list.push({ id: entry.name, comparable })
  }
  list.sort((a, b) => b.comparable.length - a.comparable.length)
  return list
}

/**
 * Return the workspace id whose folder is a path-prefix of the given file path,
 * or null. Uses a path-boundary check to avoid "e:/code" matching "e:/code2/...".
 */
export function matchWorkspaceIdByFilePath(
  filePath: string | null | undefined,
  folderList: WorkspaceFolderEntry[]
): string | null {
  const np = toComparablePath(filePath)
  if (!np) return null
  for (const w of folderList) {
    if (np === w.comparable || np.startsWith(w.comparable + '/')) {
      return w.id
    }
  }
  return null
}
