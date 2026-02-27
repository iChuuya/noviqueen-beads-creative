const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { adminDb, productDb, messageDb, subscriberDb } = require('./database');
const { uploadImage, deleteImage, isSupabaseUrl } = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve files from root directory
app.use('/uploads', express.static('uploads'));

// Ensure necessary directories exist
const directories = ['uploads', 'data'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer for image uploads (using memory storage for Supabase)
const upload = multer({
    storage: multer.memoryStorage(), // Store in memory to upload to Supabase
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Database files (keeping for backup reference)
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ADMIN_FILE = path.join(__dirname, 'data', 'admin.json');

// Initialize admin if doesn't exist in database (default password: admin123)
const initializeAdmin = async () => {
    const existingAdmin = await adminDb.getByUsername('admin');
    if (!existingAdmin) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await adminDb.create('admin', hashedPassword);
        console.log('✅ Default admin account created');
    }
};

initializeAdmin();

// Helper function to convert database product format to API format
const formatProduct = (product) => {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        inStock: !!product.in_stock,
        featured: !!product.featured
    };
};

// ===================================
// API Routes
// ===================================

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await productDb.getAll();
        res.json(products.map(formatProduct));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await productDb.getById(parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(formatProduct(product));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await adminDb.getByUsername(username);
        
        if (admin && bcrypt.compareSync(password, admin.password)) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Change admin password
app.post('/api/admin/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await adminDb.getByUsername('admin');
        
        if (admin && bcrypt.compareSync(currentPassword, admin.password)) {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            await adminDb.update('admin', hashedPassword);
            res.json({ success: true, message: 'Password changed successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Create new product
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        let imageUrl = req.body.imageUrl || '';
        
        // Upload to Supabase if file was uploaded
        if (req.file) {
            const uploadResult = await uploadImage(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype
            );
            
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
            } else {
                return res.status(500).json({ error: 'Failed to upload image: ' + uploadResult.error });
            }
        }
        
        const newProduct = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            image: imageUrl,
            inStock: req.body.inStock === 'true',
            featured: req.body.featured === 'true'
        };
        
        const createdProduct = await productDb.create(newProduct);
        
        res.json({ success: true, product: formatProduct(createdProduct) });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product: ' + error.message });
    }
});

// Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const existingProduct = await productDb.getById(productId);
        
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const updatedProduct = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            inStock: req.body.inStock === 'true',
            featured: req.body.featured === 'true',
            image: existingProduct.image
        };
        
        // Handle image update
        if (req.file) {
            // Upload new image to Supabase
            const uploadResult = await uploadImage(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype
            );
            
            if (uploadResult.success) {
                // Delete old image from Supabase if it exists
                if (existingProduct.image && isSupabaseUrl(existingProduct.image)) {
                    await deleteImage(existingProduct.image);
                }
                updatedProduct.image = uploadResult.url;
            } else {
                return res.status(500).json({ error: 'Failed to upload image: ' + uploadResult.error });
            }
        } else if (req.body.imageUrl) {
            updatedProduct.image = req.body.imageUrl;
        }
        
        const updated = await productDb.update(productId, updatedProduct);
        
        res.json({ success: true, product: formatProduct(updated) });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product: ' + error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await productDb.getById(productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Delete image from Supabase if it exists
        if (product.image && isSupabaseUrl(product.image)) {
            await deleteImage(product.image);
        }
        
        await productDb.delete(productId);
        
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ===================================
// Messages Endpoints
// ===================================

// Get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await messageDb.getAll();
        res.json(messages.map(msg => ({
            id: msg.id,
            name: msg.name,
            email: msg.email,
            subject: msg.subject,
            message: msg.message,
            date: msg.created_at,
            read: msg.status === 'read'
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});

// Save new message
app.post('/api/messages', async (req, res) => {
    try {
        const { name, email, message, subject } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newMessage = {
            name,
            email,
            subject: subject || '',
            message,
            status: 'unread'
        };
        
        await messageDb.create(newMessage);
        
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// Mark message as read
app.patch('/api/messages/:id', async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const message = await messageDb.getById(messageId);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        await messageDb.updateStatus(messageId, 'read');
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

// Delete message
app.delete('/api/messages/:id', async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        await messageDb.delete(messageId);
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// ===================================
// Newsletter Subscribers Endpoints
// ===================================

// Get all subscribers
app.get('/api/subscribers', async (req, res) => {
    try {
        const subscribers = await subscriberDb.getAll();
        res.json(subscribers.map(sub => ({
            id: sub.id,
            email: sub.email,
            date: sub.subscribed_at,
            status: sub.status
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve subscribers' });
    }
});

// Add new subscriber
app.post('/api/subscribers', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if email already exists
        const existingSubscriber = await subscriberDb.getByEmail(email);
        if (existingSubscriber) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }
        
        await subscriberDb.create(email);
        
        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Delete subscriber
app.delete('/api/subscribers/:id', async (req, res) => {
    try {
        const subscriberId = parseInt(req.params.id);
        const subscribers = await subscriberDb.getAll();
        const subscriber = subscribers.find(s => s.id === subscriberId);
        
        if (subscriber) {
            await subscriberDb.delete(subscriber.email);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete subscriber' });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📱 Website: http://localhost:${PORT}`);
    console.log(`⚙️  Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔐 Default Login: username: admin, password: admin123`);
    console.log(`💾 Database: PostgreSQL (Supabase)`);
});
