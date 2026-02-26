// ===================================
// API Configuration
// ===================================
const API_BASE = 'http://localhost:3000/api';
let allProducts = [];

// ===================================
// Mobile Navigation Toggle
// ===================================
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
if (navLinks.length > 0 && navMenu && navToggle) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// ===================================
// Smooth Scrolling for Navigation Links
// ===================================
if (navLinks.length > 0) {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ===================================
// Active Navigation Link on Scroll
// ===================================
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }
    }
});

// ===================================
// Product Filter
// ===================================
const filterButtons = document.querySelectorAll('.filter-btn');

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    // Add fade-in animation
                    card.style.animation = 'fadeInUp 0.6s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===================================
// Load Products from API
// ===================================
async function loadProducts() {
    console.log('Loading products from API...');
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        console.log(`Successfully loaded ${allProducts.length} products`);
        
        displayProducts(allProducts);
        attachProductListeners();
    } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to placeholder if API is not available
        displayFallbackMessage();
    }
}

function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    
    if (!productGrid) {
        console.error('Product grid not found');
        return;
    }
    
    if (products.length === 0) {
        productGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem;">No products available yet.</p>';
        return;
    }
    
    productGrid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x500/E8D5C4/8B4513?text=No+Image'">
                <div class="product-overlay">
                    <button class="btn-quick-view" data-product-id="${product.id}">Quick View</button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${truncateText(product.description, 60)}</p>
                <p class="product-price">₱${product.price.toLocaleString()}</p>
                ${!product.inStock ? '<p style="color: #dc3545; font-weight: 500; font-size: 0.9rem;">Out of Stock</p>' : ''}
            </div>
        </div>
    `).join('');
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function displayFallbackMessage() {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        productGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem; color: #dc3545;">⚠️ Could not load products. Please make sure the server is running (npm start).</p>';
    }
}

// ===================================
// Product Modal
// ===================================
const modal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalClose = document.querySelector('.modal-close');

function attachProductListeners() {
    const quickViewButtons = document.querySelectorAll('.btn-quick-view');
    
    if (quickViewButtons.length === 0) return;
    
    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(button.getAttribute('data-product-id'));
            const product = allProducts.find(p => p.id === productId);
            
            if (product && modal) {
                if (modalImage) {
                    modalImage.src = product.image;
                    modalImage.alt = product.name;
                }
                if (modalTitle) modalTitle.textContent = product.name;
                if (modalPrice) modalPrice.textContent = `₱${product.price.toLocaleString()}`;
                if (modalDescription) modalDescription.textContent = product.description;
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
}

// Close modal
if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

// Close modal when clicking outside
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ===================================
// Contact Form Submission
// ===================================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        try {
            const response = await fetch(`${API_BASE}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(`Thank you ${name}! Your message has been sent successfully. We'll get back to you soon!`);
                contactForm.reset();
            } else {
                alert('Failed to send message. Please try again or contact us on Facebook.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again or contact us on Facebook.');
        }
    });
}

// ===================================
// Newsletter Form Submission
// ===================================
const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        if (emailInput) {
            const email = emailInput.value;
            
            try {
                const response = await fetch(`${API_BASE}/subscribers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert(`Thank you for subscribing! We'll send updates to ${email}`);
                    newsletterForm.reset();
                } else {
                    alert(data.error || 'Failed to subscribe. Please try again.');
                }
            } catch (error) {
                console.error('Error subscribing:', error);
                alert('Failed to subscribe. Please try again.');
            }
        }
    });
}

// ===================================
// Animate Elements on Scroll
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all product cards, stats, and contact items
document.querySelectorAll('.product-card, .stat, .contact-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ===================================
// Order Now Button in Modal
// ===================================
if (modal && modalTitle && modalPrice) {
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-primary') && e.target.textContent === 'Order Now') {
            // Will redirect via the HTML anchor tag to Facebook
            // No JS action needed
        }
    });
}

// ===================================
// Initialize - Load Products
// ===================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // Load products from API
    loadProducts();
});

// ===================================
// Prevent Right Click on Images (Optional)
// ===================================
// Uncomment if you want to protect product images
/*
document.querySelectorAll('.product-image img, .modal-image img').forEach(img => {
    img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
});
*/

console.log('NoviQueen Beads Creative website loaded successfully! 🎨✨');
