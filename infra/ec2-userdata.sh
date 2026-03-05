#!/usr/bin/env bash
set -euo pipefail

# EC2 user-data script (Ubuntu/Debian)
# - Installs Docker + Compose plugin
# - Creates a deploy directory

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y ca-certificates curl git

# Install Docker (official convenience script)
curl -fsSL https://get.docker.com | sh

# Allow the default user to run docker without sudo (optional)
if id -u ubuntu >/dev/null 2>&1; then
  usermod -aG docker ubuntu || true
fi

mkdir -p /opt/communityassist
