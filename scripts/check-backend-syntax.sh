#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

find api-gateway user-service product-service cart-service order-service payment-service notification-service -name "*.js" -not -path "*/node_modules/*" -print0 \
  | while IFS= read -r -d '' file; do
      echo "Checking $file"
      node --check "$file" >/dev/null
    done

echo "Backend JavaScript syntax OK."
