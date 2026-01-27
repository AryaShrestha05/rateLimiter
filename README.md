# Distributed Rate Limiter

A rate limiter built from scratch to demonstrate distributed systems: load balancing, shared state, and horizontal scaling.

## Why I built this?

A naive rate limiter stores request counts in memory. That works until you scale to multiple servers. Each server has its own count, so a client can hit server A five times, then server B five times, bypassing your limit entirely.

This project solves that problem with Redis as a shared store and Nginx as a load balancer.

## Architecture

```
Client
   │
   ▼
Nginx (load balancer)
   │
   ├──────────┼──────────┐
   ▼          ▼          ▼
Node.js    Node.js    Node.js
   │          │          │
   └──────────┼──────────┘
              ▼
           Redis
```

- **Nginx** distributes incoming requests across three Node.js instances using round-robin
- **Redis** stores request counts, shared across all instances
- **Node.js** servers are stateless—any server can handle any request

## Rate Limiting Algorithm

Token bucket algorithm:

1. Each user has a bucket with maximum 5 tokens
2. Each request consumes 1 token
3. Tokens refill at 1 token per 2 seconds
4. No tokens = request blocked

```
Bucket: [●●●●●] 5 tokens

Request 1: [●●●●○] 4 tokens remaining ✓
Request 2: [●●●○○] 3 tokens remaining ✓
Request 3: [●●○○○] 2 tokens remaining ✓
Request 4: [●○○○○] 1 token remaining  ✓
Request 5: [○○○○○] 0 tokens remaining ✓
Request 6: [○○○○○] blocked            ✗

...2 seconds later...

Refill:    [●○○○○] 1 token added
Request 7: [○○○○○] 0 tokens remaining ✓
```

Why token bucket over fixed window:

- Allows controlled bursts (use all 5 tokens at once if needed)
- Smooths traffic over time
- No boundary exploit (fixed window allows 10 requests in 1 second if timed at window edge)

## Running with Docker

The easiest way to run everything:

```bash
docker-compose up --build
```

Open http://localhost:3000

To stop:

```bash
docker-compose down
```

## Running locally (without Docker)

### Prerequisites

- Node.js 18+
- Redis
- Nginx

### Start services

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend servers
cd backend
npm install
PORT=3001 node index.js &
PORT=3002 node index.js &
PORT=3003 node index.js

# Terminal 3: Nginx
nginx -c $(pwd)/nginx.conf

# Terminal 4: Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Test via CLI

```bash
# Single request through load balancer
curl http://localhost:8080/api/hello

# Spam 8 requests (5 allowed, 3 blocked)
for i in {1..8}; do curl -s http://localhost:8080/api/hello | jq -r '.message // .error'; done
```

## Project structure

```
├── backend/
│   ├── index.js          # Express server with rate limiting logic
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── App.jsx       # React demo UI
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf        # Load balancer config for Docker
├── docker-compose.yml
└── nginx.conf            # Load balancer config for local dev
```

## Tech stack

- **Backend:** Node.js, Express, ioredis
- **Frontend:** React, Vite
- **Infrastructure:** Nginx, Redis, Docker
