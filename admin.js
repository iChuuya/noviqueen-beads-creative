// ===================================
// API Configuration
// ===================================
const API_BASE = '/api';

// ===================================
// Authentication
// ===================================
const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginAlert = document.getElementById('loginAlert');

// Check if already logged in
if (sessionStorage.getItem('isLoggedIn') === 'true') {
    showDashboard();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Attempting login...', { username });
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            sessionStorage.setItem('isLoggedIn', 'true');
            showAlert(loginAlert, 'Login successful!', 'success');
            setTimeout(() => {
                showDashboard();
                loadProducts();
            }, 500);
        } else {
            showAlert(loginAlert, data.message || 'Invalid credentials', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert(loginAlert, `Login failed: ${error.message}. Make sure the server is running.`, 'danger');
    }
});

function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadProducts();
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    location.reload();
}

// ===================================
// Products Management
// ===================================
const productsContainer = document.getElementById('productsContainer');
const dashboardAlert = document.getElementById('dashboardAlert');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');

let currentEditId = null;

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        
        displayProducts(products);
        updateStats(products);
    } catch (error) {
        showAlert(dashboardAlert, 'Failed to load products', 'danger');
    }
}

function displayProducts(products) {
    if (products.length === 0) {
        productsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 3rem;">No products yet. Click "Add New Product" to get started!</p>';
        return;
    }
    
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x500/E8D5C4/8B4513?text=No+Image'">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">₱${product.price.toLocaleString()}</p>
                <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1rem;">${truncateText(product.description, 80)}</p>
                
                <div class="product-status">
                    ${product.inStock 
                        ? '<span class="badge badge-success">In Stock</span>' 
                        : '<span class="badge badge-danger">Out of Stock</span>'}
                    ${product.featured 
                        ? '<span class="badge badge-warning">Featured</span>' 
                        : ''}
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="editProduct(${product.id})" style="flex: 1;">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})" style="flex: 1;">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats(products) {
    const total = products.length;
    const inStock = products.filter(p => p.inStock).length;
    const outOfStock = total - inStock;
    
    document.getElementById('totalProducts').textContent = total;
    document.getElementById('inStockProducts').textContent = inStock;
    document.getElementById('outOfStockProducts').textContent = outOfStock;
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// ===================================
// Modal Functions
// ===================================
function openAddModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    document.getElementById('imagePreview').classList.remove('show');
    productModal.classList.add('active');
}

async function editProduct(id) {
    currentEditId = id;
    modalTitle.textContent = 'Edit Product';
    
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        const product = await response.json();
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productInStock').checked = product.inStock;
        document.getElementById('productFeatured').checked = product.featured;
        
        const preview = document.getElementById('imagePreview');
        preview.src = product.image;
        preview.classList.add('show');
        
        productModal.classList.add('active');
    } catch (error) {
        showAlert(dashboardAlert, 'Failed to load product details', 'danger');
    }
}

function closeModal() {
    productModal.classList.remove('active');
    productForm.reset();
    currentEditId = null;
}

// ===================================
// Form Submission
// ===================================
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    
    // Add checkbox values explicitly as strings
    formData.set('inStock', document.getElementById('productInStock').checked ? 'true' : 'false');
    formData.set('featured', document.getElementById('productFeatured').checked ? 'true' : 'false');
    
    try {
        let response;
        if (currentEditId) {
            // Update existing product
            response = await fetch(`${API_BASE}/products/${currentEditId}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            // Create new product
            response = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                body: formData
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(dashboardAlert, 
                currentEditId ? 'Product updated successfully!' : 'Product added successfully!', 
                'success');
            closeModal();
            loadProducts();
        } else {
            showAlert(dashboardAlert, 'Failed to save product', 'danger');
        }
    } catch (error) {
        showAlert(dashboardAlert, 'An error occurred', 'danger');
    }
});

// ===================================
// Delete Product
// ===================================
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(dashboardAlert, 'Product deleted successfully!', 'success');
            loadProducts();
        } else {
            showAlert(dashboardAlert, 'Failed to delete product', 'danger');
        }
    } catch (error) {
        showAlert(dashboardAlert, 'An error occurred', 'danger');
    }
}

// ===================================
// Image Preview
// ===================================
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.classList.add('show');
        };
        reader.readAsDataURL(file);
    }
}

// ===================================
// Utility Functions
// ===================================
function showAlert(element, message, type) {
    element.textContent = message;
    element.className = `alert alert-${type} show`;
    
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function refreshProducts() {
    loadProducts();
    showAlert(dashboardAlert, 'Products refreshed!', 'success');
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal.classList.contains('active')) {
        closeModal();
    }
});

// Close modal when clicking outside
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
        closeModal();
    }
});

// ===================================
// Messages Management
// ===================================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'products') {
        document.getElementById('productsTab').classList.add('active');
        document.querySelector('.tab-btn:first-child').classList.add('active');
    } else if (tabName === 'messages') {
        document.getElementById('messagesTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        loadMessages();
    } else if (tabName === 'subscribers') {
        document.getElementById('subscribersTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        loadSubscribers();
    }
}

async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE}/messages`);
        const messages = await response.json();
        
        const container = document.getElementById('messagesContainer');
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="no-messages">No messages yet</div>';
            updateUnreadBadge(0);
            return;
        }
        
        const unreadCount = messages.filter(m => !m.read).length;
        updateUnreadBadge(unreadCount);
        
        container.innerHTML = messages.map(msg => `
            <div class="message-card ${msg.read ? '' : 'unread'}">
                <div class="message-header">
                    <div class="message-info">
                        <h4>${msg.name}</h4>
                        <p>${msg.email}</p>
                    </div>
                    <div class="message-meta">
                        <div>${new Date(msg.date).toLocaleDateString()}</div>
                        <div>${new Date(msg.date).toLocaleTimeString()}</div>
                        ${!msg.read ? '<div style="color: #8B4513; font-weight: bold;">NEW</div>' : ''}
                    </div>
                </div>
                <div class="message-body">
                    ${msg.message}
                </div>
                <div class="message-actions">
                    ${!msg.read ? `<button class="btn btn-small btn-primary" onclick="markAsRead(${msg.id})">Mark as Read</button>` : ''}
                    <button class="btn btn-small btn-danger" onclick="deleteMessage(${msg.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading messages:', error);
        showAlert(dashboardAlert, 'Failed to load messages', 'error');
    }
}

async function markAsRead(messageId) {
    try {
        const response = await fetch(`${API_BASE}/messages/${messageId}`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            loadMessages();
            showAlert(dashboardAlert, 'Message marked as read', 'success');
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
        showAlert(dashboardAlert, 'Failed to update message', 'error');
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/messages/${messageId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadMessages();
            showAlert(dashboardAlert, 'Message deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        showAlert(dashboardAlert, 'Failed to delete message', 'error');
    }
}

function updateUnreadBadge(count) {
    const badge = document.getElementById('unreadBadge');
    if (count > 0) {
        badge.textContent = count;
    } else {
        badge.textContent = '';
    }
}

// Load messages periodically to check for new ones
setInterval(() => {
    // Only update badge if on products tab to not disrupt viewing messages
    if (document.getElementById('productsTab').classList.contains('active')) {
        fetch(`${API_BASE}/messages`)
            .then(res => res.json())
            .then(messages => {
                const unreadCount = messages.filter(m => !m.read).length;
                updateUnreadBadge(unreadCount);
            })
            .catch(err => console.error('Error checking messages:', err));
    }
}, 30000); // Check every 30 seconds

// ===================================
// Subscribers Management
// ===================================

async function loadSubscribers() {
    try {
        const response = await fetch(`${API_BASE}/subscribers`);
        const subscribers = await response.json();
        
        const container = document.getElementById('subscribersContainer');
        const badge = document.getElementById('subscriberCount');
        
        badge.textContent = subscribers.length || '';
        
        if (subscribers.length === 0) {
            container.innerHTML = '<div class="no-subscribers">No subscribers yet</div>';
            return;
        }
        
        container.innerHTML = `
            <div style="margin-bottom: 1rem; color: #6B5446;">
                <strong>${subscribers.length}</strong> subscriber${subscribers.length !== 1 ? 's' : ''} total
            </div>
            ${subscribers.map(sub => `
                <div class="subscriber-item">
                    <div>
                        <div class="subscriber-email">${sub.email}</div>
                        <div class="subscriber-date">Subscribed: ${new Date(sub.date).toLocaleDateString()} at ${new Date(sub.date).toLocaleTimeString()}</div>
                    </div>
                    <button class="btn btn-small btn-danger" onclick="deleteSubscriber(${sub.id})">Delete</button>
                </div>
            `).join('')}
        `;
        
    } catch (error) {
        console.error('Error loading subscribers:', error);
        showAlert(dashboardAlert, 'Failed to load subscribers', 'error');
    }
}

async function deleteSubscriber(subscriberId) {
    if (!confirm('Are you sure you want to remove this subscriber?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/subscribers/${subscriberId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadSubscribers();
            showAlert(dashboardAlert, 'Subscriber removed successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        showAlert(dashboardAlert, 'Failed to remove subscriber', 'error');
    }
}

async function exportEmails() {
    try {
        const response = await fetch(`${API_BASE}/subscribers`);
        const subscribers = await response.json();
        
        if (subscribers.length === 0) {
            alert('No subscribers to export');
            return;
        }
        
        const emails = subscribers.map(s => s.email).join(', ');
        
        // Try modern Clipboard API first (works better on mobile)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(emails);
                alert(`✅ ${subscribers.length} email addresses copied to clipboard!\n\nYou can now paste them into:\n• Gmail (BCC field)\n• Mailchimp\n• Facebook Custom Audience\n• Any email marketing tool`);
                return;
            } catch (clipboardError) {
                console.log('Clipboard API failed, trying fallback method');
            }
        }
        
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = emails;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert(`✅ ${subscribers.length} email addresses copied to clipboard!\n\nYou can now paste them into:\n• Gmail (BCC field)\n• Mailchimp\n• Facebook Custom Audience\n• Any email marketing tool`);
            } else {
                throw new Error('Copy command failed');
            }
        } catch (err) {
            // If all methods fail, show the emails in an alert so user can manually copy
            alert(`Copy failed. Here are the emails:\n\n${emails}\n\nPlease select and copy them manually.`);
        } finally {
            document.body.removeChild(textarea);
        }
        
    } catch (error) {
        console.error('Error exporting emails:', error);
        alert('Failed to export emails');
    }
}

// Load subscriber count periodically
setInterval(() => {
    fetch(`${API_BASE}/subscribers`)
        .then(res => res.json())
        .then(subscribers => {
            document.getElementById('subscriberCount').textContent = subscribers.length || '';
        })
        .catch(err => console.error('Error checking subscribers:', err));
}, 30000); // Check every 30 seconds

// ===================================
// Backup Products Function
// ===================================

async function downloadProductsBackup() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        
        if (products.length === 0) {
            alert('No products to backup');
            return;
        }
        
        // Create JSON file
        const dataStr = JSON.stringify(products, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`✅ Backup downloaded!\n\n${products.length} products saved.\n\nSend this file to your developer to save permanently to GitHub.`);
        
    } catch (error) {
        console.error('Error downloading backup:', error);
        alert('Failed to download backup');
    }
}

console.log('Admin panel loaded successfully! 🎨⚙️');
