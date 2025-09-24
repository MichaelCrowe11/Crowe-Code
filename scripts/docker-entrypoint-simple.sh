#!/bin/sh

# Simple Docker entrypoint without migrations
echo "Starting CroweCode Platform..."

# Start the Next.js standalone server
echo "Starting Next.js server on port 3000..."
cd /app
exec node server.js