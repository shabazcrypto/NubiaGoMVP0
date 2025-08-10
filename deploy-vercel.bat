@echo off
echo ========================================
echo    HomeBase Vercel Deployment Script
echo ========================================
echo.

echo Checking prerequisites...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Vercel CLI not found!
    echo Please install Vercel CLI first:
    echo npm install -g vercel
    pause
    exit /b 1
)

echo Vercel CLI found ✓
echo.

echo Checking if logged in to Vercel...
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo Please login to Vercel first:
    echo vercel login
    pause
    exit /b 1
)

echo Logged in to Vercel ✓
echo.

echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo Build completed successfully ✓
echo.

echo Deploying to Vercel...
vercel --prod

echo.
echo Deployment completed!
echo.
pause
