#!/usr/bin/env node

/**
 * Database Viewer/Manager CLI
 * Simple command-line tool to view and manage database data
 * 
 * Usage:
 *   node db-viewer.js products           - View all products
 *   node db-viewer.js messages           - View all messages
 *   node db-viewer.js subscribers        - View all subscribers
 *   node db-viewer.js stats              - View database statistics
 *   node db-viewer.js backup             - Create database backup
 */

const { pool, adminDb, productDb, messageDb, subscriberDb } = require('./database');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0] || 'help';

// Helper to format table output
function printTable(data, title) {
    if (data.length === 0) {
        console.log(`\n📭 No ${title} found\n`);
        return;
    }
    
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  ${title.toUpperCase()} (${data.length} total)`);
    console.log(`═══════════════════════════════════════\n`);
    console.table(data);
}

// Command handlers
const commands = {
    help: () => {
        console.log(`
🗄️  NoviQueen Database Viewer/Manager

USAGE:
  node db-viewer.js [command]

COMMANDS:
  products      View all products
  messages      View all messages
  subscribers   View all subscribers
  stats         View database statistics
  help          Show this help message

EXAMPLES:
  node db-viewer.js products
  node db-viewer.js stats
        `);
    },

    products: async () => {
        const products = await productDb.getAll();
        const formatted = products.map(p => ({
            ID: p.id,
            Name: p.name.substring(0, 40),
            Price: `₱${p.price}`,
            Category: p.category,
            InStock: p.in_stock ? '✓' : '✗',
            Featured: p.featured ? '⭐' : '',
            Created: new Date(p.created_at).toLocaleDateString()
        }));
        printTable(formatted, 'Products');
        
        // Show full details of featured products
        const featured = products.filter(p => p.featured);
        if (featured.length > 0) {
            console.log('\n⭐ FEATURED PRODUCTS:\n');
            featured.forEach(p => {
                console.log(`  ${p.name}`);
                console.log(`  Price: ₱${p.price} | Category: ${p.category}`);
                console.log(`  ${p.description.substring(0, 100)}...`);
                console.log('');
            });
        }
    },

    messages: async () => {
        const messages = await messageDb.getAll();
        const formatted = messages.map(m => ({
            ID: m.id,
            Name: m.name,
            Email: m.email,
            Subject: m.subject || '(no subject)',
            Status: m.status === 'read' ? '📖 Read' : '📬 Unread',
            Date: new Date(m.created_at).toLocaleString()
        }));
        printTable(formatted, 'Messages');
        
        const unreadCount = messages.filter(m => m.status === 'unread').length;
        if (unreadCount > 0) {
            console.log(`\n⚠️  You have ${unreadCount} unread message(s)\n`);
        }
    },

    subscribers: async () => {
        const subscribers = await subscriberDb.getAll();
        const formatted = subscribers.map(s => ({
            ID: s.id,
            Email: s.email,
            Status: s.status === 'active' ? '✓ Active' : '✗ Inactive',
            'Subscribed On': new Date(s.subscribed_at).toLocaleDateString()
        }));
        printTable(formatted, 'Subscribers');
        
        const activeCount = subscribers.filter(s => s.status === 'active').length;
        console.log(`\n📊 Active subscribers: ${activeCount} out of ${subscribers.length}\n`);
    },

    stats: async () => {
        const products = await productDb.getAll();
        const messages = await messageDb.getAll();
        const subscribers = await subscriberDb.getAll();
        const admin = await adminDb.getByUsername('admin');

        console.log('\n═══════════════════════════════════════');
        console.log('  📊 DATABASE STATISTICS');
        console.log('═══════════════════════════════════════\n');

        console.log('📦 PRODUCTS:');
        console.log(`   Total: ${products.length}`);
        console.log(`   In Stock: ${products.filter(p => p.in_stock).length}`);
        console.log(`   Featured: ${products.filter(p => p.featured).length}`);
        
        const categories = [...new Set(products.map(p => p.category))];
        console.log(`   Categories: ${categories.join(', ')}`);
        
        const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length : 0;
        console.log(`   Average Price: ₱${avgPrice.toFixed(2)}`);

        console.log('\n💬 MESSAGES:');
        console.log(`   Total: ${messages.length}`);
        console.log(`   Unread: ${messages.filter(m => m.status === 'unread').length}`);
        console.log(`   Read: ${messages.filter(m => m.status === 'read').length}`);

        console.log('\n📧 SUBSCRIBERS:');
        console.log(`   Total: ${subscribers.length}`);
        console.log(`   Active: ${subscribers.filter(s => s.status === 'active').length}`);

        console.log('\n👤 ADMIN:');
        console.log(`   Username: ${admin ? admin.username : 'Not configured'}`);
        console.log(`   Created: ${admin ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}`);

        console.log('\n💾 DATABASE:');
        console.log(`   Type: PostgreSQL (Supabase)`);
        console.log(`   Connection: Active`);

        console.log('\n═══════════════════════════════════════\n');
    }
};

// Execute command
async function run() {
    const handler = commands[command];
    if (handler) {
        try {
            await handler();
        } catch (error) {
            console.error('\n❌ Error:', error.message, '\n');
        }
    } else {
        console.log(`\n❌ Unknown command: ${command}`);
        console.log('   Run "node db-viewer.js help" for usage information\n');
    }
    
    // Close database connection
    await pool.end();
    process.exit(0);
}

run();
