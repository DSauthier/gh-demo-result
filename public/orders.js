// public/orders.js - Order History Page Logic

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        if (orders.length === 0) {
            document.getElementById('orders-list').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                        No orders found. Go to the <a href="index.html">shop</a> to create some orders!
                    </td>
                </tr>
            `;
            updateStats(orders);
            return;
        }

        // Calculate statistics
        updateStats(orders);

        // Generate table rows (no notes column)
        const ordersHtml = orders.map(order => {
            const date = new Date(order.created_at).toLocaleString();
            const amount = parseFloat(order.total_amount);
            let amountClass = 'amount-normal';
            if (amount <= 0) {
                amountClass = 'amount-exploited';
            } else if (amount < 1) {
                amountClass = 'amount-exploited';
            }
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${date}</td>
                    <td class="${amountClass}">$${amount.toFixed(2)}</td>
                    <td>${order.status}</td>
                </tr>
            `;
        }).join('');

        document.getElementById('orders-list').innerHTML = ordersHtml;
        
    } catch (error) {
        document.getElementById('orders-list').innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #e53e3e;">
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
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('suspicious-orders').textContent = suspiciousOrders;
    document.getElementById('lost-revenue').textContent = `$${estimatedLostRevenue.toFixed(2)}`;
}

// Expose function globally
window.loadOrders = loadOrders;