---
name: preview-plan-md-to-html
description: Render any Markdown plan file to a browser-viewable HTML with Mermaid diagrams. Output is ephemeral ($TMPDIR), never committed. Use when user says /preview-plan-md-to-html, wants to preview a markdown file with diagrams, or wants to open a plan in the browser.
---

# preview-plan-md-to-html

Converts a Markdown file (with Mermaid code blocks) to a styled, browser-viewable HTML using pandoc + Mermaid JS CDN.

**Recommended model: Haiku.** All steps are deterministic shell commands — no reasoning needed.

## Prerequisites

- `pandoc` — `brew install pandoc` (macOS) / `apt install pandoc` (Linux) / `winget install pandoc` (Windows)
- `node` — nodejs.org
- This skill must be installed under a directory named `preview-plan-md-to-html/` inside your Claude skills directory (defaults to `~/.claude/skills/`, override with `$CLAUDE_SKILLS_DIR`)
- Linux only: `xdg-utils` for `xdg-open` (`apt install xdg-utils`)
- Windows only: Git Bash or WSL required — native CMD/PowerShell will not work

## Inputs

- `file` (required): path to the `.md` file — relative or absolute
- `output_dir` (optional): output directory. Avoid bare `/tmp/...` — use `$TMPDIR/...` or `~/Desktop/...` to avoid sandbox blocks
- `open_browser` (optional): defaults to `true`; set to `false` to skip opening

## No-arg behavior

If `file` is not provided, scan the current directory for `.md` files. If exactly one is found, use it. If multiple exist, list them and ask the user to pick. If none, fail with: `No markdown file found. Usage: /preview-plan-md-to-html <file.md>`

## Steps

1. **Check dependencies**
   ```bash
   command -v pandoc >/dev/null || { echo "pandoc missing — brew install pandoc (macOS) / apt install pandoc (Linux)"; exit 1; }
   command -v node   >/dev/null || { echo "node missing — install from nodejs.org"; exit 1; }
   ```

2. **Resolve paths and collect metadata**
   ```bash
   [ -f "{{file}}" ] || { echo "File not found: {{file}}"; exit 1; }
   FILE="$(cd "$(dirname "{{file}}")" && pwd)/$(basename "{{file}}")"
   PROJECT=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
   DT=$(date +%Y%m%dT%H%M%S)
   NAME=$(basename "$FILE" .md)
   OUTDIR="${TMPDIR%/}/$PROJECT"
   OUTPUT="$OUTDIR/${NAME}_${DT}.html"
   mkdir -p "$OUTDIR"
   # Git metadata for footer (empty strings if not in a repo)
   GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
   GIT_WORKTREE=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
   GIT_INFO=""
   [ -n "$GIT_BRANCH" ] && GIT_INFO="$GIT_BRANCH"
   [ -n "$GIT_WORKTREE" ] && GIT_INFO="$GIT_INFO @ $GIT_WORKTREE"
   ```
   If `output_dir` was provided, use it instead of the default — but remap any `/tmp/...` path to `${TMPDIR%/}/...` to avoid sandbox permission errors.

3. **Run pandoc**
   ```bash
   pandoc "$FILE" --standalone --syntax-highlighting=none --metadata title="$NAME" -o "$OUTPUT"
   ```

4. **Post-process** (Mermaid injection + styling)
   ```bash
   SKILL_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/preview-plan-md-to-html"
   node "$SKILL_DIR/scripts/postprocess.js" "$OUTPUT" "$FILE" "$GIT_INFO" "$DT"
   ```

5. **Open in browser** (if `open_browser` is true)
   ```bash
   if command -v open >/dev/null 2>&1 && open "$OUTPUT" 2>/dev/null; then
     echo "Opened in browser."
   elif command -v xdg-open >/dev/null 2>&1 && xdg-open "$OUTPUT" 2>/dev/null; then
     echo "Opened in browser."
   elif [ "${OS:-}" = "Windows_NT" ]; then
     # Git Bash on Windows
     cmd.exe /c start "" "$OUTPUT" 2>/dev/null || powershell.exe -Command "Start-Process '$OUTPUT'" 2>/dev/null
     echo "Opened in browser."
   else
     echo "Could not open browser automatically. Open manually:"
   fi
   ```

6. Always print (whether or not browser opened):
   ```
   Preview: {{OUTPUT}}
   ```

## Notes

- Never modify the source `.md` file
- Never commit or add the output HTML to git
- If running in a background/headless session, `open` will silently fail — the printed path is the deliverable
