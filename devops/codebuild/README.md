# AWS CodeBuild / CodePipeline

Each service has its own buildspec file:

```text
api-gateway/buildspec.yml
user-service/buildspec.yml
product-service/buildspec.yml
cart-service/buildspec.yml
order-service/buildspec.yml
payment-service/buildspec.yml
notification-service/buildspec.yml
frontend/buildspec.yml
```

When creating a CodeBuild project for a service, set the buildspec path to the corresponding file.

Required CodeBuild environment variables:

```text
AWS_ACCOUNT_ID=123456789012
AWS_DEFAULT_REGION=us-east-1
```

Frontend optional variable:

```text
REACT_APP_API_URL=/api
```

The buildspec outputs:

```text
imagedefinitions.json
```

Use that in the CodePipeline ECS deploy stage.
