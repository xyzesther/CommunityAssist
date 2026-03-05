## AWS EC2 deployment (Docker Compose)

This repo is set up to deploy on a single EC2 instance using Docker Compose.

### Recommended HTTPS option (AWS ACM + ALB)

The simplest/most “AWS-native” TLS setup is:

- **ACM** issues the certificate
- **Application Load Balancer (ALB)** terminates HTTPS (port 443)
- ALB forwards traffic to EC2 **port 80**
- Your EC2 instance runs `docker compose` and exposes only port 80

This avoids managing Certbot renewals on the instance.

### Instance setup (Ubuntu/Debian-like)

- Install Docker + Compose
- Open inbound security group rules:
  - **80** (HTTP) from the internet (or only from ALB security group)
  - **443** (HTTPS) if you terminate TLS on the instance (optional)

### App deploy on the instance

1. Clone the repo (example path):

   - `/opt/communityassist`

2. Create a `.env` on the instance based on `.env.example` and set real values.

3. Start services:

   - `docker compose -f infra/docker-compose.prod.yml --env-file .env up -d --build`

4. Verify:

   - Frontend: `http://<EC2_PUBLIC_IP>/`
   - API health: `http://<EC2_PUBLIC_IP>/api/health`
   - Cache metrics: `http://<EC2_PUBLIC_IP>/api/metrics/cache`

### Logs

- View logs:
  - `docker compose -f infra/docker-compose.prod.yml logs -f --tail=200`

### Alternative HTTPS option (Certbot on-instance)

If you do not use an ALB:

- Install Nginx on the EC2 host and use Certbot to manage TLS
- Proxy `/:80` to the Docker `web` container

This is totally workable, but requires renewal automation and careful Nginx config.
