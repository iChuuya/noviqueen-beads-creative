const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dataDir, 'noviqueen.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
    // Admin table
    db.exec(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Products table
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image TEXT,
            in_stock INTEGER DEFAULT 1,
            featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Messages/Contact table
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'unread',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Subscribers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'active',
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Orders table (for future use)
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Order items table (for future use)
    db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    console.log('✅ Database tables initialized successfully');
}

// Database wrapper functions

// Admin functions
const adminDb = {
    getByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
        return stmt.get(username);
    },
    
    create: (username, hashedPassword) => {
        const stmt = db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)');
        return stmt.run(username, hashedPassword);
    },
    
    update: (username, hashedPassword) => {
        const stmt = db.prepare('UPDATE admins SET password = ? WHERE username = ?');
        return stmt.run(hashedPassword, username);
    }
};

// Product functions
const productDb = {
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
        return stmt.all();
    },
    
    getById: (id) => {
        const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
        return stmt.get(id);
    },
    
    getFeatured: () => {
        const stmt = db.prepare('SELECT * FROM products WHERE featured = 1 ORDER BY created_at DESC');
        return stmt.all();
    },
    
    getByCategory: (category) => {
        const stmt = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC');
        return stmt.all(category);
    },
    
    create: (product) => {
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, category, image, in_stock, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            product.name,
            product.description,
            product.price,
            product.category,
            product.image,
            product.inStock ? 1 : 0,
            product.featured ? 1 : 0
        );
    },
    
    update: (id, product) => {
        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, category = ?, 
                image = ?, in_stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            product.name,
            product.description,
            product.price,
            product.category,
            product.image,
            product.inStock ? 1 : 0,
            product.featured ? 1 : 0,
            id
        );
    },
    
    delete: (id) => {
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        return stmt.run(id);
    }
};

// Message functions
const messageDb = {
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM messages ORDER BY created_at DESC');
        return stmt.all();
    },
    
    getById: (id) => {
        const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
        return stmt.get(id);
    },
    
    create: (message) => {
        const stmt = db.prepare(`
            INSERT INTO messages (name, email, subject, message, status)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(
            message.name,
            message.email,
            message.subject || '',
            message.message,
            message.status || 'unread'
        );
    },
    
    updateStatus: (id, status) => {
        const stmt = db.prepare('UPDATE messages SET status = ? WHERE id = ?');
        return stmt.run(status, id);
    },
    
    delete: (id) => {
        const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
        return stmt.run(id);
    }
};

// Subscriber functions
const subscriberDb = {
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
        return stmt.all();
    },
    
    getByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM subscribers WHERE email = ?');
        return stmt.get(email);
    },
    
    create: (email) => {
        const stmt = db.prepare('INSERT INTO subscribers (email) VALUES (?)');
        return stmt.run(email);
    },
    
    updateStatus: (email, status) => {
        const stmt = db.prepare('UPDATE subscribers SET status = ? WHERE email = ?');
        return stmt.run(status, email);
    },
    
    delete: (email) => {
        const stmt = db.prepare('DELETE FROM subscribers WHERE email = ?');
        return stmt.run(email);
    }
};

// Initialize database on module load
initializeDatabase();

module.exports = {
    db,
    adminDb,
    productDb,
    messageDb,
    subscriberDb
};
