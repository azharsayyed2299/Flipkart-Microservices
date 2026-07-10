#!/usr/bin/env bash
set -euo pipefail

# Creates the 8 private ECR repositories needed for Flipkart Clone.
# Usage:
#   export AWS_PROFILE=flipkart-dev   # optional
#   export AWS_REGION=us-east-1
#   ./scripts/aws-create-ecr-repositories.sh

AWS_REGION="${AWS_REGION:-us-east-1}"

REPOSITORIES=(
  "flipkart-api-gateway"
  "flipkart-user-service"
  "flipkart-product-service"
  "flipkart-cart-service"
  "flipkart-order-service"
  "flipkart-payment-service"
  "flipkart-notification-service"
  "flipkart-frontend"
)

for repo in "${REPOSITORIES[@]}"; do
  echo "Checking ECR repository: $repo"
  if aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" >/dev/null 2>&1; then
    echo "Repository already exists: $repo"
  else
    echo "Creating repository: $repo"
    aws ecr create-repository \
      --repository-name "$repo" \
      --image-scanning-configuration scanOnPush=true \
      --encryption-configuration encryptionType=AES256 \
      --region "$AWS_REGION" >/dev/null
  fi
done

echo "ECR repositories are ready."
