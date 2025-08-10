# Vercel Deployment Guide for HomeBase

This guide provides step-by-step instructions for deploying your HomeBase e-commerce project to Vercel for full Next.js hosting.

## 🚀 Quick Start

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Production
```bash
npm run vercel:deploy
```

## 📋 Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Node.js 18.x or higher](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Vercel CLI](https://vercel.com/docs/cli)

## 🔧 Environment Setup

### 1. Create Environment Variables
Create a `.env.local` file in your project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

# Database Configuration
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com

# Analytics
PLAUSIBLE_DOMAIN=yourdomain.com
SENTRY_DSN=your_sentry_dsn

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
```

### 2. Set Environment Variables in Vercel
```bash
# Pull existing environment variables
npm run vercel:env:pull

# Push local environment variables
npm run vercel:env:push
```

Or set them manually in the Vercel dashboard:
1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate values

## 🚀 Deployment Commands

### Production Deployment
```bash
npm run vercel:deploy
```

### Preview Deployment
```bash
npm run vercel:deploy:preview
```

### Local Development with Vercel
```bash
npm run vercel:dev
```

### View Deployment Logs
```bash
npm run vercel:logs
```

## ⚙️ Configuration Files

### vercel.json
The project includes a pre-configured `vercel.json` file optimized for:
- Next.js 14+ framework
- API routes with Node.js 18.x runtime
- Optimized caching headers
- Proper routing configuration

### next.config.js
Updated to remove static export settings and enable:
- Vercel's image optimization
- PWA support
- Performance optimizations
- Mobile-first responsive design

## 🔍 Post-Deployment Verification

### 1. Check Build Status
- Monitor the build process in Vercel dashboard
- Verify all environment variables are loaded
- Check for any build errors or warnings

### 2. Test Core Functionality
- [ ] Homepage loads correctly
- [ ] Authentication works (login/register)
- [ ] Product browsing and search
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] API endpoints respond correctly

### 3. Performance Testing
- [ ] Lighthouse performance score
- [ ] Core Web Vitals
- [ ] Mobile responsiveness
- [ ] Image optimization

### 4. Security Verification
- [ ] HTTPS enforcement
- [ ] Security headers
- [ ] API rate limiting
- [ ] Authentication flows

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
npm run vercel:logs

# Verify environment variables
vercel env ls

# Test build locally
npm run build
```

#### Environment Variable Issues
```bash
# Pull environment variables
npm run vercel:env:pull

# Verify .env.local exists
cat .env.local

# Check Vercel dashboard settings
```

#### API Route Issues
- Verify API routes are in `src/app/api/`
- Check runtime configuration in `vercel.json`
- Ensure proper error handling in API routes

#### Image Optimization Issues
- Verify `next.config.js` image settings
- Check remote patterns for external images
- Ensure proper image formats are supported

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
ANALYZE=true npm run build
```

#### Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Optimize image formats (WebP, AVIF)

#### Caching Strategy
- Static assets: 1 year
- API responses: No cache
- Images: 30 days

## 🔄 Continuous Deployment

### GitHub Integration
1. Connect your GitHub repository to Vercel
2. Enable automatic deployments on push
3. Configure preview deployments for pull requests

### Branch Deployment Strategy
- `main` → Production
- `develop` → Preview
- Feature branches → Preview (optional)

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real-time analytics
- Core Web Vitals tracking

### External Services
- Sentry for error tracking
- Plausible for privacy-focused analytics
- Custom performance monitoring

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to Git
- Use Vercel's encrypted environment variables
- Rotate sensitive keys regularly

### API Security
- Implement rate limiting
- Validate all inputs
- Use proper authentication middleware

### Content Security Policy
- Configure CSP headers
- Sanitize user inputs
- Implement XSS protection

## 📱 Mobile Optimization

### PWA Features
- Service worker implementation
- Offline functionality
- App-like experience

### Performance
- Optimized for slow networks
- Mobile-first responsive design
- Touch-friendly interactions

## 🌍 Global CDN

### Vercel Edge Network
- Automatic global distribution
- Edge caching optimization
- Geographic routing

### Custom Domains
1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Enable HTTPS enforcement

## 📈 Scaling Considerations

### Serverless Functions
- API routes automatically scale
- Cold start optimization
- Memory and timeout limits

### Database Scaling
- Consider connection pooling
- Implement caching strategies
- Monitor query performance

### Image Optimization
- Vercel handles image processing
- Automatic format optimization
- Responsive image generation

## 🎯 Best Practices

### Development Workflow
1. Develop locally with `npm run dev`
2. Test with `npm run vercel:dev`
3. Deploy preview with `npm run vercel:deploy:preview`
4. Deploy production with `npm run vercel:deploy`

### Code Quality
- Run tests before deployment
- Use TypeScript for type safety
- Implement proper error boundaries

### Performance
- Optimize bundle size
- Implement lazy loading
- Use Next.js built-in optimizations

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Community](https://github.com/vercel/next.js/discussions)

## 🔄 Migration from Firebase Hosting

### What Changes
- ✅ Full Next.js server-side rendering
- ✅ API routes with serverless functions
- ✅ Enhanced image optimization
- ✅ Better performance monitoring
- ✅ Global CDN distribution

### What Stays the Same
- Firebase Authentication
- Firestore Database
- Firebase Storage
- PWA functionality
- Mobile optimization

---

**Ready to deploy?** Run `npm run vercel:deploy` to get started!
