# Additional Guides Index

These new documents were added to support development, AWS linking, monitoring and references.

## Documents

| File | Description |
|---|---|
| `docs/START_AFTER_CODE_IN_VSCODE.md` | Step-by-step guide after opening the project in VS Code |
| `docs/MONITORING_AND_OPERATIONS_GUIDE.md` | Local and AWS monitoring, CloudWatch, alarms and runbooks |
| `docs/VSCODE_AWS_INFRA_AND_BUILD_GUIDE.md` | Link VS Code to AWS, build/push ECR images, deploy ECS, Terraform workflow |
| `docs/REFERENCES.md` | Official references and documentation links |
| `AWS_DEPLOYMENT_QUICKSTART.md` | Direct path from working local code to AWS deployment |
| `docs/AWS_DEPLOYMENT_QUICKSTART.pdf` | PDF version of AWS quickstart |
| `docs/DEVOPS_PIPELINE_SETUP.md` | Cross-check and setup for GitHub Actions, CodeBuild, ECR and ECS deployment |
| `docs/DEVOPS_PIPELINE_SETUP.pdf` | PDF version of DevOps pipeline setup |
| `docs/PHASE_1_INFRA_VALIDATION_PHASE_2_CICD.md` | Final infra validation and CI/CD phase guide |
| `docs/PHASE_1_INFRA_VALIDATION_PHASE_2_CICD.pdf` | PDF version of final infra validation and CI/CD phase guide |
| `docs/DEVELOPER_OPERATIONS_MONITORING_REFERENCES.pdf` | Combined PDF containing VS Code, AWS linking, monitoring and references |

## Helper Files Added

| File | Purpose |
|---|---|
| `.vscode/extensions.json` | Recommended VS Code extensions |
| `.vscode/tasks.json` | VS Code tasks for Docker, seed, frontend build and Terraform |
| `scripts/aws-env.example` | Template for AWS account/deployment variables |
| `scripts/aws-ecr-build-push-template.sh` | Template script to build and push all Docker images to ECR |
| `scripts/aws-ecs-force-deploy-template.sh` | Template script to force ECS services to deploy new images |
| `scripts/md_to_pdf.py` | Markdown-to-PDF helper used for generated documentation |

## Recommended Reading Order

1. `HOW_TO_RUN.md`
2. `docs/START_AFTER_CODE_IN_VSCODE.md`
3. `docs/VSCODE_AWS_INFRA_AND_BUILD_GUIDE.md`
4. `docs/AWS_CONSOLE_ONLY_SETUP_GUIDE.pdf`
5. `docs/MONITORING_AND_OPERATIONS_GUIDE.md`
6. `docs/REFERENCES.md`
