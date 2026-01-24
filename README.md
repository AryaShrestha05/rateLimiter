# Distributed Rate Limiter

A distributed rate limiting service built from scratch to learn distributed systems concepts.

## What Is This?

A rate limiter controls how many requests a user can make to an API within a time window. This project implements a **fixed window** rate limiting algorithm, with plans to evolve into a fully distributed system.

## Architecture

```
Current (Phase 1):
┌─────────────────┐
│     Client      │
└────────┬────────┘
         │
┌────────▼────────┐
│  Rate Limiter   │
│   (single)      │
└────────┬────────┘
         │
┌────────▼────────┐
│   In-Memory     │
│    Storage      │
└─────────────────┘

Coming Soon (Phase 2+):
┌─────────────────┐
│     Client      │
└────────┬────────┘
         │
┌────────▼────────┐
│  Load Balancer  │
└────────┬────────┘
         │
   ┌─────┴─────┐
   │     │     │
┌──▼──┐┌──▼──┐┌──▼──┐
│ RL1 ││ RL2 ││ RL3 │
└──┬──┘└──┬──┘└──┬──┘
   │     │     │
   └─────┼─────┘
         │
  ┌──────▼──────┐
  │    Redis    │
  └─────────────┘
```

## How It Works

**Fixed Window Algorithm:**
- Divide time into fixed windows (e.g., 10 seconds)
- Count requests per user per window
- Block if count exceeds limit
- Reset count when new window starts

```
Window 1 (0-10s)         Window 2 (10-20s)
├───────────────────────┼───────────────────────┤
 Req1 Req2 Req3 Req4 Req5  Req1 Req2 ...
  ✓    ✓    ✓    ✓    ✓     ✓    ✓   (reset!)
                     Req6
                      ✗ (blocked)
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/yourusername/rateLimiter.git
cd rateLimiter
npm install
```

### Run the Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

### Test It

```bash
# Single request
curl http://localhost:3000/api/hello

# Spam requests (should block after 5)
for i in 1 2 3 4 5 6 7 8; do curl http://localhost:3000/api/hello; echo ""; done
```

**Expected output:**
```
{"message":"Success! Request allowed."}  # Requests 1-5
{"message":"Success! Request allowed."}
{"message":"Success! Request allowed."}
{"message":"Success! Request allowed."}
{"message":"Success! Request allowed."}
{"error":"Too many requests"...}         # Requests 6+
{"error":"Too many requests"...}
{"error":"Too many requests"...}
```

## Configuration

Edit `index.js`:

```javascript
const LIMIT = 5;               // Max requests per window
const WINDOW_SIZE_MS = 10000;  // Window size (10 seconds)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hello` | GET | Rate-limited test endpoint |
| `/health` | GET | Health check (not rate-limited) |

## Response Headers

Every response includes rate limit info:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1705934567
```

## Project Roadmap

- [x] Phase 1: Single server, in-memory storage
- [ ] Phase 2: Add Redis for distributed state
- [ ] Phase 3: Multiple instances + load balancer
- [ ] Phase 4: Dockerize
- [ ] Phase 5: Deploy to Kubernetes
- [ ] Phase 6: Add monitoring (Prometheus/Grafana)

## Tech Stack

**Current:**
- Node.js
- Express 5

**Coming:**
- Redis
- Docker
- Kubernetes
- Nginx

## What I Learned

- Rate limiting algorithms (fixed window, sliding window, token bucket)
- Why distributed state is hard
- How `Math.floor(time / windowSize)` creates time windows
- Trade-offs between consistency and availability

## License

MIT
