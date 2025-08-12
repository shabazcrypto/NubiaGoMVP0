# 🚀 HomeBase Vercel Deployment Guide

This guide will help you deploy your HomeBase ecommerce application to Vercel successfully.

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed
- [Vercel CLI](https://vercel.com/cli) installed
- A Vercel account

## 🔧 Initial Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Your Project
```bash
vercel link
```

## 🌍 Environment Variables Setup

### 1. Copy Environment Template
```bash
cp env.vercel.template .env.local
```

### 2. Fill in Required Values
Edit `.env.local` and add your actual values:

**Firebase Configuration (REQUIRED):**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Security Keys (REQUIRED):**
```bash
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here
CSRF_SECRET=your-super-secure-csrf-secret-key-here
```

### 3. Push Environment Variables to Vercel
```bash
npm run vercel:env:push
```

## 🏗️ Build and Deploy

### Option 1: Using Deployment Scripts

**Windows:**
```bash
deploy-vercel.bat
```

**Unix/Linux/macOS:**
```bash
./deploy-vercel.sh
```

### Option 2: Manual Deployment

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Build the Project
```bash
npm run build
```

#### 3. Deploy to Vercel
```bash
npm run vercel:deploy
```

## 🔍 Troubleshooting Common Issues

### Issue: "Initializing..." Message Stuck
**Cause:** Missing environment variables or Firebase configuration
**Solution:** 
1. Check Vercel dashboard → Environment Variables
2. Ensure all Firebase variables are set
3. Redeploy after fixing variables

### Issue: Build Fails
**Cause:** Complex webpack configuration or missing dependencies
**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure Node.js version is 18+
3. Clear `.next` folder and rebuild

### Issue: API Routes Not Working
**Cause:** Missing server-side environment variables
**Solution:**
1. Check `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
2. Ensure these are set in Vercel (not just locally)

### Issue: Images Not Loading
**Cause:** Image optimization configuration
**Solution:**
1. Check `next.config.js` image settings
2. Ensure Firebase Storage bucket is configured
3. Verify CORS settings

## 📱 Post-Deployment Verification

### 1. Check Build Status
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Select your `home-base-one` project
- Verify build completed successfully

### 2. Test Core Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Authentication flows work
- [ ] Product browsing functional
- [ ] Shopping cart works
- [ ] API endpoints respond

### 3. Performance Testing
- [ ] Page load times acceptable
- [ ] Images optimize correctly
- [ ] Mobile responsiveness good
- [ ] Core Web Vitals pass

## 🔒 Security Checklist

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured

## 📊 Monitoring and Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real-time metrics
- Error tracking

### Firebase Analytics
- User behavior tracking
- Performance monitoring
- Crash reporting

## 🚨 Emergency Rollback

If deployment causes issues:

```bash
# Revert to previous deployment
vercel rollback

# Or deploy specific version
vercel --prod --force
```

## 📞 Support

If you encounter issues:

1. Check Vercel build logs
2. Review environment variables
3. Test locally with `npm run dev`
4. Check Firebase console for errors
5. Contact support with error logs

## 🔄 Continuous Deployment

For automatic deployments:

1. Connect your GitHub repository to Vercel
2. Enable automatic deployments on push
3. Set up preview deployments for pull requests

---

**Happy Deploying! 🎉**

Your HomeBase app should now be live at: https://home-base-one.vercel.app
