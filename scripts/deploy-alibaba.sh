#!/bin/bash

# ==============================================================================
# SeekFactory 1-Click Alibaba Cloud Deployment Script (Ubuntu / Alibaba Cloud Linux)
# Run on server: bash scripts/deploy-alibaba.sh
# ==============================================================================

set -e

echo "🚀 Starting SeekFactory Alibaba Cloud Deployment..."

# 1. Update packages & install Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker & Nginx..."
    sudo apt update
    sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx
    sudo systemctl enable --now docker
fi

# 2. Build Docker Container
echo "🛠️ Building Next.js Production Docker Image..."
docker build -t seekfactory-few:latest .

# 3. Stop old container if running
echo "🔄 Restarting Container..."
docker stop seekfactory-app || true
docker rm seekfactory-app || true

# 4. Run new container on port 3000
docker run -d \
  --name seekfactory-app \
  --restart always \
  -p 3000:3000 \
  seekfactory-few:latest

echo "✅ Container is running on http://localhost:3000"
echo "🌐 Make sure your domain A Record points to this server IP!"
