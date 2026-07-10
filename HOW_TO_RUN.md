# How to Run the Flipkart Clone

This guide explains how to run the complete Flipkart Clone microservices project from this workspace.

Project path:

```bash
/home/user/flipkart-clone
```

## 1. Prerequisites

Install these first:

- Docker
- Docker Compose
- Git, optional
- Node.js 18+, only needed if you want to run services manually without Docker

Check Docker:

```bash
docker --version
docker compose version
```

If your system uses old Compose, use `docker-compose` instead of `docker compose`.

---

## 2. Recommended Method: Run with Docker Compose

Go to the project folder:

```bash
cd /home/user/flipkart-clone
```

Create environment file:

```bash
cp .env.example .env
```

Optional but recommended: open `.env` and change `JWT_SECRET` to a long random value.

Start everything:

```bash
docker compose up --build
```

Wait until all services become healthy.

In another terminal, seed sample products:

```bash
cd /home/user/flipkart-clone
docker compose exec product-service npm run seed
```

Open the app:

```text
Frontend:    http://localhost:8080
API Gateway: http://localhost:3000
Health:      http://localhost:3000/health
```

---

## 3. Register and Use the App

1. Open `http://localhost:8080`
2. Click `Register`
3. Create a user account
4. Browse products
5. Add products to cart
6. Checkout
7. View orders and notifications

---

## 4. Useful Docker Commands

Start services:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up --build -d
```

View running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

View logs for one service:

```bash
docker compose logs -f api-gateway
```

Stop services:

```bash
docker compose down
```

Stop and delete database volume:

```bash
docker compose down -v
```

Re-seed products after clearing database:

```bash
docker compose exec product-service npm run seed
```

---

## 5. Quick API Test

After Docker is running, test gateway health:

```bash
curl http://localhost:3000/health
```

Test products:

```bash
curl "http://localhost:3000/api/products?limit=5"
```

Register user with API:

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

Login user:

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 6. Ports Used

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| API Gateway | http://localhost:3000 |
| User Service | http://localhost:3001 |
| Product Service | http://localhost:3002 |
| Cart Service | http://localhost:3003 |
| Order Service | http://localhost:3004 |
| Payment Service | http://localhost:3005 |
| Notification Service | http://localhost:3006 |
| MongoDB | localhost:27017 |

If port `8080` is busy, edit `.env`:

```env
FRONTEND_PORT=8081
```

Then restart:

```bash
docker compose down
docker compose up --build
```

---

## 7. Manual Local Development Without Docker

Use this only if you want to develop services individually.

Start MongoDB:

```bash
docker run -d --name flipkart-dev-mongo -p 27017:27017 mongo:7
```

Install dependencies and run each service in separate terminals:

```bash
cd /home/user/flipkart-clone/user-service
npm install
npm run dev
```

```bash
cd /home/user/flipkart-clone/product-service
npm install
npm run dev
```

```bash
cd /home/user/flipkart-clone/cart-service
npm install
npm run dev
```

```bash
cd /home/user/flipkart-clone/order-service
npm install
npm run dev
```

```bash
cd /home/user/flipkart-clone/payment-service
npm install
npm run dev
```

```bash
cd /home/user/flipkart-clone/notification-service
npm install
npm run dev
```

```bash
cd /home/user/flipkart-clone/api-gateway
npm install
npm run dev
```

Run frontend:

```bash
cd /home/user/flipkart-clone/frontend
npm install
npm start
```

Seed products locally:

```bash
cd /home/user/flipkart-clone/product-service
npm run seed
```

Manual development URLs:

```text
Frontend: http://localhost:3000 or http://localhost:3007 depending on React prompt
API Gateway: http://localhost:3000
```

Note: if React asks to use another port because API Gateway already uses `3000`, accept it.

---

## 8. Validate Code

Backend syntax check:

```bash
cd /home/user/flipkart-clone
./scripts/check-backend-syntax.sh
```

Frontend build check:

```bash
cd /home/user/flipkart-clone/frontend
npm install
npm run build
```

---

## 9. Troubleshooting

### Docker command not found

Install Docker Desktop or Docker Engine first.

### `docker compose` not found

Try:

```bash
docker-compose up --build
```

### Products not showing

Seed data:

```bash
docker compose exec product-service npm run seed
```

Then refresh frontend.

### Port already in use

Change ports in `.env`, for example:

```env
FRONTEND_PORT=8081
API_GATEWAY_PORT=3007
MONGODB_PORT=27018
```

Restart:

```bash
docker compose down
docker compose up --build
```

### Reset everything

This deletes MongoDB data too:

```bash
docker compose down -v
docker compose up --build
```

Then seed again:

```bash
docker compose exec product-service npm run seed
```

---

## 10. One-Shot Command Summary

```bash
cd /home/user/flipkart-clone
cp .env.example .env
docker compose up --build
```

Second terminal:

```bash
cd /home/user/flipkart-clone
docker compose exec product-service npm run seed
```

Open:

```text
http://localhost:8080
```
