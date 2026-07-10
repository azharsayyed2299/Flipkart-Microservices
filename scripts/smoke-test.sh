#!/usr/bin/env bash
set -euo pipefail

API="${API_URL:-http://localhost:3000/api}"
ROOT_API="${ROOT_API_URL:-http://localhost:3000}"

echo "Checking gateway..."
curl -fsS "$ROOT_API/health" | jq . || curl -fsS "$ROOT_API/health"

echo "Checking products..."
curl -fsS "$API/products?limit=3" | jq . || curl -fsS "$API/products?limit=3"

echo "Smoke test complete."
