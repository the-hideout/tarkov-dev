# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if(Get-Command $command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Function to start a service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServiceDir,
        [string]$StartCommand
    )

    Write-Host "Starting $ServiceName..." -ForegroundColor Green
    
    # Get the full path to the service directory
    $fullPath = Join-Path $PSScriptRoot $ServiceDir
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "Error: Directory $fullPath does not exist" -ForegroundColor Red
        return
    }
    
    Set-Location $fullPath
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies for $ServiceName..." -ForegroundColor Yellow
        npm install
    }

    # Start the service in a new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$fullPath'; $StartCommand"
    Write-Host "$ServiceName started!" -ForegroundColor Green
}

# Check if Node.js is installed
if (-not (Test-CommandExists "node")) {
    Write-Host "Error: Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Test-CommandExists "npm")) {
    Write-Host "Error: npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

# Run bot setup
Write-Host "Setting up bot..." -ForegroundColor Yellow
$botSetupPath = Join-Path $PSScriptRoot "bot\setup.ps1"
if (Test-Path $botSetupPath) {
    & $botSetupPath
} else {
    Write-Host "Warning: Bot setup script not found" -ForegroundColor Yellow
}

# Start Redis and PostgreSQL if they're not running
if (-not (Test-CommandExists "docker-compose")) {
    Write-Host "Warning: docker-compose not found. Make sure Redis and PostgreSQL are running." -ForegroundColor Yellow
} else {
    Write-Host "Starting database services..." -ForegroundColor Green
    docker-compose up -d redis postgres
}

# Install TypeScript types for tmi.js
Write-Host "Installing TypeScript types..." -ForegroundColor Yellow
npm install --save-dev @types/tmi.js

# Start the bot
Start-Service -ServiceName "Bot" -ServiceDir "bot" -StartCommand "npm run dev"

# Start the web platform
Start-Service -ServiceName "Web Platform" -ServiceDir "web" -StartCommand "npm run dev"

Write-Host "All services started! Press Ctrl+C to stop all services." -ForegroundColor Green

# Wait for user input to stop services
Write-Host "Press any key to stop all services..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 