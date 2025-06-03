/*
Plugin Name: Woo Save Cart
Description: Save and restore WooCommerce cart using localStorage without login.
Version: 1.1
Author: Your Name
*/

if (!defined('ABSPATH')) exit;

// Enqueue frontend JS only on cart page
add_action('wp_enqueue_scripts', 'woo_save_cart_enqueue_scripts');
function woo_save_cart_enqueue_scripts() {
    if (is_cart()) {
        wp_enqueue_script('woo-save-cart-js', plugin_dir_url(__FILE__) . 'save-cart.js', array('jquery'), '1.1', true);
        wp_localize_script('woo-save-cart-js', 'SaveCartData', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('save_cart_nonce'),
            'enable_auto_save' => get_option('woo_save_cart_auto_save', 'yes'),
            'cart_expiry_hours' => get_option('woo_save_cart_expiry_hours', 24),
            'text_restore_prompt' => __('You have a saved cart. ', 'woo-save-cart'),
            'text_click_restore' => __('Click to restore', 'woo-save-cart')
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

// Add settings page in admin
add_action('admin_menu', 'woo_save_cart_admin_menu');
function woo_save_cart_admin_menu() {
    add_options_page(
        __('Woo Save Cart Settings', 'woo-save-cart'),
        __('Woo Save Cart', 'woo-save-cart'),
        'manage_options',
        'woo-save-cart',
        'woo_save_cart_settings_page'
    );
}

// Register settings
add_action('admin_init', 'woo_save_cart_register_settings');
function woo_save_cart_register_settings() {
    register_setting('woo_save_cart_settings', 'woo_save_cart_auto_save');
    register_setting('woo_save_cart_settings', 'woo_save_cart_expiry_hours');
}

// Settings page UI
function woo_save_cart_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php _e('Woo Save Cart Settings', 'woo-save-cart'); ?></h1>
        <form method="post" action="options.php">
            <?php settings_fields('woo_save_cart_settings'); ?>
            <?php do_settings_sections('woo_save_cart_settings'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row"><?php _e('Enable Auto Save?', 'woo-save-cart'); ?></th>
                    <td>
                        <select name="woo_save_cart_auto_save">
                            <option value="yes" <?php selected(get_option('woo_save_cart_auto_save'), 'yes'); ?>><?php _e('Yes', 'woo-save-cart'); ?></option>
                            <option value="no" <?php selected(get_option('woo_save_cart_auto_save'), 'no'); ?>><?php _e('No', 'woo-save-cart'); ?></option>
                        </select>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row"><?php _e('Cart Expiry Time (in hours)', 'woo-save-cart'); ?></th>
                    <td><input type="number" name="woo_save_cart_expiry_hours" value="<?php echo esc_attr(get_option('woo_save_cart_expiry_hours', 24)); ?>" min="1" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
