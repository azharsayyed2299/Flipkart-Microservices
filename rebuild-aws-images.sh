#!/bin/bash
set -e

ACCOUNT_ID="633218236922"
REGION="us-east-1"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

SERVICES=("api-gateway" "user-service" "product-service" "cart-service" "order-service" "payment-service" "notification-service" "frontend")

echo "🚀 Building and pushing AWS-compatible images..."

for service in "${SERVICES[@]}"; do
    echo "📦 Building ${service}..."
    cd "${service}"
    
    # Use Dockerfile.aws if it exists, otherwise use Dockerfile
    if [ -f "Dockerfile.aws" ]; then
        docker build -f Dockerfile.aws -t "flipkart-${service}" .
    else
        docker build -t "flipkart-${service}" .
    fi
    
    docker tag "flipkart-${service}:latest" "${REGISTRY}/flipkart-${service}:latest"
    docker push "${REGISTRY}/flipkart-${service}:latest"
    echo "✅ ${service} pushed to ECR"
    cd ..
done

echo "🎉 All images rebuilt and pushed with DocumentDB support!"
