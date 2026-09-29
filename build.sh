#!/bin/sh
# Assembles src/game.html (artifact fragment) and index.html (standalone page) from src/parts.
set -e
cd "$(dirname "$0")"
{ cat src/parts/a-shell.html; printf '<script>\n(function(){\n'"'use strict'"';\n'; cat src/parts/b-data.js src/parts/c-game.js; printf '})();\n</script>\n'; } > src/game.html
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  sed -n '1,/^<\/style>/p' src/game.html; printf '</head>\n<body>\n'; sed -n '/^<\/style>/,$p' src/game.html | tail -n +2; printf '</body>\n</html>\n'; } > index.html
