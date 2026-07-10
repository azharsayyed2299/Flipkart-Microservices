# Final Workspace Checklist

This file confirms what is included in the final Flipkart Clone workspace before download.

## Application Code

- [x] `api-gateway`
- [x] `user-service`
- [x] `product-service`
- [x] `cart-service`
- [x] `order-service`
- [x] `payment-service`
- [x] `notification-service`
- [x] `frontend`

## Local Run Support

- [x] `docker-compose.yml`
- [x] `.env.example`
- [x] `HOW_TO_RUN.md`
- [x] Product seed script: `product-service/scripts/seed.js`
- [x] Health endpoints for services
- [x] Smoke test script: `scripts/smoke-test.sh`

## AWS Deployment Support

- [x] AWS console full guide PDF: `docs/AWS_CONSOLE_ONLY_SETUP_GUIDE.pdf`
- [x] AWS quickstart: `AWS_DEPLOYMENT_QUICKSTART.md`
- [x] AWS quickstart PDF: `docs/AWS_DEPLOYMENT_QUICKSTART.pdf`
- [x] Terraform starter: `infrastructure/terraform`
- [x] ECR repository creation script: `scripts/aws-create-ecr-repositories.sh`
- [x] ECR build/push script: `push-to-ecr.sh`
- [x] Env-file ECR build/push script: `scripts/aws-ecr-build-push-template.sh`
- [x] ECS force deploy script: `scripts/aws-ecs-force-deploy-template.sh`

## DevOps Pipeline Support

- [x] GitHub Actions CI syntax check: `.github/workflows/ci.yml`
- [x] GitHub Actions manual all/selected deploy workflow: `.github/workflows/deploy-to-aws-ecs.yml`
- [x] GitHub Actions automatic per-service workflows: `.github/workflows/deploy-*.yml`
- [x] Optional per-service GitHub workflow generator: `scripts/create-github-workflows.sh`
- [x] CodeBuild buildspec for API Gateway
- [x] CodeBuild buildspec for User Service
- [x] CodeBuild buildspec for Product Service
- [x] CodeBuild buildspec for Cart Service
- [x] CodeBuild buildspec for Order Service
- [x] CodeBuild buildspec for Payment Service
- [x] CodeBuild buildspec for Notification Service
- [x] CodeBuild buildspec for Frontend
- [x] ECS task definition templates: `devops/ecs-task-definitions`
- [x] DevOps pipeline guide: `docs/DEVOPS_PIPELINE_SETUP.pdf`
- [x] Final Phase 1 validation + Phase 2 CI/CD guide: `docs/PHASE_1_INFRA_VALIDATION_PHASE_2_CICD.pdf`
- [x] AWS deployment validation helper: `scripts/aws-validate-deployment-template.sh`
- [x] Optional per-service GitHub workflow generator: `scripts/create-github-workflows.sh`

## VS Code Support

- [x] Recommended extensions: `.vscode/extensions.json`
- [x] VS Code tasks: `.vscode/tasks.json`
- [x] VS Code startup guide: `docs/START_AFTER_CODE_IN_VSCODE.pdf`
- [x] VS Code AWS linking guide: `docs/VSCODE_AWS_INFRA_AND_BUILD_GUIDE.pdf`

## Monitoring Support

- [x] Monitoring guide: `docs/MONITORING_AND_OPERATIONS_GUIDE.pdf`
- [x] CloudWatch dashboard instructions
- [x] CloudWatch alarm instructions
- [x] ECS/ALB/DocumentDB monitoring instructions
- [x] Incident runbooks
- [x] Cost monitoring checklist

## References

- [x] Official references document: `docs/REFERENCES.pdf`
- [x] Combined developer/operations/reference PDF: `docs/DEVELOPER_OPERATIONS_MONITORING_REFERENCES.pdf`

## AWS Production Details Cross-Checked

- [x] API public route is `/api/products`, not `/api/products/products`.
- [x] ALB rule should send `/api/*` to API Gateway target group.
- [x] Frontend should use `REACT_APP_API_URL=/api` for ALB routing.
- [x] Backend AWS Dockerfiles include Amazon DocumentDB TLS CA bundle.
- [x] DocumentDB URI examples include `tls=true`, `tlsCAFile=/app/global-bundle.pem`, and `retryWrites=false`.
- [x] Cloud Map service names use `*.flipkart.local`.
- [x] Security group guidance includes service-to-service communication.
- [x] GitHub Actions workflow uses `Dockerfile.aws` when available.
- [x] CodeBuild buildspecs use `Dockerfile.aws` when available.

## Validation Performed in Workspace

- [x] Backend JavaScript syntax check passed.
- [x] Frontend production build previously passed.
- [x] Shell scripts syntax checked.

Note: Docker Compose full stack was not run inside this sandbox because Docker is not installed here, but the project is configured for Docker Compose and has been statically validated.
