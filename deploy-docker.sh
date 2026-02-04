#!/bin/bash

echo "🚀 Deploying Barde Lingo with Docker..."

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Build Docker image
echo "🔨 Building Docker image..."
docker-compose -f docker-compose.production.yml build --no-cache

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose -f docker-compose.production.yml up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 5

# Run migrations
echo "🗄️  Running migrations..."
docker-compose -f docker-compose.production.yml exec -T app php artisan migrate --force

# Cache optimization
echo "⚡ Optimizing cache..."
docker-compose -f docker-compose.production.yml exec -T app php artisan config:cache
docker-compose -f docker-compose.production.yml exec -T app php artisan route:cache
docker-compose -f docker-compose.production.yml exec -T app php artisan view:cache
docker-compose -f docker-compose.production.yml exec -T app php artisan event:cache

# Clean up old images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment complete!"
echo "📊 Container status:"
docker-compose -f docker-compose.production.yml ps
