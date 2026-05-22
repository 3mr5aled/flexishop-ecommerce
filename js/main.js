// Products database
const PRODUCTS = [
    {
        id: 1,
        name: "Studio Desk Lamp",
        category: "lighting",
        price: 180,
        desc: "A modern cantilever design crafted in brushed brass and powder-coated steel.",
        gradient: "linear-gradient(135deg, #d4af37, #222)"
    },
    {
        id: 2,
        name: "Leather Folio Portfolio",
        category: "leather",
        price: 120,
        desc: "Full-grain vegetable-tanned leather sleeve with dynamic hardware closure.",
        gradient: "linear-gradient(135deg, #8b5a2b, #3e2723)"
    },
    {
        id: 3,
        name: "Ceramic Water Pitcher",
        category: "ceramics",
        price: 65,
        desc: "Hand-thrown stoneware water vessel finished with a organic matte clay slip.",
        gradient: "linear-gradient(135deg, #dfd0be, #8d7b68)"
    },
    {
        id: 4,
        name: "Solid Brass Incense Block",
        category: "accessories",
        price: 45,
        desc: "Precision milled solid brass block with dynamic structural slot.",
        gradient: "linear-gradient(135deg, #c59b27, #6d4c41)"
    },
    {
        id: 5,
        name: "Minimal Wall Sconce",
        category: "lighting",
        price: 210,
        desc: "Cast architectural concrete backing paired with a frosted orb glass shade.",
        gradient: "linear-gradient(135deg, #e0e0e0, #424242)"
    },
    {
        id: 6,
        name: "Stoneware Tea Bowls (Set)",
        category: "ceramics",
        price: 75,
        desc: "Set of three wheel-thrown nesting tea cups with volcanic ash glaze details.",
        gradient: "linear-gradient(135deg, #a1887f, #3e2723)"
    }
];

// App State
let cart = JSON.parse(localStorage.getItem('flexishop_cart')) || [];
let activeCategory = 'all';
let maxPrice = 300;
let searchQuery = '';
let currentSort = 'featured';

document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icon Loader
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // UI Initializations
    initDrawer();
    initFilters();
    initCheckout();
    renderProducts();
    updateCartUI();
    initAIStylist();
});

// 1. Render Product Catalog
function renderProducts() {
    const grid = document.getElementById('product-grid');
    const resultsCount = document.getElementById('results-count');
    if (!grid) return;
    
    // Filtering
    let filtered = PRODUCTS.filter(prod => {
        const matchesCategory = activeCategory === 'all' || prod.category === activeCategory;
        const matchesPrice = prod.price <= maxPrice;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             prod.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesPrice && matchesSearch;
    });
    
    // Sorting
    if (currentSort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    }
    
    // Update Results label
    resultsCount.textContent = `Showing ${filtered.length} products`;
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: hsl(var(--text-muted));">
                <i data-lucide="search" style="width:40px; height:40px; stroke-width: 1px; margin-bottom: 1rem;"></i>
                <p>No products match your active search criteria.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    // Build grid HTML
    grid.innerHTML = filtered.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-img-box">
                <div class="product-visual-placeholder" style="background: ${product.gradient}"></div>
            </div>
            <div class="product-info-box">
                <div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.desc}</p>
                </div>
                <div class="product-footer">
                    <span class="product-price">$${product.price}.00</span>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})" aria-label="Add to cart">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// 2. Filters & Searches Interactivity
function initFilters() {
    const categories = document.querySelectorAll('#category-list .category-item');
    const priceRange = document.getElementById('price-range');
    const priceValLabel = document.getElementById('price-val');
    const globalSearch = document.getElementById('global-search');
    const sortSelect = document.getElementById('sort-select');
    
    // Category items
    categories.forEach(item => {
        item.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            activeCategory = item.getAttribute('data-category');
            renderProducts();
        });
    });
    
    // Price range slider
    if (priceRange && priceValLabel) {
        priceRange.addEventListener('input', (e) => {
            maxPrice = parseInt(e.target.value);
            priceValLabel.textContent = maxPrice;
            renderProducts();
        });
    }
    
    // Live Search
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderProducts();
        });
    }
    
    // Sorting
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }
}

// 3. Side Drawer Actions
function initDrawer() {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartTrigger = document.getElementById('cart-trigger');
    const cartClose = document.getElementById('cart-close');
    const emptyShopBtn = document.getElementById('empty-cart-shop-btn');
    
    function openCart() {
        cartOverlay.classList.add('active');
        cartDrawer.classList.add('active');
    }
    
    function closeCart() {
        cartOverlay.classList.remove('active');
        cartDrawer.classList.remove('active');
    }
    
    if (cartTrigger) cartTrigger.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (emptyShopBtn) {
        emptyShopBtn.addEventListener('click', (e) => {
            closeCart();
        });
    }
    
    window.openCartDrawer = openCart; // Expose globally
}

// 4. Cart Engine Functions
window.addToCart = function(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    const cartItem = cart.find(item => item.product.id === productId);
    
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ product, quantity: 1 });
    }
    
    syncCart();
    updateCartUI();
    window.openCartDrawer();
};

window.updateQty = function(productId, delta) {
    const cartItem = cart.find(item => item.product.id === productId);
    if (!cartItem) return;
    
    cartItem.quantity += delta;
    if (cartItem.quantity <= 0) {
        cart = cart.filter(item => item.product.id !== productId);
    }
    
    syncCart();
    updateCartUI();
};

window.deleteCartItem = function(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    syncCart();
    updateCartUI();
};

function syncCart() {
    localStorage.setItem('flexishop_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const countBadge = document.getElementById('cart-count');
    const countDrawer = document.getElementById('cart-count-drawer');
    const cartItemsWrapper = document.getElementById('cart-items');
    const subtotalLabel = document.getElementById('cart-subtotal');
    const shippingLabel = document.getElementById('cart-shipping');
    const totalLabel = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
    if (countBadge) countBadge.textContent = totalItems;
    if (countDrawer) countDrawer.textContent = totalItems;
    
    if (cart.length === 0) {
        if (cartItemsWrapper) {
            cartItemsWrapper.innerHTML = `
                <div class="empty-cart-message">
                    <i data-lucide="shopping-bag" class="empty-icon"></i>
                    <p>Your shopping bag is empty.</p>
                    <a href="#catalog" class="btn btn-luxury btn-sm" onclick="document.getElementById('cart-close').click()">Shop Collection</a>
                </div>
            `;
        }
        if (subtotalLabel) subtotalLabel.textContent = "$0.00";
        if (shippingLabel) shippingLabel.textContent = "Calculated at checkout";
        if (totalLabel) totalLabel.textContent = "$0.00";
        if (checkoutBtn) checkoutBtn.disabled = true;
        lucide.createIcons();
        return;
    }
    
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    // Render Items
    if (cartItemsWrapper) {
        cartItemsWrapper.innerHTML = cart.map(item => `
            <div class="cart-item-row">
                <div class="cart-item-img">
                    <div class="cart-item-img-placeholder" style="background: ${item.product.gradient}"></div>
                </div>
                <div class="cart-item-details">
                    <h4>${item.product.name}</h4>
                    <span class="cart-item-price">$${item.product.price}.00</span>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateQty(${item.product.id}, -1)">
                            <i data-lucide="minus" style="width:12px; height:12px;"></i>
                        </button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${item.product.id}, 1)">
                            <i data-lucide="plus" style="width:12px; height:12px;"></i>
                        </button>
                    </div>
                </div>
                <button class="cart-item-delete" onclick="deleteCartItem(${item.product.id})" aria-label="Remove item">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Calculations
    const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
    const shipping = subtotal >= 150 ? 0 : 15;
    const total = subtotal + shipping;
    
    if (subtotalLabel) subtotalLabel.textContent = `$${subtotal}.00`;
    if (shippingLabel) shippingLabel.textContent = shipping === 0 ? "Free" : `$${shipping}.00`;
    if (totalLabel) totalLabel.textContent = `$${total}.00`;
    
    lucide.createIcons();
}

// 5. Secure Checkout Process Simulation
function initCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const checkoutClose = document.getElementById('checkout-close');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutTotalBtn = document.getElementById('checkout-total-btn');
    const successView = document.getElementById('checkout-success-view');
    const successCloseBtn = document.getElementById('success-close-btn');
    
    function openCheckout() {
        // Calculate total
        const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
        const shipping = subtotal >= 150 ? 0 : 15;
        const total = subtotal + shipping;
        
        if (checkoutTotalBtn) checkoutTotalBtn.textContent = `$${total}.00`;
        checkoutOverlay.classList.add('active');
        // Close cart drawer
        document.getElementById('cart-overlay').click();
    }
    
    function closeCheckout() {
        checkoutOverlay.classList.remove('active');
        successView.classList.remove('active');
    }
    
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
    if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
    if (successCloseBtn) successCloseBtn.addEventListener('click', closeCheckout);
    
    // Order submission simulator
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('place-order-btn');
            const submitText = submitBtn.querySelector('span');
            
            submitBtn.disabled = true;
            submitText.textContent = 'Processing Payment...';
            
            setTimeout(() => {
                const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
                const shipping = subtotal >= 150 ? 0 : 15;
                const total = subtotal + shipping;
                
                // Show success view
                document.getElementById('order-id-val').textContent = `#FL-${Math.floor(10000 + Math.random() * 90000)}`;
                document.getElementById('order-total-val').textContent = `$${total}.00`;
                
                successView.classList.add('active');
                
                // Clear cart state
                cart = [];
                syncCart();
                updateCartUI();
                
                // Reset form button
                submitBtn.disabled = false;
                submitText.innerHTML = `Place Order — <span id="checkout-total-btn">$0.00</span>`;
                checkoutForm.reset();
            }, 2500);
        });
    }
}

// 6. AI Stylist Chat Engine
function initAIStylist() {
    const trigger = document.getElementById('ai-stylist-trigger');
    const windowEl = document.getElementById('ai-stylist-window');
    const closeBtn = document.getElementById('ai-stylist-close');
    const sendBtn = document.getElementById('ai-stylist-send');
    const inputEl = document.getElementById('ai-stylist-input');
    const messagesContainer = document.getElementById('ai-stylist-messages');

    if (!trigger || !windowEl) return;

    trigger.addEventListener('click', () => {
        windowEl.classList.toggle('active');
        if (windowEl.classList.contains('active')) {
            inputEl.focus();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            windowEl.classList.remove('active');
        });
    }

    const sendMessage = () => {
        const text = inputEl.value.trim();
        if (!text) return;

        appendStylistMessage(text, 'outgoing');
        inputEl.value = '';

        // Show typing indicator
        const typingId = showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator(typingId);
            const response = generateStylistResponse(text);
            appendStylistMessage(response.text, 'incoming', response.products);
        }, 1200);
    };

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (inputEl) {
        inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Expose chip click function globally
    window.sendStylistPrompt = function(promptText) {
        inputEl.value = promptText;
        sendMessage();
    };
}

function appendStylistMessage(text, direction, products = []) {
    const container = document.getElementById('ai-stylist-messages');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${direction}`;
    
    // Add text paragraph
    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);

    // Append products if any
    if (products && products.length > 0) {
        products.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'stylist-recommendation-card';
            card.innerHTML = `
                <div class="rec-img">
                    <div class="rec-img-placeholder" style="background: ${prod.gradient}"></div>
                </div>
                <div class="rec-details">
                    <h5>${prod.name}</h5>
                    <span class="rec-price">$${prod.price}.00</span>
                </div>
                <button class="btn-rec-add" onclick="addToCart(${prod.id})" aria-label="Add to cart">
                    <i data-lucide="plus"></i>
                </button>
            `;
            messageDiv.appendChild(card);
        });
    }

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    
    // Initialize icons in recommendations
    if (typeof lucide !== 'undefined') {
        lucide.createIcons({
            attrs: {
                class: 'lucide-icon'
            },
            nameAttr: 'data-lucide'
        });
    }
}

function showTypingIndicator() {
    const container = document.getElementById('ai-stylist-messages');
    if (!container) return null;

    const indicator = document.createElement('div');
    indicator.className = 'message incoming typing-indicator-wrapper';
    indicator.id = 'typing-' + Date.now();
    indicator.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
    return indicator.id;
}

function removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

function generateStylistResponse(userInput) {
    const text = userInput.toLowerCase();
    let reply = "";
    let matchedProducts = [];

    const productMap = {
        lighting: PRODUCTS.filter(p => p.category === 'lighting'),
        leather: PRODUCTS.filter(p => p.category === 'leather'),
        ceramics: PRODUCTS.filter(p => p.category === 'ceramics'),
        accessories: PRODUCTS.filter(p => p.category === 'accessories')
    };

    if (text.includes('light') || text.includes('lamp') || text.includes('sconce')) {
        reply = "Here are our premium lighting objects, designed to cast warm, gentle illumination:";
        matchedProducts = productMap.lighting;
    } else if (text.includes('leather') || text.includes('folio') || text.includes('portfolio') || text.includes('sleeve')) {
        reply = "I highly recommend our hand-stitched full-grain leather goods:";
        matchedProducts = productMap.leather;
    } else if (text.includes('ceramic') || text.includes('clay') || text.includes('pitcher') || text.includes('bowl') || text.includes('stoneware')) {
        reply = "These organic clay ceramics are hand-thrown by master artisans:";
        matchedProducts = productMap.ceramics;
    } else if (text.includes('brass') || text.includes('incense') || text.includes('accessory') || text.includes('accessories')) {
        reply = "Check out our solid brass incense block and other home accessories:";
        matchedProducts = productMap.accessories;
    } else if (text.includes('under 100') || text.includes('under $100') || text.includes('budget') || text.includes('cheap') || text.includes('affordable') || text.includes('gift')) {
        reply = "Here are some of our beautiful curated objects under $100:";
        matchedProducts = PRODUCTS.filter(p => p.price <= 100);
    } else if (text.includes('expensive') || text.includes('premium') || text.includes('luxury') || text.includes('gold')) {
        reply = "For high-end accent statements, these are our top-tier items:";
        matchedProducts = PRODUCTS.filter(p => p.price > 100);
    } else if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
        reply = "Hello! I can help you locate organic ceramics, leather goods, brass blocks, or lighting fixtures. Tell me what vibe or category you are exploring.";
    } else {
        reply = "I couldn't quite find a match for that specific term. Try asking about 'lighting', 'stoneware', 'leather', or 'items under $100'. Or check these curated essentials:";
        matchedProducts = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[3]]; // Mix
    }

    return {
        text: reply,
        products: matchedProducts
    };
}
