// public/orders.js - Order History Page Logic

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        if (orders.length === 0) {
            const noOrdersText = window.getTranslation ? window.getTranslation('orders.no_orders') : 'No orders found. Go to the ';
            const shopLinkText = window.getTranslation ? window.getTranslation('orders.no_orders_link') : 'shop';
            const noOrdersEndText = window.getTranslation ? window.getTranslation('orders.no_orders_end') : ' to create some orders!';
            
            document.getElementById('orders-list').innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
                        ${noOrdersText}<a href="index.html">${shopLinkText}</a>${noOrdersEndText}
                    </td>
                </tr>
            `;
            updateStats(orders);
            return;
        }

        // Calculate statistics
        updateStats(orders);

        // Generate table rows
        const ordersHtml = orders.map(order => {
            const date = new Date(order.created_at).toLocaleString();
            const amount = parseFloat(order.total_amount);
            let amountClass = 'amount-normal';
            if (amount <= 0) {
                amountClass = 'amount-exploited';
            } else if (amount < 1) {
                amountClass = 'amount-exploited';
            }
            
            // Format currency based on current language
            const formattedAmount = window.formatCurrency ? window.formatCurrency(amount) : `$${amount.toFixed(2)}`;
            
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${date}</td>
                    <td class="${amountClass}">${formattedAmount}</td>
                    <td>${order.status}</td>
                </tr>
            `;
        }).join('');

        document.getElementById('orders-list').innerHTML = ordersHtml;
        
    } catch (error) {
        document.getElementById('orders-list').innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #e53e3e;">
                    Error loading orders: ${error.message}
                </td>
            </tr>
        `;
    }
}

function updateStats(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const suspiciousOrders = orders.filter(order => parseFloat(order.total_amount) <= 1).length;
    
    // Calculate expected revenue (assuming suspicious orders should have been normal amounts)
    // For demo purposes, let's assume exploited orders should have been $50-100 average
    const exploitedOrders = orders.filter(order => parseFloat(order.total_amount) <= 0);
    const estimatedLostRevenue = exploitedOrders.length * 75; // Assume $75 average per exploited order

    document.getElementById('total-orders').textContent = totalOrders;
    
    // Format currency based on current language
    const formattedRevenue = window.formatCurrency ? window.formatCurrency(totalRevenue) : `$${totalRevenue.toFixed(2)}`;
    const formattedLostRevenue = window.formatCurrency ? window.formatCurrency(estimatedLostRevenue) : `$${estimatedLostRevenue.toFixed(2)}`;
    
    document.getElementById('total-revenue').textContent = formattedRevenue;
    document.getElementById('suspicious-orders').textContent = suspiciousOrders;
    document.getElementById('lost-revenue').textContent = formattedLostRevenue;
}

// Function to update currency displays when language changes
function updateCurrencyDisplay() {
    // This function will be called by i18n.js when language changes
    // It re-loads the orders to update currency formatting
    loadOrders();
    
    // Also update the initial placeholder values if no orders exist
    const currentLang = window.currentLanguage ? window.currentLanguage() : 'en';
    const currency = currentLang === 'pt' ? 'R$' : '$';
    
    const revenueEl = document.getElementById('total-revenue');
    const lostRevenueEl = document.getElementById('lost-revenue');
    
    if (revenueEl && revenueEl.textContent.includes('-')) {
        revenueEl.textContent = `${currency}-`;
    }
    if (lostRevenueEl && lostRevenueEl.textContent.includes('-')) {
        lostRevenueEl.textContent = `${currency}-`;
    }
}

// Expose function globally
window.loadOrders = loadOrders;
window.updateCurrencyDisplay = updateCurrencyDisplay;