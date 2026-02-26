# NoviQueen Beads Creative - Quick Start Guide

## 🚀 Getting Started with Backend

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Go to https://nodejs.org
2. Download and install the LTS version
3. Verify installation: Open terminal and run `node --version`

### Step 2: Install Dependencies
Open terminal in this folder and run:
```bash
npm install
```

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
🚀 Server is running on http://localhost:3000
📱 Website: http://localhost:3000
⚙️  Admin Panel: http://localhost:3000/admin
🔐 Default Login: username: admin, password: admin123
```

### Step 4: Access Your Website
- **Main Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## 🔐 Admin Panel Login

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the default password after first login!

## 📋 Admin Panel Features

### Managing Products
1. **Add New Product**
   - Click "Add New Product" button
   - Fill in product details (name, description, price, category)
   - Upload an image or use URL
   - Set stock status and featured status
   - Click "Save Product"

2. **Edit Product**
   - Click "Edit" button on any product card
   - Modify details as needed
   - Click "Save Product"

3. **Delete Product**
   - Click "Delete" button on any product card
   - Confirm deletion

4. **View Statistics**
   - Dashboard shows total products, in-stock, and out-of-stock counts

### Product Categories
- **Bags**: Beaded handbags, clutches, purses
- **Jewelry**: Necklaces, bracelets, earrings
- **Accessories**: Keychains, phone charms, decorative items

## 📸 Adding Product Images

### Option 1: Upload Image File
1. Click "Choose File" in the product form
2. Select an image from your computer
3. Images are stored in the `uploads` folder

### Option 2: Use Image URL
1. Leave the file input empty
2. The system will use placeholder or existing image

## 🎨 Customization

### Change Admin Password
1. Login to admin panel
2. Use the change password feature (to be added)
3. Or manually edit `data/admin.json` (not recommended)

### Change Website Branding
Edit `index.html`:
- Update company name in header
- Modify hero text
- Change contact information

Edit `styles.css`:
```css
:root {
    --primary-color: #8B4513;      /* Your brand color */
    --secondary-color: #D4A574;
    --accent-color: #E8D5C4;
}
```

## 📂 File Structure

```
NoviQueen-Beads-Creative/
│
├── index.html          # Main website
├── admin.html          # Admin panel
├── styles.css          # Website styling
├── script.js           # Website JavaScript
├── admin.js            # Admin panel JavaScript
├── server.js           # Backend server
├── package.json        # Dependencies
│
├── data/              # Auto-created
│   ├── products.json  # Product database
│   └── admin.json     # Admin credentials
│
└── uploads/           # Auto-created
    └── [images]       # Uploaded product images
```

## 🌐 Deploying Online

### For Development/Testing:
Just keep the server running with `npm start`

### For Production:

#### Option 1: Simple VPS (DigitalOcean, Linode, etc.)
1. Upload all files to server
2. Install Node.js on server
3. Run `npm install`
4. Use PM2 to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   ```

#### Option 2: Heroku (Free tier available)
1. Create Heroku account
2. Install Heroku CLI
3. Deploy with Git:
   ```bash
   heroku create
   git push heroku main
   ```

#### Option 3: Render.com (Easy deployment)
1. Connect your GitHub repository
2. Render auto-deploys from Git
3. Set start command: `npm start`

## 🔧 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Make sure Node.js is installed
- Run `npm install` again

### Products not loading
- Make sure server is running
- Check browser console for errors (F12)
- Verify API_BASE URL in script.js matches your server

### Can't upload images
- Check if `uploads` folder exists and has write permissions
- Make sure image file is under 5MB
- Only JPG, PNG, GIF, WEBP formats supported

### Forgot admin password
1. Stop the server
2. Delete `data/admin.json`
3. Restart server (new admin.json created with default password)

## 🎯 Next Steps

1. **Add Real Products**: Replace placeholder items with actual products
2. **Upload Real Photos**: Add high-quality product images
3. **Test Everything**: Add, edit, delete products to ensure everything works
4. **Change Password**: Update from default admin password
5. **Share Your Site**: Send the link to customers

## 📞 Support

Need help? Check:
- Browser console (F12) for error messages
- Terminal for server errors
- README.md for detailed documentation

## 🛡️ Security Notes

- Change default admin password immediately
- Don't share admin credentials
- Keep your server secure
- Regular backups of `data/products.json`

---

**Made with ❤️ for NoviQueen Beads Creative**

*Ready to showcase beautiful handcrafted beaded products!* ✨
