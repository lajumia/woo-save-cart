/*
Plugin Name: Woo Save Cart
Description: Save and restore WooCommerce cart using localStorage without login.
Version: 1.0
Author: Your Name
*/

if (!defined('ABSPATH')) exit;

// Enqueue frontend JS only on cart page
add_action('wp_enqueue_scripts', 'woo_save_cart_enqueue_scripts');
function woo_save_cart_enqueue_scripts() {
    if (is_cart()) {
        wp_enqueue_script('woo-save-cart-js', plugin_dir_url(__FILE__) . 'save-cart.js', array('jquery'), '1.0', true);
        wp_localize_script('woo-save-cart-js', 'SaveCartData', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('save_cart_nonce')
        ));
    }
}

// Handle AJAX to restore cart items
add_action('wp_ajax_restore_cart_item', 'woo_restore_cart_item');
add_action('wp_ajax_nopriv_restore_cart_item', 'woo_restore_cart_item');
function woo_restore_cart_item() {
    check_ajax_referer('save_cart_nonce', '_wpnonce');

    $product_id = intval($_POST['product_id']);
    $quantity   = intval($_POST['quantity']);

    if ($product_id && $quantity) {
        WC()->cart->add_to_cart($product_id, $quantity);
        wp_send_json_success();
    } else {
        wp_send_json_error('Invalid product data');
    }
}
