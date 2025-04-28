@echo off
setlocal enabledelayedexpansion

:: Function to check if a command exists
:command_exists
    where %1 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        exit /b 0
    ) else (
        exit /b 1
    )

:: Function to start a service
:start_service
    set service_name=%~1
    set service_dir=%~2
    set start_command=%~3

    echo Starting %service_name%...
    cd %service_dir%
    if errorlevel 1 (
        echo Error: Could not change to directory %service_dir%
        exit /b 1
    )

    if not exist node_modules (
        echo Installing dependencies for %service_name%...
        call npm install
    )

    start "%~1" cmd /c "%start_command%"
    echo %service_name% started!
    exit /b 0

:: Check if Node.js is installed
call :command_exists node
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)

:: Check if npm is installed
call :command_exists npm
if errorlevel 1 (
    echo Error: npm is not installed. Please install npm.
    exit /b 1
)

:: Start Redis and PostgreSQL if they're not running
call :command_exists docker-compose
if errorlevel 1 (
    echo Warning: docker-compose not found. Make sure Redis and PostgreSQL are running.
) else (
    echo Starting database services...
    docker-compose up -d redis postgres
)

:: Start the bot
call :start_service "Bot" "bot" "npm run dev"

:: Start the web platform
call :start_service "Web Platform" "web" "npm run dev"

echo All services started! Press Ctrl+C to stop all services.

:: Wait for user input to stop services
pause >nul 