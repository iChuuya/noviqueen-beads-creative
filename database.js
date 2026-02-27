require('dotenv').config();
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    }
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

// Create tables (PostgreSQL syntax)
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        // Admin table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products table
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                image TEXT,
                in_stock BOOLEAN DEFAULT true,
                featured BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Messages/Contact table
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(500),
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Subscribers table
        await client.query(`
            CREATE TABLE IF NOT EXISTS subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Orders table (for future use)
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50),
                total_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Order items table (for future use)
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id),
                quantity INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL
            )
        `);

        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Database wrapper functions (now async)

// Admin functions
const adminDb = {
    getByUsername: async (username) => {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        return result.rows[0];
    },
    
    create: async (username, hashedPassword) => {
        const result = await pool.query(
            'INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        return result.rows[0];
    },
    
    update: async (username, hashedPassword) => {
        const result = await pool.query(
            'UPDATE admins SET password = $1 WHERE username = $2 RETURNING *',
            [hashedPassword, username]
        );
        return result.rows[0];
    }
};

// Product functions
const productDb = {
    getAll: async () => {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        return result.rows;
    },
    
    getById: async (id) => {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        return result.rows[0];
    },
    
    getFeatured: async () => {
        const result = await pool.query('SELECT * FROM products WHERE featured = true ORDER BY created_at DESC');
        return result.rows;
    },
    
    getByCategory: async (category) => {
        const result = await pool.query('SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC', [category]);
        return result.rows;
    },
    
    create: async (product) => {
        const result = await pool.query(
            `INSERT INTO products (name, description, price, category, image, in_stock, featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                product.name,
                product.description,
                product.price,
                product.category,
                product.image,
                product.inStock !== undefined ? product.inStock : true,
                product.featured !== undefined ? product.featured : false
            ]
        );
        return result.rows[0];
    },
    
    update: async (id, product) => {
        const result = await pool.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, category = $4, 
                 image = $5, in_stock = $6, featured = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [
                product.name,
                product.description,
                product.price,
                product.category,
                product.image,
                product.inStock !== undefined ? product.inStock : true,
                product.featured !== undefined ? product.featured : false,
                id
            ]
        );
        return result.rows[0];
    },
    
    delete: async (id) => {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

// Message functions
const messageDb = {
    getAll: async () => {
        const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        return result.rows;
    },
    
    getById: async (id) => {
        const result = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
        return result.rows[0];
    },
    
    create: async (message) => {
        const result = await pool.query(
            `INSERT INTO messages (name, email, subject, message, status)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                message.name,
                message.email,
                message.subject || '',
                message.message,
                message.status || 'unread'
            ]
        );
        return result.rows[0];
    },
    
    updateStatus: async (id, status) => {
        const result = await pool.query(
            'UPDATE messages SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    },
    
    delete: async (id) => {
        const result = await pool.query('DELETE FROM messages WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

// Subscriber functions
const subscriberDb = {
    getAll: async () => {
        const result = await pool.query('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
        return result.rows;
    },
    
    getByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM subscribers WHERE email = $1', [email]);
        return result.rows[0];
    },
    
    create: async (email) => {
        const result = await pool.query(
            'INSERT INTO subscribers (email) VALUES ($1) RETURNING *',
            [email]
        );
        return result.rows[0];
    },
    
    updateStatus: async (email, status) => {
        const result = await pool.query(
            'UPDATE subscribers SET status = $1 WHERE email = $2 RETURNING *',
            [status, email]
        );
        return result.rows[0];
    },
    
    delete: async (email) => {
        const result = await pool.query('DELETE FROM subscribers WHERE email = $1 RETURNING *', [email]);
        return result.rows[0];
    }
};

// Initialize database on module load
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
});

module.exports = {
    pool,
    adminDb,
    productDb,
    messageDb,
    subscriberDb
};
