#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/scripts/aws-env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Create it first: cp scripts/aws-env.example scripts/aws-env.local"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${ECR_REGISTRY:?ECR_REGISTRY is required}"

cd "$ROOT_DIR"

if [[ -n "${AWS_PROFILE:-}" ]]; then
  export AWS_PROFILE
fi
export AWS_REGION

SERVICES=(
  "api-gateway:flipkart-api-gateway"
  "user-service:flipkart-user-service"
  "product-service:flipkart-product-service"
  "cart-service:flipkart-cart-service"
  "order-service:flipkart-order-service"
  "payment-service:flipkart-payment-service"
  "notification-service:flipkart-notification-service"
  "frontend:flipkart-frontend"
)

echo "Logging into ECR: $ECR_REGISTRY"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

for pair in "${SERVICES[@]}"; do
  dir="${pair%%:*}"
  repo="${pair##*:}"
  image_uri="$ECR_REGISTRY/$repo:latest"

  echo "============================================================"
  echo "Building $dir -> $image_uri"
  echo "============================================================"

  dockerfile="$dir/Dockerfile"
  if [[ -f "$dir/Dockerfile.aws" ]]; then
    dockerfile="$dir/Dockerfile.aws"
  fi

  docker build -f "$dockerfile" -t "$repo:latest" "$dir"
  docker tag "$repo:latest" "$image_uri"
  docker push "$image_uri"
done

echo "All images pushed successfully."
