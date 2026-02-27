const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { adminDb, productDb, messageDb, subscriberDb } = require('./database');

console.log('🔄 Starting data migration from JSON to PostgreSQL...\n');

async function migrate() {
    // Migrate admin data
    try {
        const adminFile = path.join(__dirname, 'data', 'admin.json');
        if (fs.existsSync(adminFile)) {
            const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf8'));
            
            // Check if admin already exists
            const existingAdmin = await adminDb.getByUsername(adminData.username);
            if (!existingAdmin) {
                await adminDb.create(adminData.username, adminData.password);
                console.log('✅ Admin data migrated');
            } else {
                console.log('ℹ️  Admin already exists in database');
            }
        }
    } catch (error) {
        console.error('❌ Error migrating admin data:', error.message);
    }

    // Migrate products
    try {
        const productsFile = path.join(__dirname, 'data', 'products.json');
        if (fs.existsSync(productsFile)) {
            const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
            
            let migratedCount = 0;
            let skippedCount = 0;
            
            for (const product of products) {
                try {
                    // Check if product with same name already exists
                    const allProducts = await productDb.getAll();
                    const existing = allProducts.find(p => p.name === product.name);
                    if (!existing) {
                        await productDb.create({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            category: product.category,
                            image: product.image,
                            inStock: product.inStock !== undefined ? product.inStock : true,
                            featured: product.featured !== undefined ? product.featured : false
                        });
                        migratedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (err) {
                    console.error(`❌ Error migrating product ${product.name}:`, err.message);
                }
            }
            
            console.log(`✅ Products migrated: ${migratedCount}, skipped (already exist): ${skippedCount}`);
        }
    } catch (error) {
        console.error('❌ Error migrating products:', error.message);
    }

    // Migrate messages
    try {
        const messagesFile = path.join(__dirname, 'messages.json');
        if (fs.existsSync(messagesFile)) {
            const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
            
            if (messages.length > 0) {
                let count = 0;
                for (const msg of messages) {
                    try {
                        await messageDb.create(msg);
                        count++;
                    } catch (err) {
                        console.error(`❌ Error migrating message:`, err.message);
                    }
                }
                console.log(`✅ Messages migrated: ${count}`);
            } else {
                console.log('ℹ️  No messages to migrate');
            }
        }
    } catch (error) {
        console.error('❌ Error migrating messages:', error.message);
    }

    // Migrate subscribers
    try {
        const subscribersFile = path.join(__dirname, 'subscribers.json');
        if (fs.existsSync(subscribersFile)) {
            const subscribers = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
            
            if (subscribers.length > 0) {
                let count = 0;
                for (const subscriber of subscribers) {
                    try {
                        const email = typeof subscriber === 'string' ? subscriber : subscriber.email;
                        const existing = await subscriberDb.getByEmail(email);
                        if (!existing) {
                            await subscriberDb.create(email);
                            count++;
                        }
                    } catch (err) {
                        console.error(`❌ Error migrating subscriber:`, err.message);
                    }
                }
                console.log(`✅ Subscribers migrated: ${count}`);
            } else {
                console.log('ℹ️  No subscribers to migrate');
            }
        }
    } catch (error) {
        console.error('❌ Error migrating subscribers:', error.message);
    }

    console.log('\n✨ Migration completed!\n');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
console.log('📁 Database location: ./data/noviqueen.db');
console.log('💡 You can now update server.js to use the database.');
console.log('💡 Recommendation: Keep JSON files as backup, but the app will now use SQLite.');
