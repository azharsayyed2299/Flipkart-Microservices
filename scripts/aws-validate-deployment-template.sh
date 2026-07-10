#!/usr/bin/env bash
set -euo pipefail

# AWS deployment validation helper for Flipkart Clone.
# This does not replace console checks, but quickly validates common runtime pieces.
#
# Setup:
#   cp scripts/aws-env.example scripts/aws-env.local
#   edit scripts/aws-env.local
#   export ALB_DNS_NAME=your-alb-dns   # or set in aws-env.local
#   ./scripts/aws-validate-deployment-template.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/scripts/aws-env.local"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

AWS_REGION="${AWS_REGION:-us-east-1}"
ECS_CLUSTER="${ECS_CLUSTER:-flipkart-cluster}"
ALB_DNS_NAME="${ALB_DNS_NAME:-}"

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

section() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

section "1. AWS identity"
aws sts get-caller-identity

section "2. ECS cluster status"
aws ecs describe-clusters \
  --clusters "$ECS_CLUSTER" \
  --region "$AWS_REGION" \
  --query 'clusters[].{clusterName:clusterName,status:status,runningTasks:runningTasksCount,activeServices:activeServicesCount}' \
  --output table

section "3. ECS service desired/running counts"
aws ecs describe-services \
  --cluster "$ECS_CLUSTER" \
  --services "${SERVICES[@]}" \
  --region "$AWS_REGION" \
  --query 'services[].{service:serviceName,status:status,desired:desiredCount,running:runningCount,pending:pendingCount}' \
  --output table

section "4. Target group health if target groups exist"
for tg in flipkart-api-tg flipkart-frontend-tg; do
  arn="$(aws elbv2 describe-target-groups --names "$tg" --region "$AWS_REGION" --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || true)"
  if [[ -n "$arn" && "$arn" != "None" ]]; then
    echo "Target group: $tg"
    aws elbv2 describe-target-health \
      --target-group-arn "$arn" \
      --region "$AWS_REGION" \
      --query 'TargetHealthDescriptions[].{target:Target.Id,port:Target.Port,state:TargetHealth.State,reason:TargetHealth.Reason}' \
      --output table
  else
    echo "Target group not found or not accessible: $tg"
  fi
done

if [[ -n "$ALB_DNS_NAME" && "$ALB_DNS_NAME" != "flipkart-alb-xxxxxxxx.us-east-1.elb.amazonaws.com" ]]; then
  BASE_URL="$ALB_DNS_NAME"
  if [[ "$BASE_URL" != http://* && "$BASE_URL" != https://* ]]; then
    BASE_URL="http://$BASE_URL"
  fi

  section "5. ALB endpoint tests"
  echo "Testing frontend: $BASE_URL/"
  curl -fsSI "$BASE_URL/" | head -10 || echo "Frontend check failed"

  echo
  echo "Testing gateway health: $BASE_URL/api/health"
  curl -fsS "$BASE_URL/api/health" || echo "Gateway health check failed"

  echo
  echo "Testing user service health: $BASE_URL/api/users/health"
  curl -fsS "$BASE_URL/api/users/health" || echo "User health check failed"

  echo
  echo "Testing products: $BASE_URL/api/products?limit=2"
  curl -fsS "$BASE_URL/api/products?limit=2" || echo "Products API check failed"
else
  section "5. ALB endpoint tests skipped"
  echo "Set ALB_DNS_NAME in scripts/aws-env.local to run HTTP checks."
fi

section "Validation helper finished"
echo "Now complete the manual checklist in docs/PHASE_1_INFRA_VALIDATION_PHASE_2_CICD.pdf"
