# Architecture Notes

## Request Flow

```text
Browser / React
   ↓ /api/*
Nginx frontend proxy (Docker)
   ↓
API Gateway (Express)
   ↓ path rewrite + JWT guard
Microservice APIs
   ↓
MongoDB databases/collections
```

## Service Ownership

- **User Service:** user credentials, profile data and addresses.
- **Product Service:** catalog, inventory snapshots, categories, reviews and search.
- **Cart Service:** user cart with denormalized product name/price/image.
- **Order Service:** immutable order items, shipping address and status lifecycle.
- **Payment Service:** payment transaction record and order payment status callback.
- **Notification Service:** in-app notifications and optional SMTP email.

## API Path Normalization

The API Gateway exposes clean public URLs:

```text
/api/products/:id  -> product-service /:id
/api/cart/:userId  -> cart-service /:userId
/api/orders        -> order-service /
```

This avoids awkward routes like `/api/products/products` while still keeping each microservice independently runnable.

## Production Hardening Checklist

- Put backend services in private subnets.
- Expose only frontend/API gateway through ALB.
- Use AWS Secrets Manager for JWT, SMTP and payment keys.
- Replace simulated payments with Razorpay/Stripe production integration.
- Add service-to-service auth or mTLS.
- Add centralized logging, tracing and metrics.
- Add inventory reservation logic for high-concurrency checkout.
