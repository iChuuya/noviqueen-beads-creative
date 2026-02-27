# Database Setup for NoviQueen Beads Creative

## Overview

Your application now uses **SQLite** database instead of JSON files for data storage. This provides better performance, data integrity, and scalability.

## Database Location

- **Path:** `./data/noviqueen.db`
- **Type:** SQLite 3
- **Database module:** `better-sqlite3`

## Database Schema

### Tables

#### 1. **admins**
Stores admin credentials
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- username (TEXT UNIQUE NOT NULL)
- password (TEXT NOT NULL) -- bcrypt hashed
- created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

#### 2. **products**
Stores product catalog
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- name (TEXT NOT NULL)
- description (TEXT)
- price (REAL NOT NULL)
- category (TEXT NOT NULL)
- image (TEXT)
- in_stock (INTEGER DEFAULT 1) -- 0 = false, 1 = true
- featured (INTEGER DEFAULT 0) -- 0 = false, 1 = true
- created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
- updated_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

#### 3. **messages**
Stores customer messages/inquiries
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- name (TEXT NOT NULL)
- email (TEXT NOT NULL)
- subject (TEXT)
- message (TEXT NOT NULL)
- status (TEXT DEFAULT 'unread') -- 'unread' or 'read'
- created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

#### 4. **subscribers**
Stores newsletter subscribers
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- email (TEXT UNIQUE NOT NULL)
- status (TEXT DEFAULT 'active') -- 'active' or 'inactive'
- subscribed_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

#### 5. **orders** (for future use)
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- customer_name (TEXT NOT NULL)
- customer_email (TEXT NOT NULL)
- customer_phone (TEXT)
- total_amount (REAL NOT NULL)
- status (TEXT DEFAULT 'pending')
- created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
- updated_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

#### 6. **order_items** (for future use)
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- order_id (INTEGER NOT NULL)
- product_id (INTEGER NOT NULL)
- quantity (INTEGER NOT NULL)
- price (REAL NOT NULL)
```

## Files

### Core Database Files

1. **`database.js`** - Database initialization and helper functions
   - Initializes database and creates tables
   - Provides wrapper functions for all CRUD operations
   - Exports: `adminDb`, `productDb`, `messageDb`, `subscriberDb`

2. **`migrate.js`** - Data migration script
   - Migrates existing JSON data to SQLite
   - Run once: `node migrate.js`

3. **`server.js`** - Updated to use database
   - All API endpoints now use database instead of JSON files
   - Maintains same API structure for backward compatibility

## Usage

### Starting the Server

```bash
npm start
# or
npm run dev  # with auto-reload
```

The database will be automatically initialized when you start the server.

### Migrating Data

If you have existing JSON data and want to migrate it:

```bash
node migrate.js
```

This is safe to run multiple times - it won't duplicate data.

### Default Admin Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change the default password after first login!

## Database Operations

### Using the Database Module

```javascript
const { adminDb, productDb, messageDb, subscriberDb } = require('./database');

// Get all products
const products = productDb.getAll();

// Get product by ID
const product = productDb.getById(1);

// Create new product
productDb.create({
  name: 'New Product',
  description: 'Description',
  price: 999.99,
  category: 'bags',
  image: '/uploads/image.jpg',
  inStock: true,
  featured: false
});

// Update product
productDb.update(1, { ...productData });

// Delete product
productDb.delete(1);
```

### Direct SQL Queries

For advanced queries:

```javascript
const { db } = require('./database');

// Read query
const stmt = db.prepare('SELECT * FROM products WHERE price > ?');
const expensiveProducts = stmt.all(1000);

// Write query
const insert = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
insert.run('Product Name', 999.99);
```

## Backup & Recovery

### Backup Database

```bash
# Copy the database file
cp data/noviqueen.db data/noviqueen.backup.db

# Or with timestamp
cp data/noviqueen.db "data/noviqueen.backup.$(date +%Y%m%d_%H%M%S).db"
```

### Restore from Backup

```bash
cp data/noviqueen.backup.db data/noviqueen.db
```

### Export to JSON (for backup)

The JSON files are kept as backup:
- `data/admin.json`
- `data/products.json`
- `messages.json`
- `subscribers.json`

## Viewing Database

### Using SQLite Command Line

```bash
# Install sqlite3 (if not installed)
# On Windows: download from https://www.sqlite.org/download.html
# On Mac: brew install sqlite
# On Linux: sudo apt-get install sqlite3

# Open database
sqlite3 data/noviqueen.db

# View tables
.tables

# View schema
.schema products

# Query data
SELECT * FROM products;

# Exit
.quit
```

### Using VS Code Extension

Install **SQLite Viewer** extension in VS Code:
1. Open Extensions (Ctrl+Shift+X)
2. Search "SQLite Viewer"
3. Install
4. Right-click `data/noviqueen.db` and select "Open SQLite Database"

### Using DB Browser for SQLite

Download from: https://sqlitebrowser.org/
- Free, open-source GUI tool
- Easy to view, edit, and query database

## Performance Benefits

✅ **Faster queries** - Native SQL indexing
✅ **Better concurrency** - Multiple read operations
✅ **Data integrity** - ACID compliance
✅ **Atomic operations** - No partial writes
✅ **Smaller file size** - Optimized storage
✅ **Relationships** - Foreign keys for future features

## Migration Rollback

If you need to go back to JSON files:

1. Stop the server
2. Restore the old `server.js` from git:
   ```bash
   git checkout HEAD -- server.js
   ```
3. The JSON files still exist as backup
4. Restart the server

## Future Enhancements

The database structure supports:
- 🛒 **Order management** (tables already created)
- 📊 **Analytics & reporting**
- 👥 **Customer accounts**
- 🏷️ **Product variants**
- 💬 **Product reviews**
- 🔍 **Advanced search & filtering**

## Troubleshooting

### Database is locked
- Close any other programs accessing the database
- Restart the server

### Migration issues
- Check that JSON files exist in correct locations
- Run migration again (it's safe)

### Can't find database file
- Database auto-creates on first server start
- Check `data/` directory exists

### Performance issues
- Add indexes for frequently queried columns
- Use prepared statements (already implemented)

## Support

For issues or questions about the database setup, check:
- SQLite docs: https://www.sqlite.org/docs.html
- better-sqlite3 docs: https://github.com/WiseLibs/better-sqlite3/wiki

---

**Database successfully set up! 🎉**

Your app now uses a professional database system while maintaining the same API structure.
