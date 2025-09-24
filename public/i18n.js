// i18n.js - Internationalization support for Portuguese (Brazil) and English (US)
// Currency conversion: 1 USD = 5 BRL

// Translation dictionary
const translations = {
  en: {
    // Orders page
    'orders.title': '📋 Order History',
    'orders.subtitle': 'View all orders and identify potential exploits',
    'orders.back_to_shop': '← Back to Shop', 
    'orders.refresh': '🔄 Refresh Orders',
    'orders.all_orders': '📊 All Orders',
    'orders.no_orders': 'No orders found. Go to the ',
    'orders.no_orders_link': 'shop',
    'orders.no_orders_end': ' to create some orders!',
    
    // Table headers
    'table.order_id': 'Order ID',
    'table.date': 'Date',
    'table.total_amount': 'Total Amount',
    'table.status': 'Status',
    
    // Stats
    'stats.total_orders': 'Total Orders',
    'stats.total_revenue': 'Total Revenue',
    'stats.suspicious_orders': 'Suspicious Orders',
    'stats.lost_revenue': 'Lost Revenue',
    
    // Index page
    'index.title': 'Internal Team IT Hardware Store',
    'index.subtitle': 'Get your home office items - Add items and checkout!',
    'index.view_orders': '📋 View Order History',
    'index.products': '🛍 Products',
    'index.cart': '🛒 Your Cart',
    'index.clear_cart': '🗑 Clear Cart',
    'index.refresh_products': '🔄 Refresh Products',
    'index.checkout': '💳 Checkout',
    'index.total': 'Total',
    'index.last_order': '📦 Last Order Details',
    'index.loading_products': 'Loading products...',
    'index.loading_cart': 'Loading cart...',
    'index.empty_cart': '🛒 Your cart is empty',
    'index.add_to_cart': '➕ Add to Cart'
  },
  
  pt: {
    // Orders page
    'orders.title': '📋 Histórico de Pedidos',
    'orders.subtitle': 'Visualize todos os pedidos e identifique possíveis explorações',
    'orders.back_to_shop': '← Voltar à Loja',
    'orders.refresh': '🔄 Atualizar Pedidos',
    'orders.all_orders': '📊 Todos os Pedidos',
    'orders.no_orders': 'Nenhum pedido encontrado. Vá para a ',
    'orders.no_orders_link': 'loja',
    'orders.no_orders_end': ' para criar alguns pedidos!',
    
    // Table headers
    'table.order_id': 'ID do Pedido',
    'table.date': 'Data',
    'table.total_amount': 'Valor Total',
    'table.status': 'Status',
    
    // Stats
    'stats.total_orders': 'Total de Pedidos',
    'stats.total_revenue': 'Receita Total',
    'stats.suspicious_orders': 'Pedidos Suspeitos',
    'stats.lost_revenue': 'Receita Perdida',
    
    // Index page
    'index.title': 'Loja Interna de Hardware de TI',
    'index.subtitle': 'Obtenha seus itens de home office - Adicione itens e finalize a compra!',
    'index.view_orders': '📋 Ver Histórico de Pedidos',
    'index.products': '🛍 Produtos',
    'index.cart': '🛒 Seu Carrinho',
    'index.clear_cart': '🗑 Limpar Carrinho',
    'index.refresh_products': '🔄 Atualizar Produtos',
    'index.checkout': '💳 Finalizar Compra',
    'index.total': 'Total',
    'index.last_order': '📦 Detalhes do Último Pedido',
    'index.loading_products': 'Carregando produtos...',
    'index.loading_cart': 'Carregando carrinho...',
    'index.empty_cart': '🛒 Seu carrinho está vazio',
    'index.add_to_cart': '➕ Adicionar ao Carrinho'
  }
};

// Currency conversion rate: 1 USD = 5 BRL
const CURRENCY_RATES = {
  en: { symbol: '$', rate: 1, name: 'USD' },
  pt: { symbol: 'R$', rate: 5, name: 'BRL' }
};

// Current language - defaults to English
let currentLanguage = localStorage.getItem('language') || 'en';

// Function to get translation for a key
function getTranslation(key) {
  return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Function to format currency based on current language
function formatCurrency(amount, language = currentLanguage) {
  const currency = CURRENCY_RATES[language];
  const convertedAmount = parseFloat(amount) * currency.rate;
  return `${currency.symbol}${convertedAmount.toFixed(2)}`;
}

// Function to switch language
function switchLanguage(lang) {
  if (!translations[lang]) return;
  
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  
  // Update all elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = getTranslation(key);
  });
  
  // Update language button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`lang-${lang}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Update document language attribute
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
  
  // Update currency displays if on orders page
  if (typeof updateCurrencyDisplay === 'function') {
    updateCurrencyDisplay();
  }
  
  // Reload data to update currency formatting
  if (typeof loadOrders === 'function') {
    loadOrders();
  }
  
  if (typeof loadCart === 'function') {
    loadCart();
  }
  
  if (typeof loadProducts === 'function') {
    loadProducts();
  }
}

// Function to initialize language on page load
function initializeLanguage() {
  // Set initial language button state
  const activeBtn = document.getElementById(`lang-${currentLanguage}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Apply translations to all elements
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = getTranslation(key);
  });
  
  // Set document language
  document.documentElement.lang = currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
  initializeLanguage();
}

// Export functions for global access
window.switchLanguage = switchLanguage;
window.getTranslation = getTranslation;
window.formatCurrency = formatCurrency;
window.currentLanguage = () => currentLanguage;