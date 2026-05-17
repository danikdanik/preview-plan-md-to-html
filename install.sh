#!/usr/bin/env bash
set -e

REPO="https://raw.githubusercontent.com/danikdanik/preview-plan-md-to-html/master"
DEST="$HOME/.claude/skills/preview-plan-md-to-html"

echo "Installing preview-plan-md-to-html..."

mkdir -p "$DEST/scripts"

curl -fsSL "$REPO/SKILL.md"                  -o "$DEST/SKILL.md"
curl -fsSL "$REPO/scripts/postprocess.js"    -o "$DEST/scripts/postprocess.js"

echo "Installed to $DEST"
echo "Restart Claude Code to pick up the new skill."
