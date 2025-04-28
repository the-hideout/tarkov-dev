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

# Get the script's directory
$scriptDir = $PSScriptRoot

# Change to the bot directory
Set-Location $scriptDir

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Install TypeScript types
Write-Host "Installing TypeScript types..." -ForegroundColor Yellow
npm install --save-dev @types/tmi.js @types/node typescript ts-node nodemon

# Create tsconfig.json if it doesn't exist
if (-not (Test-Path "tsconfig.json")) {
    Write-Host "Creating tsconfig.json..." -ForegroundColor Yellow
    @"
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
"@ | Out-File -FilePath "tsconfig.json" -Encoding utf8
}

Write-Host "Setup complete! You can now run the bot using 'npm run dev'" -ForegroundColor Green 