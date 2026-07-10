# References and Official Documentation

This document lists references for the Flipkart Clone project, AWS deployment, VS Code integration, Docker, monitoring and CI/CD.

Use official documentation as the source of truth because AWS console screens and pricing can change.

---

# PART 1: Project Documents in This Workspace

| Document | Purpose |
|---|---|
| `README.md` | Main project overview and quick start |
| `HOW_TO_RUN.md` | Local run instructions |
| `docs/ARCHITECTURE.md` | Project architecture notes |
| `docs/AWS_CONSOLE_ONLY_SETUP_GUIDE.pdf` | Complete AWS console deployment guide |
| `docs/START_AFTER_CODE_IN_VSCODE.md` | What to do after opening code in VS Code |
| `docs/MONITORING_AND_OPERATIONS_GUIDE.md` | Monitoring, alarms, dashboards and runbooks |
| `docs/VSCODE_AWS_INFRA_AND_BUILD_GUIDE.md` | Link VS Code with AWS infra, build/push/deploy |
| `docs/REFERENCES.md` | This references document |

---

# PART 2: AWS Core References

| Topic | Official Reference |
|---|---|
| AWS Console | `https://aws.amazon.com/console/` |
| AWS Documentation Home | `https://docs.aws.amazon.com/` |
| AWS Well-Architected Framework | `https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html` |
| AWS Pricing Calculator | `https://calculator.aws/` |
| AWS Free Tier | `https://aws.amazon.com/free/` |
| AWS Regions and AZs | `https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html` |

---

# PART 3: IAM and Security References

| Topic | Official Reference |
|---|---|
| IAM User Guide | `https://docs.aws.amazon.com/IAM/latest/UserGuide/` |
| IAM Best Practices | `https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html` |
| IAM Identity Center | `https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html` |
| IAM Roles | `https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html` |
| AWS Secrets Manager | `https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html` |
| AWS KMS | `https://docs.aws.amazon.com/kms/latest/developerguide/overview.html` |
| AWS WAF | `https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html` |
| AWS Shield | `https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html` |
| ACM Certificates | `https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html` |

---

# PART 4: Network and Load Balancing References

| Topic | Official Reference |
|---|---|
| Amazon VPC | `https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html` |
| VPC Security Groups | `https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html` |
| VPC Route Tables | `https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html` |
| NAT Gateways | `https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html` |
| Elastic Load Balancing | `https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html` |
| Application Load Balancer | `https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html` |
| ALB Target Groups | `https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html` |
| Route 53 | `https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html` |
| CloudFront | `https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html` |

---

# PART 5: Container and Microservices References

| Topic | Official Reference |
|---|---|
| Amazon ECS | `https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html` |
| AWS Fargate | `https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html` |
| ECS Task Definitions | `https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html` |
| ECS Services | `https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html` |
| ECS Service Auto Scaling | `https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html` |
| Amazon ECR | `https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html` |
| ECR Image Scanning | `https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html` |
| AWS Cloud Map | `https://docs.aws.amazon.com/cloud-map/latest/dg/what-is-cloud-map.html` |
| Docker Docs | `https://docs.docker.com/` |
| Docker Compose | `https://docs.docker.com/compose/` |

---

# PART 6: Database and Cache References

| Topic | Official Reference |
|---|---|
| Amazon DocumentDB | `https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html` |
| DocumentDB Connections | `https://docs.aws.amazon.com/documentdb/latest/developerguide/connect_programmatically.html` |
| DocumentDB Best Practices | `https://docs.aws.amazon.com/documentdb/latest/developerguide/best_practices.html` |
| MongoDB Manual | `https://www.mongodb.com/docs/manual/` |
| Mongoose Docs | `https://mongoosejs.com/docs/` |
| Amazon ElastiCache | `https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html` |
| ElastiCache for Redis | `https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/GettingStarted.html` |
| Redis Docs | `https://redis.io/docs/latest/` |

---

# PART 7: Monitoring and Observability References

| Topic | Official Reference |
|---|---|
| Amazon CloudWatch | `https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html` |
| CloudWatch Logs | `https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html` |
| CloudWatch Logs Insights | `https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html` |
| CloudWatch Alarms | `https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html` |
| ECS Container Insights | `https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html` |
| AWS X-Ray | `https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html` |
| ALB CloudWatch Metrics | `https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html` |
| DocumentDB Monitoring | `https://docs.aws.amazon.com/documentdb/latest/developerguide/cloud_watch.html` |
| AWS Budgets | `https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html` |
| Cost Explorer | `https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html` |

---

# PART 8: CI/CD References

| Topic | Official Reference |
|---|---|
| AWS CodePipeline | `https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html` |
| AWS CodeBuild | `https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html` |
| CodeBuild Buildspec | `https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html` |
| ECS Deploy Action in CodePipeline | `https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-ECS.html` |
| GitHub Actions | `https://docs.github.com/en/actions` |
| GitHub Actions for Amazon ECS | `https://github.com/aws-actions/amazon-ecs-deploy-task-definition` |
| AWS Credentials GitHub Action | `https://github.com/aws-actions/configure-aws-credentials` |
| Jenkins Documentation | `https://www.jenkins.io/doc/` |
| Jenkins Pipeline | `https://www.jenkins.io/doc/book/pipeline/` |

---

# PART 9: VS Code and Developer Tools References

| Topic | Official Reference |
|---|---|
| Visual Studio Code | `https://code.visualstudio.com/docs` |
| AWS Toolkit for VS Code | `https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html` |
| VS Code Docker Extension | `https://code.visualstudio.com/docs/containers/overview` |
| VS Code Integrated Terminal | `https://code.visualstudio.com/docs/terminal/basics` |
| VS Code Tasks | `https://code.visualstudio.com/docs/editor/tasks` |
| Terraform Extension | `https://marketplace.visualstudio.com/items?itemName=HashiCorp.terraform` |
| REST Client Extension | `https://marketplace.visualstudio.com/items?itemName=humao.rest-client` |

---

# PART 10: Frontend and Backend Framework References

| Topic | Official Reference |
|---|---|
| Node.js | `https://nodejs.org/en/docs` |
| Express.js | `https://expressjs.com/` |
| React | `https://react.dev/` |
| React Router | `https://reactrouter.com/` |
| Axios | `https://axios-http.com/docs/intro` |
| Nginx | `https://nginx.org/en/docs/` |
| JWT | `https://jwt.io/introduction` |
| bcrypt | `https://www.npmjs.com/package/bcryptjs` |

---

# PART 11: Infrastructure as Code References

| Topic | Official Reference |
|---|---|
| Terraform | `https://developer.hashicorp.com/terraform/docs` |
| Terraform AWS Provider | `https://registry.terraform.io/providers/hashicorp/aws/latest/docs` |
| Terraform ECS Resources | `https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster` |
| Terraform ECR Resources | `https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository` |
| Terraform VPC Resources | `https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc` |
| Terraform DocumentDB Resources | `https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/docdb_cluster` |

---

# PART 12: Important Project-Specific Routes

The completed project uses these public API routes through API Gateway:

| Feature | Route |
|---|---|
| Gateway health | `/api/health` or `/health` |
| Register | `/api/users/register` |
| Login | `/api/users/login` |
| Profile | `/api/users/profile` |
| Products | `/api/products` |
| Product detail | `/api/products/:id` |
| Cart | `/api/cart/:userId` |
| Orders | `/api/orders` |
| User orders | `/api/orders/user/:userId` |
| Payments | `/api/payments` |
| Notifications | `/api/notifications/user/:userId` |

Important correction:

```text
Use /api/products
Do not use /api/products/products
```

---

# PART 13: Pricing References

Always check live AWS pricing before running production workloads:

| Service | Pricing Page |
|---|---|
| ECS Fargate | `https://aws.amazon.com/fargate/pricing/` |
| DocumentDB | `https://aws.amazon.com/documentdb/pricing/` |
| Application Load Balancer | `https://aws.amazon.com/elasticloadbalancing/pricing/` |
| NAT Gateway | `https://aws.amazon.com/vpc/pricing/` |
| ECR | `https://aws.amazon.com/ecr/pricing/` |
| CloudWatch | `https://aws.amazon.com/cloudwatch/pricing/` |
| ElastiCache | `https://aws.amazon.com/elasticache/pricing/` |
| CloudFront | `https://aws.amazon.com/cloudfront/pricing/` |
| WAF | `https://aws.amazon.com/waf/pricing/` |
| Secrets Manager | `https://aws.amazon.com/secrets-manager/pricing/` |

---

# PART 14: Recommended Learning Order

If you are learning this end-to-end, follow this order:

1. Run the app locally with `HOW_TO_RUN.md`.
2. Open and understand `README.md`.
3. Read `docs/ARCHITECTURE.md`.
4. Follow `docs/START_AFTER_CODE_IN_VSCODE.md`.
5. Follow `docs/AWS_CONSOLE_ONLY_SETUP_GUIDE.pdf`.
6. Use `docs/VSCODE_AWS_INFRA_AND_BUILD_GUIDE.md` to connect local code to AWS.
7. Use `docs/MONITORING_AND_OPERATIONS_GUIDE.md` after deployment.
8. Use this references document when you need official docs.
