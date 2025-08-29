@echo off
setlocal enabledelayedexpansion

echo ============================================
echo NubiaGo Deployment Script
echo ============================================

:check_node
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:check_firebase
firebase --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Firebase CLI is not installed or not in PATH
    echo Please install Firebase CLI using: npm install -g firebase-tools
    pause
    exit /b 1
)

:check_env
if not exist ".env" (
    echo [WARNING] .env file not found
    if exist ".env.example" (
        echo Creating .env from .env.example
        copy /Y .env.example .env
        echo Please edit the .env file with your configuration
        pause
    ) else (
        echo [ERROR] .env.example not found. Please create a .env file manually
        pause
        exit /b 1
    )
)

:install_deps
echo.
echo ============================================
echo Installing Dependencies
echo ============================================
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

:run_tests
echo.
echo ============================================
echo Running Tests
echo ============================================
call npm run test:ci
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Some tests failed. Continue with deployment? (Y/N)
    set /p TEST_CONTINUE=
    if /i not "!TEST_CONTINUE!"=="Y" (
        echo Deployment cancelled by user
        pause
        exit /b 1
    )
)

:build
echo.
echo ============================================
echo Building Application
echo ============================================
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

:deploy
echo.
echo ============================================
echo Deploying to Firebase
echo ============================================
call firebase login
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Firebase login failed
    pause
    exit /b 1
)

call firebase deploy
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Firebase deployment failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo Deployment Completed Successfully!
echo ============================================
pause