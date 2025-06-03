(function ($) {
    // Save cart items to localStorage
    function saveCartToLocal() {
        let cartItems = [];
        $('.cart_item').each(function () {
            const productId = $(this).data('product_id');
            const qty = $(this).find('.qty').val();
            if (productId && qty) {
                cartItems.push({ id: productId, qty: qty });
            }
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
        const expiryTime = parseInt(SaveCartData.cart_expiry_hours) * 3600000;

        if (now - cart.timestamp > expiryTime) {
            alert('Saved cart expired!');
            localStorage.removeItem('woo_saved_cart');
            return;
        }

        cart.items.forEach(item => {
            $.post(SaveCartData.ajax_url, {
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

    // DOM Ready
    $(function () {
        const container = `
            <div class="woo-save-cart-buttons" style="margin-top: 1em;">
                <button id="save-cart" class="button"><?php _e('Save Cart', 'woo-save-cart'); ?></button>
                <button id="restore-cart" class="button"><?php _e('Restore Cart', 'woo-save-cart'); ?></button>
                <button id="clear-saved-cart" class="button"><?php _e('Clear Saved', 'woo-save-cart'); ?></button>
            </div>
        `;
        $(container).appendTo('.cart_totals');

        $('#save-cart').on('click', saveCartToLocal);
        $('#restore-cart').on('click', loadCartFromLocal);
        $('#clear-saved-cart').on('click', clearSavedCart);

        // Optional Auto-Save
        if (SaveCartData.enable_auto_save === 'yes') {
            setInterval(saveCartToLocal, 30000);
        }

        // Reminder UI
        if (localStorage.getItem('woo_saved_cart')) {
            const notice = `
                <div class="woocommerce-message">
                    ${SaveCartData.text_restore_prompt}
                    <a href="#" id="quick-restore">${SaveCartData.text_click_restore}</a>
                </div>`;
            $('.woocommerce-notices-wrapper').prepend(notice);

            $(document).on('click', '#quick-restore', function (e) {
                e.preventDefault();
                loadCartFromLocal();
            });
        }
    });
})(jQuery);
