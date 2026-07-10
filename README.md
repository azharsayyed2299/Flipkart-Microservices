# 🛒 Flipkart Clone - Microservices E-Commerce Platform

A production-grade e-commerce platform built with microservices architecture, deployed on AWS using ECS Fargate with a complete CI/CD pipeline via GitHub Actions.

**Live Demo:** http://www.azharsayyed122.work.gd/


<img width="1900" height="922" alt="image" src="https://github.com/user-attachments/assets/4eea0f77-de00-416d-b87e-066332db4bd3" />
<img width="1902" height="947" alt="image" src="https://github.com/user-attachments/assets/a0860b0d-6380-472c-a1be-d51adb0109f3" />


---

## 📋 Project Overview

This is a full-stack Flipkart-inspired e-commerce application demonstrating:
- Microservices architecture
- Container orchestration
- Cloud-native deployment
- DevOps automation
- Zero-downtime deployments

---

## 🏗️ Architecture

<img width="817" height="607" alt="image" src="https://github.com/user-attachments/assets/69e5a9f1-2c1b-4978-b0b1-7433e04b8664" />

<img width="1287" height="532" alt="image" src="https://github.com/user-attachments/assets/fb5e36ef-9aea-4894-b86f-bb1a7057e8c5" />

### Application Architecture
User Browser
↓
Route 53 (DNS)
↓
Application Load Balancer
↓
├── /api/* → API Gateway (Node.js)
│ ↓
│ ┌────┴────┬─────────┬──────────┬──────────┬──────────┐
│ ↓ ↓ ↓ ↓ ↓ ↓
│ User Product Cart Order Payment Notification
│ Service Service Service Service Service Service
│ ↓ ↓ ↓ ↓ ↓ ↓
│ └─────────┴─────────┴──────────┴──────────┴──────────┘
│ ↓
│ DocumentDB
│ (MongoDB compatible)
│
└── /* → Frontend (React + Nginx)

text


### DevOps Architecture
Developer (VS Code)
↓ git push
GitHub Repository
↓ triggers
GitHub Actions (Matrix Strategy - 8 parallel jobs)
↓
For each service:

Checkout code
AWS authentication
ECR login
Docker build (with Dockerfile.aws)
Push to ECR (SHA + latest tags)
Update ECS task definition
Deploy to ECS (rolling deployment)
Wait for stability
↓
Amazon ECR → Amazon ECS Fargate
↓
Zero-downtime deployment
↓
Live on production URL
text


---

## 🚀 Tech Stack

### Backend
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** Amazon DocumentDB (MongoDB compatible)
- **Authentication:** JWT (JSON Web Tokens)
- **API Gateway:** Custom Express gateway with reverse proxy

### Frontend
- **Framework:** React 18
- **Routing:** React Router
- **HTTP Client:** Axios
- **Web Server:** Nginx (in Docker)

### DevOps & Infrastructure
- **Container Runtime:** Docker
- **Container Registry:** Amazon ECR
- **Container Orchestration:** Amazon ECS Fargate
- **Load Balancer:** AWS Application Load Balancer
- **Service Discovery:** AWS Cloud Map
- **DNS:** Amazon Route 53
- **Monitoring:** Amazon CloudWatch
- **CI/CD:** GitHub Actions
- **Infrastructure:** AWS VPC, Subnets, Security Groups
- **Networking:** Multi-AZ deployment (us-east-1a, us-east-1b)

---

## 📦 Microservices

| Service | Port | Description | Database |
|---------|------|-------------|----------|
| API Gateway | 3000 | Routes requests, JWT validation, rate limiting | - |
| User Service | 3001 | Authentication, user profiles, addresses | flipkart-users |
| Product Service | 3002 | Product catalog, search, categories, reviews | flipkart-products |
| Cart Service | 3003 | Shopping cart management | flipkart-carts |
| Order Service | 3004 | Order placement, tracking, cancellation | flipkart-orders |
| Payment Service | 3005 | Payment processing (COD/Card/UPI/NetBanking) | flipkart-payments |
| Notification Service | 3006 | In-app notifications, email alerts | flipkart-notifications |
| Frontend | 80 | React-based user interface | - |

---

## ✨ Features

### User Features
- User registration and login with JWT
- Product browsing with filters and search
- Category-based product listing
- Shopping cart management
- Multiple payment methods (COD, Card, UPI, NetBanking)
- Order tracking and history
- Order cancellation
- Real-time notifications
- User profile and address management

### Technical Features
- Microservices architecture with 8 independent services
- Service-to-service communication via AWS Cloud Map
- Zero-downtime rolling deployments
- Auto-scaling based on CPU/Memory
- TLS-encrypted database connections
- Container health checks
- Centralized logging via CloudWatch
- Automated CI/CD pipeline
- Multi-environment support (local + AWS)

---

## 🔄 CI/CD Pipeline

### How It Works

1. **Developer pushes code to `main` branch**
2. **GitHub Actions automatically triggers**
3. **Matrix strategy runs 8 parallel jobs** (one per service)
4. **Each job:**
   - Checks out code
   - Authenticates with AWS
   - Logs into Amazon ECR
   - Builds Docker image (uses `Dockerfile.aws` for DocumentDB TLS)
   - Tags with commit SHA + `latest`
   - Pushes to ECR
   - Updates ECS task definition
   - Deploys to ECS service
   - Waits for service stability

### Pipeline Features

- ✅ Automatic deployment on push to `main`
- ✅ Manual deployment via workflow dispatch
- ✅ Selective service deployment
- ✅ Zero-downtime rolling deployments
- ✅ Immutable image tags (git SHA)
- ✅ Automatic rollback capability
- ✅ Parallel deployment (all 8 services)
- ✅ Health check validation
- ✅ Service stability verification

### Deployment Time
- **Full deployment:** ~6-7 minutes
- **Downtime:** Zero

---

## 🏃 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- AWS CLI configured
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/azharsayyed2299/Flipkart-Microservices.git
cd Flipkart-Microservices

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build

# Seed sample products
docker compose exec product-service npm run seed

# Access the application
# Frontend: http://localhost:8080
# API Gateway: http://localhost:3000
API Endpoints
Health Check:

Bash

curl http://localhost:3000/health
Get Products:

Bash

curl http://localhost:3000/api/products
Register User:

Bash

curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
🌐 AWS Deployment
Infrastructure Components
text

✅ VPC with 2 public + 2 private subnets across 2 AZs
✅ Internet Gateway + NAT Gateway
✅ 4 Security Groups (ALB, API Gateway, Services, DocumentDB)
✅ Application Load Balancer with path-based routing
✅ 8 ECR repositories (one per service)
✅ ECS Fargate cluster with 8 services
✅ Amazon DocumentDB cluster
✅ AWS Cloud Map for service discovery
✅ Route 53 hosted zone
✅ CloudWatch monitoring and logs
✅ Auto-scaling policies
AWS Services Used
Service	Purpose
VPC	Network isolation
ECS Fargate	Container orchestration
ECR	Docker image registry
ALB	Load balancing
DocumentDB	MongoDB-compatible database
Cloud Map	Service discovery
Route 53	DNS management
CloudWatch	Monitoring & logging
IAM	Access control
Security Groups	Network security
📊 Monitoring
CloudWatch Logs: All service logs centralized
CloudWatch Metrics: CPU, memory, network per service
Container Insights: ECS cluster and task metrics
ALB Metrics: Request count, latency, error rates
DocumentDB Metrics: Connections, CPU, throughput
🔐 Security
JWT-based authentication
TLS encryption for database connections
Private subnets for containers
Security groups with least-privilege access
Service-to-service authentication
Rate limiting at API Gateway
Helmet.js security headers
CORS configuration
📁 Project Structure
text

flipkart-clone/
├── .github/
│   └── workflows/
│       └── deploy-to-aws-ecs.yml    # CI/CD pipeline
├── api-gateway/                      # API Gateway service
│   ├── Dockerfile
│   ├── Dockerfile.aws                # For AWS with DocDB TLS
│   └── server.js
├── user-service/                     # Authentication service
├── product-service/                  # Product catalog
├── cart-service/                     # Shopping cart
├── order-service/                    # Order management
├── payment-service/                  # Payment processing
├── notification-service/             # Notifications
├── frontend/                         # React application
├── infrastructure/
│   └── terraform/                    # IaC (optional)
├── scripts/                          # Helper scripts
├── docs/                             # Documentation
├── docker-compose.yml                # Local development
└── README.md
🎯 Key Achievements
✅ Microservices Architecture: 8 independent services
✅ Cloud-Native: Fully deployed on AWS
✅ Zero-Downtime Deployments: Rolling updates via ECS
✅ Automated CI/CD: Push to deploy in ~7 minutes
✅ Production-Ready: Auto-scaling, monitoring, health checks
✅ Secure: TLS everywhere, private subnets, IAM roles
✅ Scalable: Fargate auto-scales based on load
✅ Cost-Optimized: Serverless containers (no EC2 to manage)
🛠️ Deployment Commands
Deploy All Services (Manual)
Bash

# Trigger via GitHub Actions UI
# Actions → Deploy Flipkart Clone to AWS ECS → Run workflow → Select "all"
Deploy Single Service (Manual)
Bash

# Actions → Deploy Flipkart Clone to AWS ECS → Run workflow → Select service
Auto-Deploy (On Push)
Bash

git add .
git commit -m "your changes"
git push origin main
# Pipeline triggers automatically
📈 Future Enhancements
 Add HTTPS with ACM certificate
 Implement AWS WAF for security
 Add CloudFront CDN
 Integrate ElastiCache Redis for caching
 Add AWS Secrets Manager for credentials
 Implement path-based CI/CD triggers
 Add integration tests in pipeline
 Set up blue/green deployments
 Add distributed tracing with X-Ray
 Implement real payment gateway (Stripe/Razorpay)
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📝 License
This project is for educational purposes.

👨‍💻 Author
Azhar Sayyed

GitHub: @azharsayyed2299
Live Site: azharsayyed122.work.gd
