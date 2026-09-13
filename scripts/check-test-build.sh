#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../jawwal-more-store-code"
pnpm check
pnpm test
pnpm build
