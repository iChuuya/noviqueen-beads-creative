# NoviQueen Beads Creative Website

A beautiful, modern website for showcasing handcrafted beaded bags, jewelry, and accessories.

## Features

- ✨ **Responsive Design** - Works perfectly on all devices (desktop, tablet, mobile)
- 🎨 **Modern UI/UX** - Clean and elegant design with smooth animations
- 🛍️ **Product Gallery** - Showcases products with filtering options
- 📱 **Facebook Integration** - Direct links to Facebook page and Messenger
- 💌 **Contact Form** - Easy way for customers to get in touch
- 🔍 **Quick View Modal** - View product details without leaving the page
- 📧 **Newsletter Signup** - Collect customer emails for updates

## File Structure

```
NoviQueen-Beads-Creative/
│
├── index.html          # Main website file
├── styles.css          # All styling and design
├── script.js           # Interactive functionality
├── README.md           # This file
│
└── images/            # Folder for product images (create this)
    ├── products/      # Product photos
    ├── hero/          # Hero section background
    └── about/         # About section images
```

## How to Use

### 1. Open the Website
Simply double-click `index.html` to open it in your default browser.

### 2. Add Real Product Images

Currently, the website uses placeholder images. To add real photos:

1. Create an `images` folder in the same directory as index.html
2. Add product photos to `images/products/`
3. Open `index.html` and replace the placeholder URLs:
   - Find: `https://via.placeholder.com/...`
   - Replace with: `images/products/your-image.jpg`

Example:
```html
<!-- Before -->
<img src="https://via.placeholder.com/400x500/E8D5C4/8B4513?text=Beaded+Bag+1" alt="Pearl White Beaded Bag">

<!-- After -->
<img src="images/products/white-beaded-bag.jpg" alt="Pearl White Beaded Bag">
```

### 3. Customize Content

#### Update Product Information
In `index.html`, find the product cards and update:
- Product names
- Descriptions
- Prices
- Categories (bags, jewelry, accessories)

In `script.js`, update the `products` object with matching information.

#### Change Colors
In `styles.css`, modify the CSS variables at the top:
```css
:root {
    --primary-color: #8B4513;      /* Main brand color */
    --secondary-color: #D4A574;    /* Secondary color */
    --accent-color: #E8D5C4;       /* Accent color */
}
```

#### Update Contact Information
In `index.html`, find the contact section and add:
- Phone number
- Email address
- Physical address (if applicable)

### 4. Deploy the Website

#### Option 1: GitHub Pages (Free)
1. Create a GitHub account
2. Create a new repository
3. Upload all files
4. Go to Settings > Pages
5. Select main branch and save
6. Your site will be live at `https://yourusername.github.io/repository-name`

#### Option 2: Netlify (Free)
1. Go to netlify.com
2. Drag and drop your project folder
3. Site goes live instantly

#### Option 3: Traditional Web Hosting
1. Purchase domain and hosting
2. Upload files via FTP
3. Configure domain

## Customization Guide

### Adding More Products

1. In `index.html`, copy a product card:
```html
<div class="product-card" data-category="bags">
    <div class="product-image">
        <img src="images/products/new-product.jpg" alt="Product Name">
        <div class="product-overlay">
            <button class="btn-quick-view">Quick View</button>
        </div>
    </div>
    <div class="product-info">
        <h3 class="product-name">New Product Name</h3>
        <p class="product-description">Description here</p>
        <p class="product-price">₱999</p>
    </div>
</div>
```

2. In `script.js`, add product details to the `products` object.

### Adding New Sections

Add a new section before the footer:
```html
<section id="testimonials" class="testimonials">
    <div class="container">
        <h2 class="section-title">Customer Reviews</h2>
        <!-- Your content here -->
    </div>
</section>
```

### Changing Fonts

The website uses Google Fonts (Playfair Display & Poppins). To change:
1. Visit [Google Fonts](https://fonts.google.com)
2. Select your fonts
3. Replace the font links in `index.html`
4. Update font-family in `styles.css`

## Facebook Integration

The website includes direct links to:
- Facebook Page: https://www.facebook.com/profile.php?id=61560179018913
- Facebook Messenger for instant customer communication

### Setting Up Messenger
The "Order Now" buttons automatically create a message with product details. Customers can click to start a conversation on Messenger.

## Browser Compatibility

✅ Chrome (recommended)
✅ Firefox
✅ Safari
✅ Edge
✅ Mobile browsers

## Tips for Success

1. **Use High-Quality Photos**: Take photos in good lighting, show products from multiple angles
2. **Update Regularly**: Add new products and update sold items
3. **Optimize Images**: Compress images to load faster (use tinypng.com)
4. **Engage on Social Media**: Post regularly on Facebook and link to website
5. **Collect Reviews**: Ask satisfied customers for testimonials
6. **SEO**: Add relevant keywords to product descriptions

## Need Help?

If you need assistance:
1. Right-click > Inspect to open browser developer tools
2. Check the Console tab for any errors
3. Common issues are usually related to file paths or typos

## Future Enhancements

Consider adding:
- 🛒 Shopping cart functionality
- 💳 Online payment integration (PayPal, GCash)
- 📊 Analytics (Google Analytics)
- 💬 Live chat widget
- 🌐 Multi-language support
- ⭐ Customer review system
- 📸 Instagram feed integration

## License

This website was created for NoviQueen Beads Creative. Feel free to modify and customize as needed.

---

**Made with ❤️ for NoviQueen Beads Creative**

*"It's not just the design, but the heart put into it - is immeasurable."*
