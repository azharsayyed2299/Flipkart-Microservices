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
: "${ECS_CLUSTER:?ECS_CLUSTER is required}"

if [[ -n "${AWS_PROFILE:-}" ]]; then
  export AWS_PROFILE
fi
export AWS_REGION

SERVICES=(
  "${API_GATEWAY_SERVICE:-api-gateway-service}"
  "${USER_SERVICE:-user-service}"
  "${PRODUCT_SERVICE:-product-service}"
  "${CART_SERVICE:-cart-service}"
  "${ORDER_SERVICE:-order-service}"
  "${PAYMENT_SERVICE:-payment-service}"
  "${NOTIFICATION_SERVICE:-notification-service}"
  "${FRONTEND_SERVICE:-frontend-service}"
)

for service in "${SERVICES[@]}"; do
  echo "Forcing new ECS deployment for $service"
  aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$service" \
    --force-new-deployment \
    --region "$AWS_REGION" >/dev/null
  echo "Deployment triggered for $service"
done

echo "All ECS services triggered for new deployment."
