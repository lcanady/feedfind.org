# Firebase & Google OAuth Setup Guide

This guide will help you set up Firebase authentication with both email/password and Google OAuth for FeedFind.org.

## 🔥 Firebase Project Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `feedfind-org` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended: Yes)
5. Complete the project creation

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Enable this
   - **Google**: Enable this (follow Google OAuth setup below)

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app icon (`</>`)
4. Enter app nickname: `feedfind-web`
5. Choose "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase config object

## 🔐 Google OAuth Setup

### 1. Enable Google Sign-In in Firebase

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Toggle "Enable"
4. Enter your project's support email
5. Click "Save"

### 2. Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose "External" user type (unless you have a Google Workspace)
5. Fill out the required fields:
   - **App name**: FeedFind.org
   - **User support email**: Your email
   - **App domain**: Your domain (e.g., feedfind.org)
   - **Developer contact**: Your email
6. Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`
7. Save and continue

### 3. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: `feedfind-web-client`
5. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `http://localhost:3002` (for development)
   - `https://your-domain.com` (for production)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/__/auth/handler` (for development)
   - `https://your-domain.com/__/auth/handler` (for production)
7. Click "Create"
8. Copy the Client ID (you'll need this)

## 🌍 Environment Configuration

### 1. Create Environment File

Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google AdSense (optional)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-your-actual-client-id

# Environment
NODE_ENV=production
```

### 2. Get Your Firebase Values

From your Firebase project settings, copy these values:

- **API Key**: Found in Firebase config
- **Auth Domain**: `your-project-id.firebaseapp.com`
- **Project ID**: Your Firebase project ID
- **Storage Bucket**: `your-project-id.appspot.com`
- **Messaging Sender ID**: Found in Firebase config
- **App ID**: Found in Firebase config

## 🚀 Testing Authentication

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Authentication Flow

1. **Visit the app**: Go to `http://localhost:3000`
2. **Register with email**: Click "register" and create an account
3. **Login with email**: Use your credentials to sign in
4. **Test Google OAuth**: Click "Sign in with Google" button
5. **Visit protected page**: Go to `/test-auth` to see user details
6. **Test logout**: Use the logout button

### 3. Verify in Firebase Console

1. Go to **Authentication** → **Users**
2. You should see your registered users
3. Check that both email and Google sign-in methods work

## 🔒 Security Configuration

### 1. Firestore Security Rules

Create these security rules in **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public locations (read-only)
    match /locations/{locationId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Providers can manage their locations
    match /providers/{providerId} {
      allow read, write: if request.auth != null && request.auth.uid == providerId;
    }
  }
}
```

### 2. Firebase Auth Security

1. **Email Enumeration Protection**: Enable in Authentication settings
2. **Authorized Domains**: Add your production domain
3. **Password Policy**: Set minimum requirements if needed

## 🌐 Production Deployment

### 1. Environment Variables

Set these environment variables in your hosting platform (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-production-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NODE_ENV=production
```

### 2. Update OAuth Settings

1. Add your production domain to **Authorized JavaScript origins**
2. Add your production redirect URI to **Authorized redirect URIs**
3. Update Firebase **Authorized domains** in Authentication settings

### 3. Deploy and Test

1. Deploy your application
2. Test both email and Google authentication on production
3. Verify redirect URIs work correctly
4. Check Firebase Console for successful authentication events

## 🛠️ Troubleshooting

### Common Issues

1. **Google OAuth Error**: Check authorized origins and redirect URIs
2. **Firebase Config Error**: Verify all environment variables are set
3. **CORS Issues**: Ensure your domain is in Firebase authorized domains
4. **Redirect URI Mismatch**: Check that redirect URIs match exactly

### Debug Steps

1. Check browser console for detailed error messages
2. Verify Firebase config in Network tab
3. Test authentication with Firebase emulator first
4. Check Firebase Console for authentication events

## 📝 Next Steps

After setting up authentication:

1. **User Profiles**: Create user profile management
2. **Role-Based Access**: Implement provider and admin roles
3. **Email Verification**: Enable email verification for new users
4. **Password Reset**: The reset functionality is already implemented
5. **Social Logins**: Add more providers (Facebook, Apple, etc.)

## 🎯 Features Now Available

✅ **Email/Password Authentication**
✅ **Google OAuth Sign-in**
✅ **Protected Routes**
✅ **User State Management**
✅ **Password Reset**
✅ **Automatic Redirects**
✅ **Mobile-Responsive UI**
✅ **Accessibility Compliant**

Your FeedFind.org platform now has complete authentication ready for production use! 