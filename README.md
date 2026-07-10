# Flipkart Clone - Microservices E-Commerce Platform

A full-stack, Flipkart-inspired e-commerce platform built with a microservices architecture. It includes an API Gateway, six backend services, a React frontend, Docker Compose orchestration, seed data, and an AWS Terraform starter.

> Educational/demo project. For a real production launch, replace demo secrets, lock down service networking, configure managed MongoDB/DocumentDB, and add real payment provider credentials.

## Architecture

```text
flipkart-clone/
├── api-gateway/              # Express gateway, auth guard, rate limiting, reverse proxy
├── user-service/             # JWT auth, profile, addresses
├── product-service/          # Catalog, filters, search, reviews, seed data
├── cart-service/             # Cart lifecycle, product lookup integration
├── order-service/            # Order placement, status, cancellation
├── payment-service/          # Simulated COD/Card/UPI/NetBanking payments
├── notification-service/     # In-app notifications + optional SMTP email
├── frontend/                 # React app served by Nginx in Docker
├── infrastructure/terraform/ # AWS ECS/ECR/ALB/DocumentDB starter
├── scripts/                  # Syntax and smoke-test scripts
└── docker-compose.yml
```

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend:** React 18, React Router, Axios, React Icons
- **Gateway:** Express reverse proxy, Helmet, CORS, rate limiting
- **DevOps:** Docker, Docker Compose, Nginx, Terraform starter for AWS

## Quick Start with Docker

### 1. Configure environment

```bash
cd flipkart-clone
cp .env.example .env
# Edit JWT_SECRET in .env before real usage
```

### 2. Build and run all services

```bash
docker compose up --build
```

### 3. Seed product data

In a second terminal after containers are healthy:

```bash
docker compose exec product-service npm run seed
```

### 4. Open the app

- Frontend: http://localhost:8080
- API Gateway: http://localhost:3000
- Gateway health: http://localhost:3000/health
- MongoDB: localhost:27017

## Main API Routes via Gateway

The gateway exposes clean routes under `/api`:

### Users
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `POST /api/users/address`

### Products
- `GET /api/products`
- `GET /api/products?category=Electronics&sort=rating`
- `GET /api/products/:id`
- `GET /api/products/categories`
- `POST /api/products` *(JWT required)*
- `POST /api/products/:id/reviews` *(JWT required)*

### Cart
- `GET /api/cart/:userId`
- `POST /api/cart/:userId/items`
- `PUT /api/cart/:userId/items/:productId`
- `DELETE /api/cart/:userId/items/:productId`
- `DELETE /api/cart/:userId`

### Orders
- `POST /api/orders`
- `GET /api/orders/user/:userId`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/cancel`

### Payments
- `POST /api/payments`
- `GET /api/payments/order/:orderId`
- `GET /api/payments/user/:userId`
- `POST /api/payments/:id/refund`

### Notifications
- `GET /api/notifications/user/:userId`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/user/:userId/read-all`

## Local Development without Docker

Run MongoDB first:

```bash
docker run -d --name flipkart-dev-mongo -p 27017:27017 mongo:7
```

Install and start services in separate terminals:

```bash
cd api-gateway && npm install && npm run dev
cd user-service && npm install && npm run dev
cd product-service && npm install && npm run dev
cd cart-service && npm install && npm run dev
cd order-service && npm install && npm run dev
cd payment-service && npm install && npm run dev
cd notification-service && npm install && npm run dev
cd frontend && npm install && npm start
```

Seed products locally:

```bash
cd product-service
npm run seed
```

## Useful Commands

```bash
make up       # docker compose up --build
make down     # stop services
make logs     # follow logs
make seed     # seed sample products
make check    # backend syntax check
```

## Security Notes

- The API Gateway verifies JWT for carts, orders, payments, notifications, profile routes, and product mutations.
- Individual services also validate core inputs and user-service re-verifies JWT for profile/address routes.
- In production, expose only the gateway/frontend. Keep service ports private inside ECS/VPC.
- Replace `JWT_SECRET`, configure CORS origins, and use a managed secrets store.

## AWS Deployment Starter

Terraform files under `infrastructure/terraform` create a baseline VPC, subnets, ECR repositories, ECS cluster, ALB, security groups, CloudWatch log group, and DocumentDB cluster. See `infrastructure/README.md` for deployment steps.

## Additional Guides

- `HOW_TO_RUN.md` - local run instructions
- `AWS_DEPLOYMENT_QUICKSTART.md` / `docs/AWS_DEPLOYMENT_QUICKSTART.pdf` - direct path from working local code to AWS
- `docs/AWS_CONSOLE_ONLY_SETUP_GUIDE.pdf` - complete AWS console deployment guide
- `docs/DEVOPS_PIPELINE_SETUP.pdf` - GitHub Actions, CodeBuild, ECR and ECS pipeline readiness
- `docs/PHASE_1_INFRA_VALIDATION_PHASE_2_CICD.pdf` - final infra validation checklist before CI/CD plus post-validation pipeline setup
- `docs/START_AFTER_CODE_IN_VSCODE.pdf` - what to do after opening code in VS Code
- `docs/VSCODE_AWS_INFRA_AND_BUILD_GUIDE.pdf` - connect VS Code to AWS, build and deploy
- `docs/MONITORING_AND_OPERATIONS_GUIDE.pdf` - monitoring, CloudWatch, alarms and runbooks
- `docs/REFERENCES.pdf` - official documentation references
- `docs/DEVELOPER_OPERATIONS_MONITORING_REFERENCES.pdf` - combined single PDF for VS Code, AWS linking, monitoring and references

## Features Implemented

- User registration/login/profile/address management
- Product listing, category filters, price filters, search and sorting
- Product detail page with specifications
- Shopping cart add/update/remove/clear
- Checkout with COD/Card/UPI/NetBanking simulation
- Order history and cancellation
- Payment records and order payment status update
- In-app notifications and optional SMTP emails
- Responsive React UI
- Dockerized microservices with health checks
- Seed products with embedded SVG images


Educational use.

Complete Explanation of Your Working Pipeline
Let me break down everything that made this work.

Overall Architecture Recap
text

Your Local VS Code
        ↓
    git push
        ↓
GitHub Repository (azharsayyed2299/Flipkart-Microservices)
        ↓
GitHub Actions (triggered by push to main)
        ↓
Workflow file runs (.github/workflows/deploy-to-aws-ecs.yml)
        ↓
For each of 8 services in parallel:
   1. Checkout code
   2. Auth with AWS
   3. Login to ECR
   4. Build Docker image
   5. Push to ECR
   6. Download current task definition
   7. Update image URI in task definition
   8. Register new task definition revision
   9. Deploy to ECS service
   10. Wait for stability
        ↓
Website updated on ALB
        ↓
http://www.azharsayyed122.work.gd/
The Workflow File Explained Line By Line
Your file: .github/workflows/deploy-to-aws-ecs.yml

PART 1: Workflow Name and Triggers
YAML

name: Deploy Flipkart Clone to AWS ECS
What it does:

Display name shown in GitHub Actions tab
Just a label, no functional impact
YAML

on:
  workflow_dispatch:
    inputs:
      service:
        description: 'Service to deploy'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - api-gateway
          - user-service
          - product-service
          - cart-service
          - order-service
          - payment-service
          - notification-service
          - frontend
  push:
    branches: [main]
What it does:

text

Two triggers configured:

1. workflow_dispatch (Manual Trigger)
   - You click "Run workflow" button
   - Choose from dropdown which service to deploy
   - Options: all, api-gateway, user-service, etc

2. push (Automatic Trigger)
   - Any git push to main branch
   - Automatically starts deployment
   - No manual action needed
PART 2: Global Environment Variables
YAML

env:
  AWS_REGION: us-east-1
  ECS_CLUSTER: flipkart-cluster
What it does:

text

Sets variables used everywhere in workflow:

AWS_REGION = us-east-1
  → Where your AWS resources are
  → Used for ECR, ECS, all AWS commands

ECS_CLUSTER = flipkart-cluster
  → Name of your ECS cluster
  → Used when deploying services
PART 3: Job Definition and Matrix Strategy
YAML

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - key: api-gateway
            service: api-gateway-service
            family: flipkart-api-gateway
            container: api-gateway
            build_dir: api-gateway
          - key: user-service
            service: user-service
            family: flipkart-user-service
            container: user-service
            build_dir: user-service
          ...
What it does:

text

Creates 8 PARALLEL jobs (one per service)

Matrix Strategy Explanation:
─────────────────────────────
Instead of writing 8 separate jobs
Matrix creates 8 jobs from one template

Each row in include: has 5 values:
  key         → identifier
  service     → ECS service name in AWS
  family      → ECS task definition name
  container   → container name inside task def
  build_dir   → folder in your repo

Example for api-gateway:
  key: api-gateway
  service: api-gateway-service  ← what to update in ECS
  family: flipkart-api-gateway  ← task definition name
  container: api-gateway         ← container inside task
  build_dir: api-gateway         ← folder to build from

fail-fast: false
  → If one service fails
  → Other 7 keep deploying
  → Without this, all cancel if any fails
Why matrix is powerful:

text

Without matrix - would need 8 copies:

jobs:
  deploy-api-gateway:
    ...30 lines...
  deploy-user-service:
    ...30 lines...
  deploy-product-service:
    ...30 lines...
  (repeat 8 times = 240 lines)

With matrix - write once:

jobs:
  deploy:
    ...30 lines...
    matrix: (8 configurations)
  (total = 60 lines)
PART 4: Steps Inside Each Job
STEP 1: Check Condition
YAML

- name: Check if should deploy this service
  id: check
  run: |
    SHOULD_DEPLOY=false

    if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
      if [ "${{ github.event.inputs.service }}" == "all" ]; then
        SHOULD_DEPLOY=true
      elif [ "${{ github.event.inputs.service }}" == "${{ matrix.key }}" ]; then
        SHOULD_DEPLOY=true
      fi
    elif [ "${{ github.event_name }}" == "push" ]; then
      SHOULD_DEPLOY=true
    fi

    echo "should_deploy=$SHOULD_DEPLOY" >> $GITHUB_OUTPUT
What it does:

text

Decision logic for whether to deploy this service:

If MANUAL trigger:
  If user selected "all" → deploy
  If user selected specific service matching this job → deploy
  Otherwise → skip

If PUSH trigger:
  Always deploy (all services)

Result stored in: steps.check.outputs.should_deploy
Value: "true" or "false"

Later steps check this before running:
  if: steps.check.outputs.should_deploy == 'true'
Example scenarios:

text

Scenario A: You push code
  All 8 jobs → should_deploy = true → all deploy

Scenario B: You manually pick "frontend"
  frontend job → should_deploy = true → deploys
  Other 7 jobs → should_deploy = false → skip

Scenario C: You manually pick "all"
  All 8 jobs → should_deploy = true → all deploy
STEP 2: Checkout Code
YAML

- name: Checkout code
  if: steps.check.outputs.should_deploy == 'true'
  uses: actions/checkout@v4
What it does:

text

Downloads your repository code to the runner

actions/checkout@v4
  → Official GitHub action
  → Pulls latest code from your repo
  → Puts it in current directory
  → Now Docker can build from this code

if: only runs if should_deploy = true
STEP 3: AWS Authentication
YAML

- name: Configure AWS credentials
  if: steps.check.outputs.should_deploy == 'true'
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
What it does:

text

Connects GitHub Actions to your AWS account

Reads from GitHub Secrets:
  AWS_ACCESS_KEY_ID     ← your IAM user key
  AWS_SECRET_ACCESS_KEY ← your IAM user secret

Sets AWS region: us-east-1

After this step:
  ✅ AWS CLI commands work
  ✅ Can access ECR, ECS, etc
  ✅ All AWS API calls authenticated
Where secrets come from:

text

GitHub Repo → Settings → Secrets and variables → Actions
  → AWS_ACCESS_KEY_ID (you added this)
  → AWS_SECRET_ACCESS_KEY (you added this)

These are ENCRYPTED
Never shown in logs
Never visible in code
STEP 4: ECR Login
YAML

- name: Login to Amazon ECR
  if: steps.check.outputs.should_deploy == 'true'
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2
What it does:

text

Logs Docker into Amazon ECR

Behind the scenes:
1. Gets temporary token from AWS
2. Runs: docker login (with token)
3. Now Docker can push images to ECR

Outputs:
  steps.login-ecr.outputs.registry
  = 633218236922.dkr.ecr.us-east-1.amazonaws.com

This registry URL used in build step
STEP 5: Docker Build and Push
YAML

- name: Build and push Docker image
  if: steps.check.outputs.should_deploy == 'true'
  id: build-and-push
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    IMAGE_TAG: ${{ github.sha }}
  run: |
    ECR_REPOSITORY="flipkart-${{ matrix.key }}"
    FULL_IMAGE="$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
    LATEST_IMAGE="$ECR_REGISTRY/$ECR_REPOSITORY:latest"

    if [ -f "${{ matrix.build_dir }}/Dockerfile.aws" ]; then
      docker build \
        -f ${{ matrix.build_dir }}/Dockerfile.aws \
        -t $FULL_IMAGE \
        -t $LATEST_IMAGE \
        ./${{ matrix.build_dir }}/
    else
      docker build \
        -f ${{ matrix.build_dir }}/Dockerfile \
        -t $FULL_IMAGE \
        -t $LATEST_IMAGE \
        ./${{ matrix.build_dir }}/
    fi

    docker push $FULL_IMAGE
    docker push $LATEST_IMAGE

    echo "image=$FULL_IMAGE" >> $GITHUB_OUTPUT
What it does:

text

Line by line breakdown:

ECR_REGISTRY = 633218236922.dkr.ecr.us-east-1.amazonaws.com
IMAGE_TAG = github.sha (git commit hash)

For api-gateway service:
  ECR_REPOSITORY = flipkart-api-gateway
  FULL_IMAGE = 633218236922.dkr.ecr.us-east-1.amazonaws.com/flipkart-api-gateway:abc123def
  LATEST_IMAGE = 633218236922.dkr.ecr.us-east-1.amazonaws.com/flipkart-api-gateway:latest

Check for Dockerfile.aws:
  IF api-gateway/Dockerfile.aws exists:
    Use Dockerfile.aws (has DocumentDB TLS bundle)
  ELSE:
    Use normal Dockerfile

Build creates image with TWO tags:
  1. commit SHA (for tracking version)
  2. latest (for reference)

Push both tags to ECR

Output image URL for next step
Why Dockerfile.aws matters:

text

Normal Dockerfile:
  No TLS certificates
  DocumentDB connection fails
  
Dockerfile.aws:
  Includes /app/global-bundle.pem
  DocumentDB TLS works
  
Backend services need Dockerfile.aws
Frontend uses normal Dockerfile
STEP 6: Download Task Definition
YAML

- name: Download current task definition
  if: steps.check.outputs.should_deploy == 'true'
  run: |
    aws ecs describe-task-definition \
      --task-definition ${{ matrix.family }} \
      --query 'taskDefinition' \
      --output json > task-definition.json
What it does:

text

Downloads current ECS task definition as JSON

For api-gateway:
  --task-definition flipkart-api-gateway
  
Output: task-definition.json contains:
{
  "family": "flipkart-api-gateway",
  "containerDefinitions": [
    {
      "name": "api-gateway",
      "image": "OLD_IMAGE_URI",
      "environment": [...],
      "portMappings": [...],
      ...
    }
  ],
  "cpu": "512",
  "memory": "1024",
  ...
}

This preserves ALL existing config:
  ✅ Environment variables
  ✅ Secrets
  ✅ CPU/Memory
  ✅ Networking
  ✅ IAM roles
  ✅ Log configuration
  ✅ Health checks
  
Only image will be changed
STEP 7: Render New Task Definition
YAML

- name: Render new task definition with new image
  if: steps.check.outputs.should_deploy == 'true'
  id: render-task-def
  uses: aws-actions/amazon-ecs-render-task-definition@v1
  with:
    task-definition: task-definition.json
    container-name: ${{ matrix.container }}
    image: ${{ steps.build-and-push.outputs.image }}
What it does:

text

Takes downloaded task-definition.json
Modifies ONLY the image URI
Creates new task definition file

Input:
  task-definition: task-definition.json (old)
  container-name: api-gateway
  image: 633218236922.dkr.ecr.us-east-1.amazonaws.com/flipkart-api-gateway:abc123def

Output:
  New task definition JSON with:
    - Same everything as before
    - Except image URI changed to new one

This is stored in:
  steps.render-task-def.outputs.task-definition
Why this step is important:

text

Without this step:
  You would need to manually create task definition
  Risk of losing env vars, secrets, etc

With this step:
  Preserves ALL existing config
  Only changes image
  Safe and reliable
STEP 8: Deploy to ECS
YAML

- name: Deploy to Amazon ECS
  if: steps.check.outputs.should_deploy == 'true'
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: ${{ steps.render-task-def.outputs.task-definition }}
    service: ${{ matrix.service }}
    cluster: ${{ env.ECS_CLUSTER }}
    wait-for-service-stability: true
    wait-for-minutes: 5
What it does:

text

This is where actual deployment happens:

Steps AWS performs:
1. Register new task definition revision
   flipkart-api-gateway:5 → flipkart-api-gateway:6

2. Update ECS service to use new revision
   Service: api-gateway-service
   Cluster: flipkart-cluster

3. ECS starts NEW tasks with new image
4. Health checks run on new tasks
5. ALB adds new tasks to target group
6. ALB removes old tasks from target group
7. Old tasks drain (finish current requests)
8. Old tasks stopped

wait-for-service-stability: true
  → GitHub Action waits until:
     - All new tasks healthy
     - All old tasks stopped
     - Deployment "steady state"

wait-for-minutes: 5
  → Max wait time
  → After 5 min, considers timeout
STEP 9: Success Message
YAML

- name: Deployment complete
  if: steps.check.outputs.should_deploy == 'true'
  run: |
    echo "========================================="
    echo "DEPLOYMENT COMPLETE"
    echo "Service : ${{ matrix.service }}"
    echo "Cluster : ${{ env.ECS_CLUSTER }}"
    echo "Image   : ${{ steps.build-and-push.outputs.image }}"
    echo "========================================="
What it does:

text

Just prints confirmation in logs
Nice visual indicator in GitHub Actions
Useful for debugging
How Zero Downtime Works
text

Before Deployment:
┌─────────────────────────────────────────┐
│ Task 1 (v5) RUNNING - serving traffic   │
│ Task 2 (v5) RUNNING - serving traffic   │
└─────────────────────────────────────────┘

Step 1: Start new tasks
┌─────────────────────────────────────────┐
│ Task 1 (v5) RUNNING - serving traffic   │
│ Task 2 (v5) RUNNING - serving traffic   │
│ Task 3 (v6) STARTING - not yet ready    │
│ Task 4 (v6) STARTING - not yet ready    │
└─────────────────────────────────────────┘

Step 2: New tasks pass health checks
┌─────────────────────────────────────────┐
│ Task 1 (v5) RUNNING - serving traffic   │
│ Task 2 (v5) RUNNING - serving traffic   │
│ Task 3 (v6) HEALTHY - serving traffic   │
│ Task 4 (v6) HEALTHY - serving traffic   │
└─────────────────────────────────────────┘

Step 3: Old tasks start draining
┌─────────────────────────────────────────┐
│ Task 1 (v5) DRAINING - finishing reqs   │
│ Task 2 (v5) DRAINING - finishing reqs   │
│ Task 3 (v6) HEALTHY - serving traffic   │
│ Task 4 (v6) HEALTHY - serving traffic   │
└─────────────────────────────────────────┘

Step 4: Old tasks stopped
┌─────────────────────────────────────────┐
│ Task 3 (v6) HEALTHY - serving traffic   │
│ Task 4 (v6) HEALTHY - serving traffic   │
└─────────────────────────────────────────┘

Users experienced ZERO downtime ✅
GitHub Secrets You Configured
text

Secret Name              Value
─────────────────────────────────────
AWS_ACCESS_KEY_ID        AKIA... (your IAM key)
AWS_SECRET_ACCESS_KEY    xxxx... (your IAM secret)
AWS_REGION               us-east-1
AWS_ACCOUNT_ID           633218236922
ECS_CLUSTER              flipkart-cluster
REACT_APP_API_URL        /api

How they connect:
  Workflow reads: ${{ secrets.AWS_ACCESS_KEY_ID }}
  GitHub decrypts and provides value at runtime
  Never appears in logs or code
Data Flow Complete Picture
text

1. YOU
   ├── Write code in VS Code
   └── git push origin main
              ↓
2. GITHUB
   ├── Receives push
   ├── Reads .github/workflows/deploy-to-aws-ecs.yml
   └── Starts workflow
              ↓
3. GITHUB ACTIONS RUNNER (Ubuntu VM)
   ├── Downloads your code (checkout)
   ├── Reads secrets (AWS credentials)
   └── Runs Docker
              ↓
4. DOCKER BUILD
   ├── Reads Dockerfile.aws
   ├── Builds image with your code
   └── Includes DocumentDB TLS bundle
              ↓
5. AMAZON ECR
   ├── Receives Docker image
   ├── Stores with commit SHA tag
   └── Stores with latest tag
              ↓
6. AMAZON ECS
   ├── Downloads task definition
   ├── Updates image URI
   ├── Creates new revision
   ├── Starts new tasks
   ├── Health checks
   └── Drains old tasks
              ↓
7. APPLICATION LOAD BALANCER
   ├── Routes traffic to healthy tasks
   ├── Removes unhealthy tasks
   └── Zero downtime for users
              ↓
8. ROUTE 53 + DOMAIN
   ├── azharsayyed122.work.gd
   ├── Points to ALB
   └── Users see updated site
              ↓
9. USER BROWSER
   http://www.azharsayyed122.work.gd/
   ✅ Sees new version
What Runs in Parallel
text

When you push, 8 jobs start simultaneously:

┌────────────────────┐
│ Job 1: api-gateway │──┐
├────────────────────┤  │
│ Job 2: user-svc    │──┤
├────────────────────┤  │
│ Job 3: product-svc │──┤
├────────────────────┤  │
│ Job 4: cart-svc    │──┤   All run at same time
├────────────────────┤  ├─→ Not sequential
│ Job 5: order-svc   │──┤   Total time = slowest job
├────────────────────┤  │   Not sum of all jobs
│ Job 6: payment-svc │──┤
├────────────────────┤  │
│ Job 7: notif-svc   │──┤
├────────────────────┤  │
│ Job 8: frontend    │──┘
└────────────────────┘
        ↓
    All complete
    Website updated
Summary of Why It Works
text

✅ Correct trigger config
   (push to main OR manual dispatch)

✅ Matrix strategy
   (8 services from one template)

✅ Correct AWS authentication
   (using GitHub secrets)

✅ Correct ECR repo names
   (flipkart-{service-key})

✅ Correct ECS service names
   (matches AWS console)

✅ Correct task definition families
   (matches AWS console)

✅ Correct container names
   (matches task definitions)

✅ Dockerfile.aws for backend
   (DocumentDB TLS support)

✅ fail-fast: false
   (one failure doesnt cancel all)

✅ Preserves task definition config
   (only updates image, keeps env vars)

✅ Zero downtime rolling deployment
   (ECS handles graceful switching)
