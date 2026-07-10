#!/usr/bin/env bash
set -euo pipefail

# Flipkart Clone - Build and push all Docker images to Amazon ECR.
# Usage:
#   1. aws configure OR aws sso login --profile flipkart-dev
#   2. export AWS_PROFILE=flipkart-dev   # optional
#   3. export AWS_ACCOUNT_ID=123456789012 # or edit below
#   4. ./push-to-ecr.sh

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-YOUR_ACCOUNT_ID_HERE}"
IMAGE_TAG="${IMAGE_TAG:-v1.0.0}"

if [[ "$AWS_ACCOUNT_ID" == "YOUR_ACCOUNT_ID_HERE" ]]; then
  echo "Please set AWS_ACCOUNT_ID first:"
  echo "  export AWS_ACCOUNT_ID=123456789012"
  echo "Or edit push-to-ecr.sh and replace YOUR_ACCOUNT_ID_HERE."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

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

echo "Logging in to ECR: $ECR_REGISTRY"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

for pair in "${SERVICES[@]}"; do
  dir="${pair%%:*}"
  repo="${pair##*:}"
  service_path="$ROOT_DIR/$dir"
  dockerfile="$service_path/Dockerfile"

  # AWS Dockerfiles include DocumentDB TLS bundle where required.
  if [[ -f "$service_path/Dockerfile.aws" ]]; then
    dockerfile="$service_path/Dockerfile.aws"
  fi

  echo "========================================="
  echo "Building $repo from $dir using $(basename "$dockerfile")"
  echo "========================================="

  docker build -f "$dockerfile" -t "$repo:latest" "$service_path"
  docker tag "$repo:latest" "$ECR_REGISTRY/$repo:latest"
  docker tag "$repo:latest" "$ECR_REGISTRY/$repo:$IMAGE_TAG"

  echo "Pushing $repo to ECR..."
  docker push "$ECR_REGISTRY/$repo:latest"
  docker push "$ECR_REGISTRY/$repo:$IMAGE_TAG"

  echo "✅ $repo pushed successfully."
  echo
done

echo "🎉 All images pushed to ECR successfully."
