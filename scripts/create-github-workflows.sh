#!/usr/bin/env bash
set -euo pipefail

# Optional generator for one GitHub Actions deploy workflow per service.
# The main matrix workflow (deploy-to-aws-ecs.yml) is manual-only, so these
# generated workflows handle automatic path-based deployments.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOW_DIR="$ROOT_DIR/.github/workflows"
mkdir -p "$WORKFLOW_DIR"

SERVICES=(
  "api-gateway|flipkart-api-gateway|api-gateway-service|flipkart-api-gateway|api-gateway"
  "user-service|flipkart-user-service|user-service|flipkart-user-service|user-service"
  "product-service|flipkart-product-service|product-service|flipkart-product-service|product-service"
  "cart-service|flipkart-cart-service|cart-service|flipkart-cart-service|cart-service"
  "order-service|flipkart-order-service|order-service|flipkart-order-service|order-service"
  "payment-service|flipkart-payment-service|payment-service|flipkart-payment-service|payment-service"
  "notification-service|flipkart-notification-service|notification-service|flipkart-notification-service|notification-service"
  "frontend|flipkart-frontend|frontend-service|flipkart-frontend|frontend"
)

for row in "${SERVICES[@]}"; do
  IFS='|' read -r DIR ECR_REPO ECS_SERVICE TASK_DEF CONTAINER_NAME <<< "$row"
  OUT="$WORKFLOW_DIR/deploy-$DIR.yml"

  cat > "$OUT" <<'EOF_TEMPLATE'
name: Deploy __DIR__

on:
  push:
    branches: [ main ]
    paths:
      - '__DIR__/**'
      - '.github/workflows/deploy-__DIR__.yml'
  workflow_dispatch:

env:
  AWS_REGION: ${{ secrets.AWS_REGION || 'us-east-1' }}
  ECR_REPOSITORY: __ECR_REPO__
  ECS_SERVICE: __ECS_SERVICE__
  ECS_CLUSTER: ${{ secrets.ECS_CLUSTER || 'flipkart-cluster' }}
  ECS_TASK_DEFINITION: __TASK_DEF__
  CONTAINER_NAME: __CONTAINER_NAME__
  SERVICE_DIR: __DIR__

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL || '/api' }}
        run: |
          set -euo pipefail
          DOCKERFILE="$SERVICE_DIR/Dockerfile"
          if [ -f "$SERVICE_DIR/Dockerfile.aws" ]; then
            DOCKERFILE="$SERVICE_DIR/Dockerfile.aws"
          fi
          BUILD_ARGS=""
          if [ "$SERVICE_DIR" = "frontend" ]; then
            BUILD_ARGS="--build-arg REACT_APP_API_URL=$REACT_APP_API_URL"
          fi
          docker build -f "$DOCKERFILE" $BUILD_ARGS -t "$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" "$SERVICE_DIR"
          docker tag "$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" "$ECR_REGISTRY/$ECR_REPOSITORY:latest"
          docker push "$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
          docker push "$ECR_REGISTRY/$ECR_REPOSITORY:latest"
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Download task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition "$ECS_TASK_DEFINITION" \
            --query taskDefinition > task-definition.json

      - name: Update task definition image
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: ${{ env.CONTAINER_NAME }}
          image: ${{ steps.build-image.outputs.image }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
EOF_TEMPLATE

  sed -i \
    -e "s#__DIR__#$DIR#g" \
    -e "s#__ECR_REPO__#$ECR_REPO#g" \
    -e "s#__ECS_SERVICE__#$ECS_SERVICE#g" \
    -e "s#__TASK_DEF__#$TASK_DEF#g" \
    -e "s#__CONTAINER_NAME__#$CONTAINER_NAME#g" \
    "$OUT"

  echo "Created $OUT"
done

echo "All per-service workflow files generated."
echo "Manual all/selected deployment remains available in .github/workflows/deploy-to-aws-ecs.yml"
