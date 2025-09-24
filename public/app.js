// public/app.js - Shopping Cart Demo Frontend Logic

let currentOrderId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        const currentLang = window.currentLanguage ? window.currentLanguage() : 'en';
        const addToCartText = window.getTranslation ? window.getTranslation('index.add_to_cart') : '➕ Add to Cart';
        
        const productsHtml = products.map(product => {
            const price = window.formatCurrency ? window.formatCurrency(product.price) : `$${parseFloat(product.price).toFixed(2)}`;
            return `
                <div class="product">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                    </div>
                    <div class="product-price">${price}</div>
                    <div class="product-actions">
                        <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1">
                        <button onclick="addToCart(${product.id})">${addToCartText}</button>
                    </div>
                </div>
            `;
        }).join('');
        document.getElementById('products-list').innerHTML = productsHtml;
    } catch (error) {
        document.getElementById('products-list').innerHTML = 
            '<div class="error-msg">Error loading products: ' + error.message + '</div>';
    }
}

async function addToCart(productId) {
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity })
        });
        const result = await response.json();
        if (response.ok) {
            loadCart();
            showResult('success-msg', '✅ Item added to cart!');
        } else {
            showResult('error-msg', '❌ ' + result.error);
        }
    } catch (error) {
        showResult('error-msg', '❌ Error adding item: ' + error.message);
    }
}

async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const cart = await response.json();
        let total = 0;
        if (cart.items && cart.items.length > 0) {
            const cartHtml = cart.items.map(item => {
                const subtotal = window.formatCurrency ? window.formatCurrency(item.subtotal) : `$${parseFloat(item.subtotal).toFixed(2)}`;
                return `
                    <div class="cart-item">
                        <div>${item.name} x${item.quantity}</div>
                        <div>${subtotal}</div>
                    </div>
                `;
            }).join('');
            document.getElementById('cart-items').innerHTML = cartHtml;
            total = cart.total;
        } else {
            const emptyText = window.getTranslation ? window.getTranslation('index.empty_cart') : '🛒 Your cart is empty';
            document.getElementById('cart-items').innerHTML = `<div>${emptyText}</div>`;
        }
        
        // Update total label and value with currency conversion
        const currentLang = window.currentLanguage ? window.currentLanguage() : 'en';
        const totalLabel = document.querySelector('label[for="cart-total-input"]');
        if (totalLabel) {
            const totalText = window.getTranslation ? window.getTranslation('index.total') : 'Total';
            const currency = currentLang === 'pt' ? 'R$' : '$';
            totalLabel.textContent = `${totalText}: ${currency}`;
        }
        
        // Convert total for display
        const convertedTotal = window.formatCurrency ? parseFloat(total) * (currentLang === 'pt' ? 5 : 1) : total;
        document.getElementById('cart-total-input').value = convertedTotal.toFixed(2);
    } catch (error) {
        document.getElementById('cart-items').innerHTML = 
            '<div class="error-msg">Error loading cart: ' + error.message + '</div>';
    }
}

async function checkout() {
    try {
        // SECURITY FIX: No longer send client-supplied total (server calculates it)
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Empty body - server calculates total from cart
        });
        const result = await response.json();
        if (response.ok) {
            currentOrderId = result.order_id;
            showResult('success-msg', `✅ ${result.message} (Order #${result.order_id})`, 'checkout-result');
            document.getElementById('order-info').style.display = 'block';
            document.getElementById('order-details').innerHTML = 
                `Order #${result.order_id} - Total: $${result.total}`;
            loadCart();
        } else {
            showResult('error-msg', '❌ ' + result.error, 'checkout-result');
        }
    } catch (error) {
        showResult('error-msg', '❌ Checkout error: ' + error.message, 'checkout-result');
    }
}

async function clearCart() {
    try {
        const response = await fetch('/api/cart/clear', { method: 'DELETE' });
        const result = await response.json();
        if (response.ok) {
            loadCart();
            showResult('success-msg', '✅ Cart cleared!');
        } else {
            showResult('error-msg', '❌ ' + result.error);
        }
    } catch (error) {
        showResult('error-msg', '❌ Error clearing cart: ' + error.message);
    }
}

function showResult(className, message, targetId = null) {
    const resultDiv = document.createElement('div');
    resultDiv.className = `result ${className}`;
    resultDiv.innerHTML = message;
    const target = targetId ? document.getElementById(targetId) : document.body;
    const existingResult = target.querySelector('.result');
    if (existingResult) {
        existingResult.remove();
    }
    target.appendChild(resultDiv);
    setTimeout(() => {
        if (resultDiv.parentNode) {
            resultDiv.remove();
        }
    }, 5000);
}

// Expose functions for HTML onclick
window.clearCart = clearCart;
window.loadProducts = loadProducts;
window.checkout = checkout;
window.addToCart = addToCart;
