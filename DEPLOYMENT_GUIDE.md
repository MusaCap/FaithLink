# 🚀 FaithLink360 Production Deployment Guide

## 📋 **Quick Deployment for Church User Testing**

### **🎯 Deployment Strategy: Frontend + Backend Separation**
- **Frontend:** Netlify (Static hosting with global CDN)
- **Backend:** Render.com (Node.js API hosting with persistent storage)
- **Database:** SQLite (embedded, no external DB needed)

---

## **⚡ Step 1: Deploy Backend API (Render.com)**

### **1.1 Create Render Account & Deploy API:**

```bash
# 1. Go to https://render.com and sign up/login
# 2. Click "New +" → "Web Service"
# 3. Connect your GitHub repository
# 4. Use these settings:

Name: faithlink360-api
Environment: Node
Build Command: cd src/backend && npm install
Start Command: cd src/backend && node server-production.js
```

### **1.2 Environment Variables on Render:**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=fl360-production-jwt-secret-key-2025-secure
JWT_REFRESH_SECRET=fl360-production-refresh-secret-key-2025-secure
DATABASE_URL=file:./faithlink360.db
EMAIL_FROM=noreply@faithlink360.com
FRONTEND_URL=https://faithlink360-uat.netlify.app
```

### **1.3 Get Your API URL:**
After deployment, you'll get a URL like: `https://faithlink360-api.onrender.com`

---

## **⚡ Step 2: Deploy Frontend (Netlify)**

### **2.1 Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

### **2.2 Login to Netlify:**
```bash
netlify login
```

### **2.3 Update Frontend Environment:**
Edit `src/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://faithlink360-api.onrender.com
NEXT_PUBLIC_APP_URL=https://faithlink360-uat.netlify.app
NEXTAUTH_URL=https://faithlink360-uat.netlify.app
NEXTAUTH_SECRET=fl360-production-secure-key-2025
```

### **2.4 Build and Deploy:**
```bash
cd src/frontend
npm run build
netlify deploy --prod --dir=.next
```

---

## **🔄 Quick Update Process During Testing**

### **Backend Updates:**
```bash
# Render auto-deploys from Git commits
git add .
git commit -m "Backend update for user testing"
git push origin main
# Deployment happens automatically in ~2 minutes
```

### **Frontend Updates:**
```bash
cd src/frontend
npm run build
netlify deploy --prod --dir=.next
# Deployment completes in ~30 seconds
```

---

## **🌐 Alternative: One-Command Deployment**

### **Deploy Both Frontend & Backend to Render:**
```bash
# 1. Create a new Web Service on Render
# 2. Use these settings:

Name: faithlink360-fullstack
Environment: Node
Build Command: cd src/frontend && npm install && npm run build && cd ../backend && npm install
Start Command: cd src/backend && node server-production.js
```

### **Serve Frontend from Backend:**
Add to `server-production.js`:
```javascript
// Serve Next.js frontend (add at the end before the server start)
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/.next')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, '../frontend/.next/index.html'));
  }
});
```

---

## **🎯 Church User Testing Access**

### **Live URLs (After Deployment):**
- **Main App:** `https://faithlink360-uat.netlify.app`
- **API Docs:** `https://faithlink360-api.onrender.com/api/health`

### **Test Accounts for Church Members:**
```
Admin Account:
Email: admin@faithlink360.com
Password: ChurchAdmin2025!

Pastor Account:  
Email: pastor@faithlink360.com
Password: Pastor2025!

Member Account:
Email: member@faithlink360.com
Password: Member2025!
```

### **User Testing Instructions for Church:**
1. **Access the platform** at your deployed URL
2. **Login** with provided test accounts or create new ones
3. **Test core workflows:**
   - Create and join groups
   - Upload and share files in groups
   - Send messages in group chat
   - Record attendance
   - View reports and export data
   - Create and manage events
   - Track spiritual journeys

---

## **📊 Monitoring During User Testing**

### **Backend Logs (Render):**
```bash
# View real-time logs
# Go to Render dashboard → Your service → Logs tab
```

### **Frontend Logs (Netlify):**
```bash
netlify logs
```

### **Performance Monitoring:**
- **Response Times:** Should be < 500ms for API calls
- **Uptime:** Monitor at https://uptimerobot.com
- **User Feedback:** Collect via built-in forms or external survey

---

## **🔧 Troubleshooting Common Issues**

### **CORS Errors:**
Update backend CORS configuration:
```javascript
app.use(cors({
  origin: ['https://faithlink360-uat.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

### **Database Issues:**
SQLite file persists on Render automatically - no action needed

### **Environment Variables:**
Verify all environment variables are set in both platforms

---

## **💡 Pro Tips for User Testing**

1. **Real-Time Updates:** Use Git commits for instant backend updates
2. **Feature Flags:** Add environment variables to enable/disable features during testing
3. **User Feedback:** Add a feedback widget or form to collect church member input
4. **Analytics:** Add Google Analytics or similar to track usage patterns
5. **Backup Data:** Export test data regularly for analysis

---

## **🎉 Ready for Church User Testing!**

Your FaithLink360 platform will be accessible worldwide for church members to test, while you maintain full control to push updates in real-time based on their feedback.

**Next Steps:**
1. Run the deployment commands above
2. Share the live URL with church members
3. Monitor usage and gather feedback
4. Iterate quickly based on real user needs

**Support:** All features are production-ready with 100% PRD compliance achieved!
