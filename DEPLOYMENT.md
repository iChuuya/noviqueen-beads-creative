# Deployment Guide - NoviQueen Beads Creative

This guide covers deploying your application to GitHub and Render.

## 📋 Pre-Deployment Checklist

### ✅ Required Files (All Created!)
- [x] `.gitignore` - Excludes sensitive files
- [x] `.env.example` - Environment variable template
- [x] `render.yaml` - Render deployment configuration
- [x] `package.json` - Dependencies and scripts
- [x] `database.js` - Database with auto-initialization
- [x] `migrate.js` - Data migration script

### ✅ Security Checks
- [x] Admin password can be changed after deployment
- [x] Database files excluded from git
- [x] Environment variables configured
- [x] All security vulnerabilities fixed

### ✅ Code Quality
- [x] All dependencies updated and secure
- [x] Server code tested and working
- [x] Database migrations working
- [x] API endpoints functional

---

## 🐙 Part 1: Deploy to GitHub

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done)
   ```bash
   git init
   ```

2. **Check what will be committed**
   ```bash
   git status
   ```

3. **Add all files**
   ```bash
   git add .
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Initial commit: NoviQueen Beads Creative with database"
   ```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Repository settings:
   - **Name:** `noviqueen-beads-creative` (or your choice)
   - **Description:** "E-commerce website for handcrafted beaded products"
   - **Visibility:** Private or Public (your choice)
   - **DON'T** initialize with README (you already have one)
4. Click **"Create repository"**

### Step 3: Push to GitHub

GitHub will show you commands. Use these:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/noviqueen-beads-creative.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Verify Upload

- Refresh your GitHub repository page
- You should see all your files
- Check that sensitive files are NOT there:
  - ❌ `node_modules/` (should be missing)
  - ❌ `data/noviqueen.db` (should be missing)
  - ✅ `server.js` (should be present)
  - ✅ `database.js` (should be present)

---

## 🚀 Part 2: Deploy to Render

### Step 1: Sign Up for Render

1. Go to [Render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with GitHub (recommended for easy integration)

### Step 2: Create New Web Service

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Find and select your `noviqueen-beads-creative` repository
5. Click **"Connect"**

### Step 3: Configure Web Service

Fill in the deployment settings:

| Setting | Value |
|---------|-------|
| **Name** | `noviqueen-beads-creative` (or your choice) |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | (leave blank) |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run db:migrate` |
| **Start Command** | `npm start` |
| **Plan** | Free (or Starter for production) |

### Step 4: Add Environment Variables

Scroll down to **Environment Variables** section and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3000` | Auto-set by Render |
| `SESSION_SECRET` | (generate random string) | See below |

**Generate SESSION_SECRET:**
Run this locally and copy the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Add Persistent Disk (IMPORTANT!)

Your database needs persistent storage:

1. Scroll to **"Disks"** section
2. Click **"Add Disk"**
3. Configure:
   - **Name:** `data`
   - **Mount Path:** `/opt/render/project/src/data`
   - **Size:** 1 GB (free tier)
4. Click **"Save"**

### Step 6: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will start building your application
3. Watch the deployment logs
4. Wait for "Your service is live 🎉"

### Step 7: Verify Deployment

Once deployed, you'll get a URL like: `https://noviqueen-beads-creative.onrender.com`

**Test these endpoints:**

1. **Website:** `https://your-app.onrender.com/`
   - Should show your homepage

2. **API:** `https://your-app.onrender.com/api/products`
   - Should return product JSON data

3. **Admin Panel:** `https://your-app.onrender.com/admin`
   - Should show admin login
   - Default: username `admin`, password `admin123`
   - **⚠️ CHANGE THIS IMMEDIATELY!**

---

## 🔐 Post-Deployment Security

### Step 1: Change Admin Password

1. Go to `https://your-app.onrender.com/admin`
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Go to **Settings** or **Change Password**
4. Set a strong new password
5. **Save it securely!**

### Step 2: Update Environment Variables (Optional)

You can add more security settings in Render Dashboard:

1. Go to your service → **Environment** tab
2. Add these optional variables:
   - `CORS_ORIGIN`: Your custom domain (if you have one)
   - `MAX_FILE_SIZE`: Maximum upload size in bytes

---

## 📱 Custom Domain (Optional)

### Step 1: Purchase Domain

Buy a domain from:
- Namecheap
- Google Domains
- GoDaddy
- etc.

### Step 2: Add Custom Domain in Render

1. In Render Dashboard, go to your service
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"**
4. Click **"Add Custom Domain"**
5. Enter your domain (e.g., `noviqueen.com`)
6. Follow Render's DNS configuration instructions

### Step 3: Configure DNS

Add these records in your domain registrar:

**For root domain (noviqueen.com):**
- Type: `A`
- Name: `@`
- Value: (provided by Render)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `your-app.onrender.com`

SSL/HTTPS is automatically provided by Render!

---

## 🔄 Updating Your Deployment

### Update Code

1. **Make changes locally**
2. **Test locally:** `npm start`
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
4. **Push to GitHub:**
   ```bash
   git push origin main
   ```
5. **Render auto-deploys!** (watches your GitHub repo)

### Manual Redeploy

In Render Dashboard:
1. Go to your service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### View Logs

To debug issues:
1. Go to Render Dashboard
2. Click your service
3. Click **"Logs"** tab
4. View real-time logs

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Solution:**
- Check Render logs for errors
- Verify `package.json` has all dependencies
- Ensure Node version is 18+ (set in `package.json` engines)

### Issue: Database Not Persisting

**Solution:**
- Verify persistent disk is attached
- Check mount path: `/opt/render/project/src/data`
- Ensure `data/` directory exists

### Issue: Images Not Loading

**Solution:**
- Uploaded images need persistent disk
- Alternative: Use cloud storage (Cloudinary, AWS S3)
- Images in `uploads/` are stored on persistent disk

### Issue: Site is Slow to Wake Up

**Render Free Tier:**
- Apps sleep after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- Upgrade to Starter plan ($7/month) to stay always on

### Issue: Can't Access Admin Panel

**Solution:**
- Check URL: `https://your-app.onrender.com/admin`
- Try clearing browser cache
- Check Render logs for errors
- Verify database initialized correctly

---

## 💰 Render Pricing

### Free Tier
- ✅ Perfect for testing and personal projects
- ✅ 750 hours/month
- ❌ App sleeps after 15 min inactivity
- ❌ 100GB bandwidth/month

### Starter Tier ($7/month)
- ✅ Always on (no sleeping)
- ✅ Better performance
- ✅ 400 hours runtime
- ✅ 100GB bandwidth/month
- Recommended for production

### Pro Tier ($25/month)
- ✅ Everything in Starter
- ✅ More resources
- ✅ Better scaling

---

## 📊 Monitoring

### Check Application Health

1. **Render Dashboard:**
   - View metrics (CPU, Memory, Network)
   - Check uptime
   - View deployment history

2. **Database Stats:**
   ```bash
   # SSH into Render (if on paid plan)
   npm run db:stats
   ```

3. **Set Up Alerts:**
   - Render can notify you of downtime
   - Go to service → Notifications

---

## 🔧 Advanced: CI/CD

Your deployment is already CI/CD enabled!

**GitHub → Render Pipeline:**
1. You push code to GitHub
2. Render detects changes
3. Automatically builds and deploys
4. Zero downtime deployment

---

## 📞 Support

### Render Support
- Free tier: Community support
- Paid tiers: Email support
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)

### Application Issues
- Check application logs in Render
- Review `SECURITY-REPORT.md` for security info
- Review `DATABASE.md` for database help

---

## ✅ Deployment Complete!

Your application is now live and accessible to the world! 🎉

**Next Steps:**
1. ✅ Change admin password
2. ✅ Add your products
3. ✅ Test all features
4. ✅ Share your URL!
5. ✅ (Optional) Set up custom domain
6. ✅ (Optional) Set up analytics (Google Analytics)

**Your Live URLs:**
- 🌐 Website: `https://your-app.onrender.com`
- ⚙️ Admin: `https://your-app.onrender.com/admin`
- 📦 API: `https://your-app.onrender.com/api/products`

---

**Questions?** Check the troubleshooting section or Render documentation!
