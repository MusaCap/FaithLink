# 🔥 Firebase Setup Instructions for FaithLink360

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Click **"Create a project"**
3. Project name: `faithlink360-dev`
4. Enable Google Analytics: **Yes** (recommended for tracking usage)
5. Choose or create Analytics account
6. Click **"Create project"**

### 1.2 Enable Required Services

#### Authentication Setup
1. In Firebase Console → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable these providers:
   - ✅ **Email/Password** (Native authentication)
   - ✅ **Google** (SSO for easier login)
   
   For Google setup:
   - Click Google → Enable
   - Add your email as test user
   - Save configuration

#### Firestore Database Setup  
1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules later)
4. Select location: **us-central** (or closest to your users)
5. Click **"Done"**

#### Storage Setup
1. In Firebase Console → **Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select same location as Firestore
5. Click **"Done"**

### 1.3 Get Configuration Keys
1. Go to **Project Settings** (⚙️ gear icon)
2. Scroll to **"Your apps"** section
3. Click **"Web app"** (</> icon)
4. App nickname: `FaithLink360-Web`
5. ✅ Check **"Also set up Firebase Hosting"**
6. Click **"Register app"**

**📋 Copy these values - you'll need them for Bubble.io:**
```javascript
// Firebase Configuration (SAVE THESE VALUES!)
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "faithlink360-dev.firebaseapp.com",
  projectId: "faithlink360-dev", 
  storageBucket: "faithlink360-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};
```

---

## Step 2: Initial Database Structure

### 2.1 Create Collections
In Firestore Console, manually create these collections with sample documents:

#### Create "userRoles" Collection
1. Go to **Firestore Database**
2. Click **"Start collection"**
3. Collection ID: `userRoles`
4. Add first document:
   - Document ID: **Auto-generate**
   - Fields:
     ```
     email: "your-email@gmail.com" (string)
     role: "admin" (string)
     isActive: true (boolean)
     createdAt: [Click timestamp icon] (timestamp)
     ```

#### Create "journeyTemplates" Collection
1. Click **"Start collection"** 
2. Collection ID: `journeyTemplates`
3. Add first document:
   - Document ID: **Auto-generate**
   - Fields:
     ```
     name: "New Believer Journey" (string)
     description: "Path for new members" (string)
     isActive: true (boolean)
     createdAt: [Click timestamp icon] (timestamp)
     milestones: [Click array icon] (array)
       - [0]: {
           name: "Welcome Meeting" (string)
           sequence: 1 (number)
           description: "Initial pastoral meeting" (string)
         }
       - [1]: {
           name: "Bible Study Basics" (string)
           sequence: 2 (number)  
           description: "Complete intro Bible study" (string)
         }
     ```

#### Create "tags" Collection
1. Click **"Start collection"**
2. Collection ID: `tags`
3. Add first document:
   - Document ID: **Auto-generate**
   - Fields:
     ```
     label: "New Believer" (string)
     category: "member" (string)
     color: "#7ED321" (string)
     createdAt: [Click timestamp icon] (timestamp)
     ```

### 2.2 Set Basic Security Rules
1. Go to **Firestore Database** → **Rules** tab
2. Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 3: Test Firebase Setup

### 3.1 Verify Collections
✅ Check that you can see:
- `userRoles` collection with your admin user
- `journeyTemplates` collection with sample journey
- `tags` collection with sample tag

### 3.2 Test Authentication  
1. Go to **Authentication** → **Users** tab
2. Click **"Add user"**
3. Email: your email address
4. Password: create a test password
5. Click **"Add user"**

✅ You should see the user appear in the Users list

### 3.3 Security Check
1. Go to **Firestore Database** → **Rules** tab
2. Verify rules are published
3. Test security by trying to access data without auth (should fail)

---

## 📋 Pre-Bubble.io Checklist

Before moving to Bubble.io setup, ensure you have:

- [ ] Firebase project created (`faithlink360-dev`)
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore database created with test mode rules
- [ ] Storage enabled and configured
- [ ] **Firebase config object copied and saved** 📋
- [ ] Basic collections created (`userRoles`, `journeyTemplates`, `tags`)
- [ ] Test user created in Authentication
- [ ] Security rules published

---

## 🚨 Important Notes

### Save Your Firebase Config!
You'll need the Firebase configuration object for Bubble.io integration. Save it in a secure location:

```javascript
// SAVE THIS - You'll use it in Bubble.io
const firebaseConfig = {
  apiKey: "AIza...", // Your actual API key
  authDomain: "faithlink360-dev.firebaseapp.com",
  projectId: "faithlink360-dev",
  storageBucket: "faithlink360-dev.appspot.com", 
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

### Security Considerations
- Test mode rules are temporary - we'll implement proper security rules later
- Never commit Firebase config to public repositories
- Use environment variables in production

### Backup Plan
If Firebase setup fails:
- We can switch to Airtable backend
- Or use Bubble.io's native database temporarily
- Firebase can be added later

---

## Next Step: Bubble.io Setup
Once Firebase is ready, we'll move to Bubble.io workspace creation and connection setup.

**Estimated Time**: 1-2 hours  
**Required**: Google account for Firebase Console access
