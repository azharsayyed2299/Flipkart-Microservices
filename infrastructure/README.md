# AWS Infrastructure Starter

This folder contains a Terraform baseline for deploying the Flipkart Clone platform to AWS.

It creates:

- VPC with public/private subnets across two Availability Zones
- Internet Gateway and public route table
- ECS cluster
- ECR repositories for each service image
- Application Load Balancer and security groups
- CloudWatch log group
- DocumentDB subnet group and cluster for MongoDB-compatible storage

## Usage

```bash
cd infrastructure/terraform
terraform init
terraform plan -var='docdb_master_password=ChangeThisStrongPassword123!'
terraform apply -var='docdb_master_password=ChangeThisStrongPassword123!'
```

## Next Steps for a Full AWS Deployment

1. Build and push each Docker image to the created ECR repositories.
2. Add ECS task definitions and services for each microservice.
3. Store secrets in AWS Secrets Manager or SSM Parameter Store.
4. Use private subnets for backend services and DocumentDB.
5. Put only the frontend/API Gateway behind public ALB listener rules.
6. Add ACM TLS certificate and Route 53 DNS.
7. Add CI/CD with GitHub Actions or Jenkins.
