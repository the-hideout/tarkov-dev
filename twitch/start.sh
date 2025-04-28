#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local start_command=$3

    echo "Starting $service_name..."
    cd "$service_dir" || exit 1
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for $service_name..."
        npm install
    fi

    # Start the service in the background
    $start_command &
    echo "$service_name started!"
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "Error: Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "Error: npm is not installed. Please install npm."
    exit 1
fi

# Start Redis and PostgreSQL if they're not running
if ! command_exists docker-compose; then
    echo "Warning: docker-compose not found. Make sure Redis and PostgreSQL are running."
else
    echo "Starting database services..."
    docker-compose up -d redis postgres
fi

# Start the bot
start_service "Bot" "bot" "npm run dev"

# Start the web platform
start_service "Web Platform" "web" "npm run dev"

echo "All services started! Press Ctrl+C to stop all services."

# Wait for user input to stop services
trap 'kill $(jobs -p); echo "Stopping all services..."; exit 0' INT
wait 