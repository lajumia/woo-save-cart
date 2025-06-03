// Save cart items to localStorage
function saveCartToLocal() {
    let cartItems = [];
    jQuery('.cart_item').each(function () {
        const productId = jQuery(this).data('product_id');
        const qty = jQuery(this).find('.qty').val();
        cartItems.push({ id: productId, qty: qty });
    });
    const savedCart = {
        items: cartItems,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('woo_saved_cart', JSON.stringify(savedCart));
    alert('Cart saved!');
}

// Load cart items from localStorage
function loadCartFromLocal() {
    const saved = localStorage.getItem('woo_saved_cart');
    if (!saved) return alert('No saved cart found!');

    const cart = JSON.parse(saved);
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - cart.timestamp > oneDay) {
        alert('Saved cart expired!');
        localStorage.removeItem('woo_saved_cart');
        return;
    }

    cart.items.forEach(item => {
        jQuery.post(SaveCartData.ajax_url, {
            action: 'restore_cart_item',
            product_id: item.id,
            quantity: item.qty,
            _wpnonce: SaveCartData.nonce
        });
    });

    setTimeout(() => location.reload(), 1500);
}

// Clear saved cart
function clearSavedCart() {
    localStorage.removeItem('woo_saved_cart');
    alert('Saved cart cleared!');
}

jQuery(document).ready(function () {
    jQuery('<div class=\"woo-save-cart-buttons\">' +
        '<button id=\"save-cart\">Save Cart</button>' +
        '<button id=\"restore-cart\">Restore Cart</button>' +
        '<button id=\"clear-saved-cart\">Clear Saved</button>' +
        '</div>').appendTo('.cart_totals');

    jQuery('#save-cart').on('click', saveCartToLocal);
    jQuery('#restore-cart').on('click', loadCartFromLocal);
    jQuery('#clear-saved-cart').on('click', clearSavedCart);

    // Optional Auto-Save every 30 seconds
    setInterval(saveCartToLocal, 30000);

    // Reminder UI on load
    if (localStorage.getItem('woo_saved_cart')) {
        const notice = '<div class=\"woocommerce-message\">You have a saved cart. <a href=\"#\" id=\"quick-restore\">Click to restore</a></div>';
        jQuery('.woocommerce-notices-wrapper').prepend(notice);
        jQuery(document).on('click', '#quick-restore', function (e) {
            e.preventDefault();
            loadCartFromLocal();
        });
    }
});
