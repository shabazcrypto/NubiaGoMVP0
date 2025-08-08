# Firebase Setup Guide for Nubiago

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root with the following content:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBOkKPN3viR75p4BLuXrmqR_4zlc0X_qL0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nubiago-aa411.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nubiago-aa411
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nubiago-aa411.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=618017989773
NEXT_PUBLIC_FIREBASE_APP_ID=1:618017989773:web:2b1d1c14c2b9e086b52ec4

# Firebase Admin Configuration (Get from Firebase Console)
FIREBASE_PROJECT_ID=nubiago-aa411
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_STORAGE_BUCKET=nubiago-aa411.firebasestorage.app

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nubiago
```

### 2. Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nubiago-aa411`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file
6. Extract these values:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `project_id` → `FIREBASE_PROJECT_ID`

### 3. Test Firebase Configuration

Visit `/test-firebase` in your app to verify the configuration is working.

## 🔧 Firebase CLI Commands

### Installation
```bash
npm install -g firebase-tools
```

### Login
```bash
firebase login
```

### Project Management
```bash
# List projects
firebase projects:list

# Switch project
firebase use nubiago-aa411

# Initialize project (if needed)
firebase init
```

### Deployment Commands

```bash
# Deploy everything
npm run deploy:all

# Deploy only hosting
npm run deploy:hosting

# Deploy only Firestore rules and indexes
npm run deploy:firestore

# Deploy only Storage rules
npm run deploy:storage

# Deploy everything manually
firebase deploy
```

## 📁 Project Structure

```
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project selection
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules         # Storage security rules
├── deploy.sh             # Linux/Mac deployment script
├── deploy.bat            # Windows deployment script
└── src/
    └── lib/
        └── firebase/
            ├── config.ts  # Client-side Firebase config
            └── admin.ts   # Server-side Firebase config
```

## 🔐 Security Rules

### Firestore Rules
- Users can read/write their own data
- Products are publicly readable
- Suppliers and admins can write products
- Orders are user-specific
- Admin-only collections

### Storage Rules
- User profile images: user-specific access
- Product images: public read, supplier/admin write
- Order attachments: user-specific access
- General uploads: authenticated users

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm run deploy:all
```

## 📊 Firebase Services

### Authentication
- Email/password authentication
- Google OAuth (configurable)
- Password reset functionality
- User profile management

### Firestore Database
- Products collection
- Users collection
- Orders collection
- Carts collection
- Wishlists collection
- Reviews collection
- Categories collection

### Storage
- Product images
- User profile pictures
- Order attachments
- General file uploads

## 🔍 Monitoring & Analytics

### Firebase Console
- [Project Overview](https://console.firebase.google.com/project/nubiago-aa411/overview)
- [Authentication](https://console.firebase.google.com/project/nubiago-aa411/authentication)
- [Firestore Database](https://console.firebase.google.com/project/nubiago-aa411/firestore)
- [Storage](https://console.firebase.google.com/project/nubiago-aa411/storage)
- [Hosting](https://console.firebase.google.com/project/nubiago-aa411/hosting)

## 🛠️ Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check environment variables
   - Verify Firebase project ID
   - Test with `/test-firebase`

2. **Deployment fails**
   - Check Firebase CLI login
   - Verify project permissions
   - Check build errors

3. **Security rules errors**
   - Test rules in Firebase Console
   - Check syntax in rules files
   - Verify user authentication

### Debug Commands

```bash
# Check Firebase CLI version
firebase --version

# Check current project
firebase use

# Test rules locally
firebase emulators:start

# View deployment logs
firebase deploy --debug
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js with Firebase](https://nextjs.org/docs/deployment#firebase-hosting)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)

## 🎯 Next Steps

1. ✅ Set up environment variables
2. ✅ Get admin SDK credentials
3. ✅ Test Firebase configuration
4. ✅ Deploy security rules
5. 🔄 Set up authentication providers
6. 🔄 Configure custom claims for roles
7. 🔄 Set up Firebase Analytics
8. 🔄 Configure Firebase Functions (if needed) 