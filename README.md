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

## License

Educational use.
