# Preview Plan: Markdown to HTML skill (preview-plan-md-to-html)

A Claude Code skill that converts Markdown plan files to styled, browser-viewable HTML with Mermaid diagram rendering.

## What it does

- Renders Mermaid diagrams inside Markdown files using the Mermaid JS CDN
- Adds a floating, collapsible table of contents panel
- Adds a footer with the source file path, git branch, worktree, and generation timestamp
- Opens the result in your browser automatically
- Output is ephemeral (`$TMPDIR`) -- nothing is committed or modified

## Prerequisites

- [pandoc](https://pandoc.org/installing.html) -- `brew install pandoc` (macOS) / `apt install pandoc` (Linux) / `winget install pandoc` (Windows)
- [Node.js](https://nodejs.org)
- Linux only: `xdg-utils` -- `apt install xdg-utils`
- Windows only: Git Bash or WSL (native CMD/PowerShell will not work)

## Installation

**macOS / Linux:**

```bash
curl -fsSL https://raw.githubusercontent.com/danikdanik/preview-plan-md-to-html/master/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/danikdanik/preview-plan-md-to-html/master/install.ps1 | iex
```

**Or with git (all platforms):**

```bash
git clone https://github.com/danikdanik/preview-plan-md-to-html.git \
  ~/.claude/skills/preview-plan-md-to-html
```

Claude Code picks up skills from `~/.claude/skills/` automatically. Restart Claude Code after installing.

## Usage

```
/preview-plan-md-to-html path/to/your/plan.md
```

Or with a custom output directory:

```
/preview-plan-md-to-html path/to/plan.md output_dir=~/tmp/project_name/date/previews
```

If called with no arguments and there is exactly one `.md` file in the current directory, it will use that file automatically.

## Output

The generated HTML file is written to `$TMPDIR/<project>/<filename>_<timestamp>.html` and opened in your default browser. The path is always printed at the end:

```
Preview: /tmp/.../plan_20260517T134500.html
```
