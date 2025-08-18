#!/bin/bash
# Start the Interactive Portfolio Website
# This script properly starts the Express server with Vite development mode

export PORT=${PORT:-5000}
echo "Starting Interactive Portfolio Website on port $PORT..."
tsx server/index.ts