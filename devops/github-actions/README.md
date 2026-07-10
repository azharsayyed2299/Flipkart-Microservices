# GitHub Actions Deployment

The active workflow is:

```text
.github/workflows/deploy-to-aws-ecs.yml
```

Required repository secrets:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
ECS_CLUSTER=flipkart-cluster
REACT_APP_API_URL=/api
```

Run manually:

```text
GitHub → Actions → Deploy Flipkart Clone to AWS ECS → Run workflow
```

Or push changes to `main`.
