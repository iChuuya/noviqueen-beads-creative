# Security Instructions

## ⚠️ IMPORTANT: After Deployment

### 1. Change Admin Password Immediately
The default admin credentials are:
- Username: `admin`
- Password: `admin123`

**Steps to change:**
1. Go to your deployed site: `https://your-site.onrender.com/admin`
2. Login with default credentials
3. Change password in admin panel settings

### 2. Keep These Files Updated
Your site uses file-based storage. All data is saved in:
- `data/products.json` - Product catalog
- `messages.json` - Contact form submissions
- `subscribers.json` - Newsletter subscribers
- `uploads/` - Uploaded product images

### 3. Regular Backups
Render keeps your files, but it's good practice to:
- Regularly download your data files from the admin panel
- Keep backups of product images

### 4. What's Safe to Share
- ✅ Website code (HTML, CSS, JavaScript)
- ✅ Server code (Express backend structure)
- ✅ Product data (meant to be public anyway)

### 5. What's Protected
- ✅ Admin password (hashed with bcrypt)
- ✅ Customer messages (stored on server, not in code)
- ✅ Subscriber emails (stored on server, not in code)

## Need Help?
If you suspect any security issues, change your admin password immediately through the admin panel.
