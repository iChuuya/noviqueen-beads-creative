const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

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

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Database files
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ADMIN_FILE = path.join(__dirname, 'data', 'admin.json');

// Initialize products file if it doesn't exist
if (!fs.existsSync(PRODUCTS_FILE)) {
    const initialProducts = [
        {
            id: 1,
            name: 'Pearl White Beaded Bag',
            description: 'Elegant white beaded handbag crafted with premium pearl beads. Perfect for formal events and special occasions.',
            price: 1299,
            category: 'bags',
            image: 'https://via.placeholder.com/400x500/E8D5C4/8B4513?text=Beaded+Bag+1',
            inStock: true,
            featured: true
        },
        {
            id: 2,
            name: 'Sky Blue Beaded Bag',
            description: 'Tranquil blue beaded clutch that brings a sense of calm elegance. Ideal for both casual and semi-formal occasions.',
            price: 1199,
            category: 'bags',
            image: 'https://via.placeholder.com/400x500/D4E8E8/4682B4?text=Beaded+Bag+2',
            inStock: true,
            featured: false
        },
        {
            id: 3,
            name: 'Classic Beaded Necklace',
            description: 'Handwoven beaded necklace featuring intricate patterns and high-quality beads.',
            price: 599,
            category: 'jewelry',
            image: 'https://via.placeholder.com/400x500/F5E6D3/DAA520?text=Beaded+Necklace',
            inStock: true,
            featured: false
        }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
}

// Initialize admin file if it doesn't exist (default password: admin123)
if (!fs.existsSync(ADMIN_FILE)) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const adminData = {
        username: 'admin',
        password: hashedPassword
    };
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));
}

// Helper functions
const readProducts = () => {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
};

const writeProducts = (products) => {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

const readAdmin = () => {
    const data = fs.readFileSync(ADMIN_FILE, 'utf8');
    return JSON.parse(data);
};

// ===================================
// API Routes
// ===================================

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const products = readProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    try {
        const products = readProducts();
        const product = products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = readAdmin();
        
        if (username === admin.username && bcrypt.compareSync(password, admin.password)) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Change admin password
app.post('/api/admin/change-password', (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = readAdmin();
        
        if (bcrypt.compareSync(currentPassword, admin.password)) {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            admin.password = hashedPassword;
            fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2));
            res.json({ success: true, message: 'Password changed successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Create new product
app.post('/api/products', upload.single('image'), (req, res) => {
    try {
        const products = readProducts();
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            image: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || '',
            inStock: req.body.inStock === 'true',
            featured: req.body.featured === 'true'
        };
        
        products.push(newProduct);
        writeProducts(products);
        
        res.json({ success: true, product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    try {
        const products = readProducts();
        const index = products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const updatedProduct = {
            ...products[index],
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            inStock: req.body.inStock === 'true',
            featured: req.body.featured === 'true'
        };
        
        // Update image only if new file uploaded
        if (req.file) {
            updatedProduct.image = `/uploads/${req.file.filename}`;
        } else if (req.body.imageUrl) {
            updatedProduct.image = req.body.imageUrl;
        }
        
        products[index] = updatedProduct;
        writeProducts(products);
        
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    try {
        const products = readProducts();
        const index = products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Delete image file if it exists locally
        const product = products[index];
        if (product.image && product.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        products.splice(index, 1);
        writeProducts(products);
        
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
app.get('/api/messages', (req, res) => {
    try {
        const messagesData = fs.readFileSync('messages.json', 'utf8');
        const messages = JSON.parse(messagesData);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});

// Save new message
app.post('/api/messages', (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const messagesData = fs.readFileSync('messages.json', 'utf8');
        const messages = JSON.parse(messagesData);
        
        const newMessage = {
            id: Date.now(),
            name,
            email,
            message,
            date: new Date().toISOString(),
            read: false
        };
        
        messages.unshift(newMessage); // Add to beginning of array
        
        fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));
        
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// Mark message as read
app.patch('/api/messages/:id', (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const messagesData = fs.readFileSync('messages.json', 'utf8');
        const messages = JSON.parse(messagesData);
        
        const messageIndex = messages.findIndex(m => m.id === messageId);
        
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        messages[messageIndex].read = true;
        
        fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

// Delete message
app.delete('/api/messages/:id', (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const messagesData = fs.readFileSync('messages.json', 'utf8');
        let messages = JSON.parse(messagesData);
        
        messages = messages.filter(m => m.id !== messageId);
        
        fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));
        
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
app.get('/api/subscribers', (req, res) => {
    try {
        const subscribersData = fs.readFileSync('subscribers.json', 'utf8');
        const subscribers = JSON.parse(subscribersData);
        res.json(subscribers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve subscribers' });
    }
});

// Add new subscriber
app.post('/api/subscribers', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const subscribersData = fs.readFileSync('subscribers.json', 'utf8');
        const subscribers = JSON.parse(subscribersData);
        
        // Check if email already exists
        const existingSubscriber = subscribers.find(s => s.email === email);
        if (existingSubscriber) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }
        
        const newSubscriber = {
            id: Date.now(),
            email,
            date: new Date().toISOString()
        };
        
        subscribers.unshift(newSubscriber);
        
        fs.writeFileSync('subscribers.json', JSON.stringify(subscribers, null, 2));
        
        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Delete subscriber
app.delete('/api/subscribers/:id', (req, res) => {
    try {
        const subscriberId = parseInt(req.params.id);
        const subscribersData = fs.readFileSync('subscribers.json', 'utf8');
        let subscribers = JSON.parse(subscribersData);
        
        subscribers = subscribers.filter(s => s.id !== subscriberId);
        
        fs.writeFileSync('subscribers.json', JSON.stringify(subscribers, null, 2));
        
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
});
