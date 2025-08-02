# Firebase Authentication Setup Guide

Your app now requires users to create accounts and sign in. Follow these steps to enable email/password authentication in Firebase:

## 1. Enable Email/Password Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Email/Password**
5. Enable the first option (Email/Password)
6. **Optional**: Enable "Email link (passwordless sign-in)" if desired
7. Click **Save**

## 1.1. Configure Email Verification (Optional)

1. In the Firebase Console, go to **Authentication** > **Templates**
2. Click on **Email address verification**
3. Customize the email template if desired:
   - Subject line
   - Email body
   - Action URL (should point to your domain)
4. Click **Save**

## 2. Update Firestore Security Rules

Update your Firestore security rules to require authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own learning paths
    match /learningPaths/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to create new learning paths
    match /learningPaths/{document} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 3. Test the Authentication

1. Open your app at http://localhost:5173/
2. You should see a sign-in/sign-up form
3. Create a new account with:
   - Display name
   - Email address
   - Password (minimum 6 characters)
4. After signing up, you'll be automatically signed in
5. Test the logout functionality
6. Test signing back in with your credentials

## 4. Features Implemented

✅ **User Registration** - Users can create accounts with email/password
✅ **Email Verification** - Users must verify their email before accessing the app
✅ **User Login** - Existing users can sign in
✅ **User Logout** - Users can sign out securely
✅ **Protected Routes** - Learning paths are only accessible to verified users
✅ **User-specific Data** - Each user only sees their own saved learning paths
✅ **Display Name Support** - Users can set a display name during registration
✅ **Form Validation** - Client-side validation for all auth forms
✅ **Loading States** - Visual feedback during authentication operations
✅ **Error Handling** - Clear error messages for authentication failures
✅ **Verification Management** - Resend verification emails and check status
✅ **Auto-verification Check** - Automatically detects when email is verified

## 5. Security Benefits

- **Data Privacy**: Users can only access their own learning paths
- **Secure Authentication**: Firebase handles password hashing and security
- **Session Management**: Automatic session handling and persistence
- **Input Validation**: Both client and server-side validation
- **Environment Variables**: Sensitive config stored securely

## 6. Next Steps (Optional)

- Add password reset functionality
- Implement email verification
- Add social login (Google, GitHub, etc.)
- Add user profile management
- Implement role-based access control