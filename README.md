# NoviQueen Beads Creative

A full-stack e-commerce website for showcasing and managing handcrafted beaded bags, jewelry, and accessories.

## ✨ Features

### Frontend
- 🎨 **Responsive Design** - Works perfectly on all devices (desktop, tablet, mobile)
- 🛍️ **Product Gallery** - Showcases products with filtering options
- 📱 **Facebook Integration** - Direct links to Facebook page and Messenger
- 💌 **Contact Form** - Easy way for customers to get in touch
- 📧 **Newsletter Signup** - Collect customer emails for updates
- 🔍 **Quick View Modal** - View product details without leaving the page

### Backend & Admin
- 🔐 **Secure Admin Panel** - Full product management system
- 📦 **Product Management** - Add, edit, delete products with image uploads
- 💬 **Message Management** - View and respond to customer inquiries
- 📧 **Subscriber Management** - Track newsletter subscribers
- 🗄️ **SQLite Database** - Efficient data storage with automatic initialization
- 🔒 **Bcrypt Authentication** - Secure password hashing
- 🛡️ **Security Hardened** - All dependencies updated, 0 vulnerabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/noviqueen-beads-creative.git
   cd noviqueen-beads-creative
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize database** (migrate existing data if any)
   ```bash
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Default login: username `admin`, password `admin123`

### Development Mode

Run with auto-reload on file changes:
```bash
npm run dev
```

## 📁 Project Structure

```
noviqueen-beads-creative/
├── Frontend Files
│   ├── index.html           # Main website
│   ├── admin.html           # Admin panel interface
│   ├── styles.css           # All styling
│   ├── script.js            # Frontend functionality
│   └── admin.js             # Admin panel functionality
│
├── Backend Files
│   ├── server.js            # Express server & API routes
│   ├── database.js          # Database initialization & helpers
│   ├── migrate.js           # Data migration script
│   └── db-viewer.js         # CLI database management tool
│
├── Data Files
│   ├── data/
│   │   ├── noviqueen.db     # SQLite database (auto-created)
│   │   ├── admin.json       # Backup: Admin credentials
│   │   └── products.json    # Backup: Product data
│   ├── messages.json        # Backup: Customer messages
│   └── subscribers.json     # Backup: Newsletter subscribers
│
├── Uploads
│   └── uploads/             # Product images (uploaded via admin)
│
├── Configuration
│   ├── package.json         # Dependencies & scripts
│   ├── .gitignore          # Git exclusions
│   ├── .env.example        # Environment variables template
│   └── render.yaml         # Render deployment config
│
└── Documentation
    ├── README.md           # This file
    ├── DEPLOYMENT.md       # Complete deployment guide
    ├── DATABASE.md         # Database documentation
    ├── DATABASE-SETUP.md   # Database setup guide
    ├── SECURITY-REPORT.md  # Security audit report
    ├── SECURITY.md         # Security policy
    └── QUICK-START.md      # Quick start guide
```

## 🗄️ Database

The application uses **SQLite** for data storage with the following tables:
- **admins** - Admin credentials (bcrypt hashed)
- **products** - Product catalog
- **messages** - Customer inquiries
- **subscribers** - Newsletter subscribers
- **orders** - Order management (ready for future use)
- **order_items** - Order line items (ready for future use)

### Database Commands

```bash
# View database statistics
npm run db:stats

# View all products
npm run db:products

# View messages
npm run db:messages

# View subscribers
npm run db:subscribers

# Create backup
npm run db:backup

# Migrate data from JSON to database
npm run db:migrate
```

See [DATABASE.md](DATABASE.md) for complete documentation.

## 🔐 Admin Panel

Access the admin panel at `/admin` to:
- ✅ Add new products with images
- ✅ Edit existing products
- ✅ Delete products
- ✅ View customer messages
- ✅ Manage newsletter subscribers
- ✅ Change admin password

**Default credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the password immediately after first login!

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Messages
- `GET /api/messages` - Get all messages (admin only)
- `POST /api/messages` - Submit contact form
- `PATCH /api/messages/:id` - Mark message as read (admin only)
- `DELETE /api/messages/:id` - Delete message (admin only)

### Subscribers
- `GET /api/subscribers` - Get all subscribers (admin only)
- `POST /api/subscribers` - Subscribe to newsletter
- `DELETE /api/subscribers/:id` - Unsubscribe (admin only)

### Admin
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/change-password` - Change password

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Render**
   - Sign up at [Render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect settings from `render.yaml`
   - Add persistent disk for database storage
   - Click "Create Web Service"

3. **Post-deployment**
   - Change admin password
   - Add your products
   - Test all features

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions.

### Environment Variables

Create a `.env` file for local development (copy from `.env.example`):

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/noviqueen.db
SESSION_SECRET=your-random-secret-here
```

For production (Render), set these in the dashboard.

## 🛡️ Security

- ✅ All dependencies updated to latest secure versions
- ✅ 0 known vulnerabilities (npm audit clean)
- ✅ Bcrypt password hashing
- ✅ SQL injection protection (prepared statements)
- ✅ File upload validation
- ✅ CORS configured

Run security checks:
```bash
# Check for vulnerabilities
npm run audit

# Check for outdated packages
npm run update:check

# Full security check
npm run security:check
```

See [SECURITY-REPORT.md](SECURITY-REPORT.md) for details.

## 🔧 Available Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with auto-reload
npm run build          # Initialize database and migrate data
npm run db:migrate     # Migrate JSON data to SQLite
npm run db:stats       # View database statistics
npm run db:products    # View all products
npm run db:messages    # View all messages
npm run db:subscribers # View all subscribers
npm run db:backup      # Create database backup
npm audit              # Check for security vulnerabilities
npm run audit:fix      # Automatically fix vulnerabilities
npm run security:check # Full security and update check
npm run update:check   # Check for package updates
```

## 🎨 Customization

### Update Branding
1. **Colors:** Edit CSS variables in `styles.css`
2. **Logo:** Replace logo in `index.html` and `admin.html`
3. **Fonts:** Google Fonts are used (Playfair Display & Poppins)

### Add Products
- **Option 1:** Use the admin panel at `/admin`
- **Option 2:** Add to `data/products.json` and run `npm run db:migrate`

### Facebook Integration
Update links in `index.html`:
- Facebook Page: Your page URL
- Messenger: Your messenger link

## 🌐 Browser Compatibility

✅ Chrome (recommended)  
✅ Firefox  
✅ Safari  
✅ Edge  
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 💡 Tips for Success

1. **Use High-Quality Photos** - Take photos in good lighting, show products from multiple angles
2. **Update Regularly** - Add new products and keep inventory current via admin panel
3. **Optimize Images** - Compress images before upload (max 5MB per image)
4. **Engage on Social Media** - Post regularly on Facebook and link to website
5. **Respond Promptly** - Check messages regularly via admin panel
6. **Backup Database** - Run `npm run db:backup` regularly
7. **Monitor Security** - Run `npm run security:check` weekly

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is already in use
# Windows:
netstat -ano | findstr :3000

# Kill the process or change PORT in .env
```

### Database errors
```bash
# Delete and recreate database
rm data/noviqueen.db
npm run db:migrate
```

### Can't login to admin
- Default username: `admin`
- Default password: `admin123`
- If changed and forgotten, you'll need to reset via database

### Images not uploading
- Check `uploads/` folder exists and has write permissions
- Verify file size is under 5MB
- Ensure file format is supported (jpg, jpeg, png, gif, webp)

### Port already in use
```bash
# Change port in .env file
PORT=3001
```

For more help, check:
- [DATABASE.md](DATABASE.md) - Database issues
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment issues
- [SECURITY-REPORT.md](SECURITY-REPORT.md) - Security information

## 📊 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Responsive design with CSS Grid & Flexbox
- Modern UI/UX with animations

### Backend
- Node.js 18+
- Express.js 4.x
- SQLite 3 (better-sqlite3)

### Security & Authentication
- Bcrypt.js for password hashing
- Input validation & sanitization
- CORS protection
- File upload validation (Multer 2.x)

### Tools & Utilities
- Body-parser 2.x for request parsing
- Multer 2.x for file uploads
- Better-sqlite3 for database
- Nodemon for development

## 🚧 Future Enhancements

Planned features:
- [ ] Shopping cart functionality
- [ ] Payment integration (PayPal, GCash, Stripe)
- [ ] Order management system
- [ ] Customer accounts & authentication
- [ ] Product reviews & ratings
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Multi-image product gallery
- [ ] Product variants (colors, sizes)
- [ ] Discount codes & promotions
- [ ] Inventory tracking
- [ ] Search functionality
- [ ] SEO optimization
- [ ] Instagram feed integration

## 📄 Documentation

- [README.md](README.md) - Overview (this file)
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide for GitHub & Render
- [DATABASE.md](DATABASE.md) - Database schema and management
- [DATABASE-SETUP.md](DATABASE-SETUP.md) - Database setup quick reference
- [SECURITY-REPORT.md](SECURITY-REPORT.md) - Security audit results
- [SECURITY.md](SECURITY.md) - Security policy
- [QUICK-START.md](QUICK-START.md) - Quick start guide

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is created for NoviQueen Beads Creative. All rights reserved.

## 📞 Support

For issues or questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review the [Documentation](#-documentation)
- Open an issue on GitHub

## 🙏 Acknowledgments

- Built with ❤️ for NoviQueen Beads Creative
- "It's not just the design, but the heart put into it - is immeasurable."

---

**Status:** 
- ✅ Production Ready
- ✅ Security Hardened (0 vulnerabilities)
- ✅ Fully Documented
- ✅ Deploy Ready (GitHub + Render)

**Version:** 1.0.0  
**Last Updated:** February 27, 2026
