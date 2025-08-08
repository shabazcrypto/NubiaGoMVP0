# 🔥 Firebase Authentication Setup Guide

## **CRITICAL: Manual Steps Required in Firebase Console**

### **🚨 STEP 1: Enable Email/Password Authentication**

1. **Go to Firebase Console**: https://console.firebase.google.com/project/nubiago-aa411/authentication/providers
2. **Click on "Email/Password"**
3. **Toggle "Enable" to ON**
4. **Click "Save"**

### **🚨 STEP 2: Enable Google Authentication**

1. **In the same providers page, click on "Google"**
2. **Toggle "Enable" to ON**
3. **Project support email**: Select your email from dropdown
4. **Click "Save"**

### **🚨 STEP 3: Enable Facebook Authentication (Optional)**

1. **Click on "Facebook"**
2. **Toggle "Enable" to ON**
3. **You'll need Facebook App ID and App Secret**
   - Go to: https://developers.facebook.com/
   - Create a new app or use existing one
   - Get App ID and App Secret from app settings
4. **Enter Facebook App ID and App Secret**
5. **Copy the OAuth redirect URI** (will be shown)
6. **Add this redirect URI to your Facebook app settings**
7. **Click "Save"**

### **🚨 STEP 4: Configure Authorized Domains**

1. **Go to Authentication > Settings tab**
2. **In "Authorized domains" section, add:**
   - `nubiago-aa411.web.app`
   - `localhost` (for development)
   - Any custom domains you use

## **✅ Verification Steps**

After enabling providers:

1. **Check Authentication > Users tab** - should be accessible
2. **Check Authentication > Sign-in method tab** - should show enabled providers
3. **Test the authentication** - try signing up with email

## **🔧 Next Steps**

Once providers are enabled in console:
- Email/Password authentication will work immediately
- Google OAuth will work immediately  
- Facebook OAuth will work after configuring App ID/Secret

## **🎯 Expected Result**

After completing these steps:
- ✅ Email registration/login will work
- ✅ Google sign-in will work
- ✅ Facebook sign-in will work (if configured)
- ✅ Authentication errors will be resolved

**⚠️ IMPORTANT: These steps MUST be done manually in Firebase Console. They cannot be automated via CLI or code.**
