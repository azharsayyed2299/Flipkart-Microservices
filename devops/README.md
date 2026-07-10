# DevOps Assets for AWS Deployment

This folder contains templates for deploying the Flipkart Clone to AWS using ECR, ECS Fargate, CodeBuild, CodePipeline or GitHub Actions.

## Included

| Path | Purpose |
|---|---|
| `ecs-task-definitions/*.json` | ECS task definition templates with placeholders |
| Service `buildspec.yml` files | CodeBuild build definitions, stored inside each service folder |
| `.github/workflows/deploy-to-aws-ecs.yml` | GitHub Actions workflow to build, push and deploy services |
| `../push-to-ecr.sh` | Local ECR build/push script |
| `../scripts/aws-create-ecr-repositories.sh` | Creates required ECR repositories |
| `../scripts/aws-ecr-build-push-template.sh` | Env-file based ECR build/push script |
| `../scripts/aws-ecs-force-deploy-template.sh` | Forces ECS services to pull new images |

## How to Use ECS Task Definition Templates

1. Replace placeholders:

```text
<ACCOUNT_ID>
<AWS_REGION>
<DOCDB_CLUSTER_ENDPOINT>
<URL_ENCODED_PASSWORD>
<JWT_SECRET>
```

2. Register task definition in AWS Console or CLI.
3. Create ECS services using these task definitions.

## Important

The backend AWS Dockerfiles include Amazon DocumentDB TLS trust bundle:

```text
/app/global-bundle.pem
```

Use a MongoDB URI with:

```text
tls=true&tlsCAFile=/app/global-bundle.pem&retryWrites=false
```

## Recommended Deployment

1. Create infrastructure with Console or Terraform.
2. Push first images using `../push-to-ecr.sh`.
3. Create ECS task definitions and services.
4. Enable GitHub Actions or CodePipeline for future deployments.
