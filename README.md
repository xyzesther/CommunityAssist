## Community Assistance Platform

A cloud-native, containerized full-stack platform that connects community volunteers with individuals requesting assistance.
It supports request management and appointment scheduling with a scalable backend foundation (PostgreSQL + Redis).

### Architecture

This project is a **containerized “modular monolith”** deployed with Docker Compose:

- **`web`**: Nginx serving the React build + reverse-proxying `/api/*` to the Node API
- **`api`**: Node.js + Express + Prisma API
- **`postgres`**: PostgreSQL database
- **`redis`**: Redis cache layer for hot reads

### Tech stack

- **Frontend**: React (CRA), Auth0
- **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL, Redis
- **Infra**: Docker, Docker Compose, Nginx
- **Automation**: GitHub Actions (CI + deploy)
- **Cloud**: AWS EC2 deployment path (docs included)

### Key features

- **User management**: Auth0-protected routes + user verification/registration in Postgres
- **Request management**: create/update/delete + lifecycle \(OPEN → IN_PROGRESS → COMPLETED\)
- **Appointment scheduling**: one active appointment per request; request status updates on appointment actions
- **Redis caching**: caches high-frequency read endpoints with TTL + invalidation on writes
- **Health + metrics**: `/health` and `/metrics/cache` on the API

### API overview

- **Health**
  - `GET /health`
  - `GET /metrics/cache`
- **Auth**
  - `POST /verify-user`
- **User**
  - `GET /user`
  - `PUT /user`
- **Requests**
  - `POST /requests`
  - `GET /requests` *(cached)*
  - `GET /requests/user`
  - `GET /requests/:id` *(cached)*
  - `PUT /requests/:id`
  - `DELETE /requests/:id`
- **Appointments**
  - `POST /appointments`
  - `GET /appointments`
  - `GET /appointments/user`
  - `GET /appointments/:id`
  - `PUT /appointments/:id`
  - `DELETE /appointments/:id`

### Redis caching strategy

The API caches:

- `GET /requests` → key `requests:all:v1` \(TTL: 60s\)
- `GET /requests/:id` → key `requests:<id>:v1` \(TTL: 60s\)

Writes invalidate cache keys (requests + appointment actions that affect request status).
Responses include **`X-Cache: HIT|MISS`** and `/metrics/cache` exposes hits/misses/invalidations + hit rate.

### Run locally (Docker)

Prerequisites:

- Docker Desktop (Docker daemon must be running)

Setup:

- Copy env file:
  - `cp .env.example .env`
  - Fill in Auth0 values if you want to use protected endpoints in the UI

Start:

- `docker compose up --build`

Open:

- **Frontend**: `http://localhost:3000`
- **API (direct)**: `http://localhost:8080`
- **API (via Nginx)**: `http://localhost:3000/api`

### AWS deployment

See `infra/aws-ec2.md` for an EC2 + Docker Compose deployment path and HTTPS options (recommended: **ACM + ALB**).

### CI/CD

GitHub Actions workflows:

- **CI**: `.github/workflows/ci.yml` (client tests, API checks, Docker builds)
- **Deploy**: `.github/workflows/deploy.yml` (SSH to EC2, `docker compose up -d --build`)

### Project structure

- `api/`: Express + Prisma API
- `client/`: React app
- `infra/`: Nginx config + prod compose + AWS deployment docs
- `.github/workflows/`: CI/CD workflows