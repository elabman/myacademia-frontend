#!/usr/bin/env bash
# One-command deploy, run ON THE SERVER inside this folder:   bash deploy.sh
#
# The server never keeps edits of its own: it is made an exact copy of GitHub's main branch,
# so a pull can never fail on files the server built or changed (dist/, .env, ...).
# Set WEB_ROOT if the site is not in /var/www/myacademia. SUDO="" to run without sudo.
set -euo pipefail

WEB_ROOT="${WEB_ROOT:-/var/www/myacademia}"
SUDO="${SUDO-sudo}"

cd "$(dirname "$0")"

git fetch origin
git reset --hard origin/main

npm install
npm run build

$SUDO rsync -a --delete dist/ "$WEB_ROOT"/
echo "Deployed $(git rev-parse --short HEAD) to $WEB_ROOT"
