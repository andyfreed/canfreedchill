<?php
/**
 * Theme functions
 */

function can_freed_chill_scripts() {
    // Enqueue your React app's assets
    wp_enqueue_script('can-freed-chill-js', get_template_directory_uri() . '/dist/assets/index.js', array(), '1.0.0', true);
    wp_enqueue_style('can-freed-chill-css', get_template_directory_uri() . '/dist/assets/index.css', array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'can_freed_chill_scripts');

// Remove admin bar
add_filter('show_admin_bar', '__return_false');

// Disable all default WordPress routes except for wp-admin
add_action('template_redirect', function() {
    if (!is_admin()) {
        global $wp_query;
        $wp_query->is_home = true;
        $wp_query->is_page = false;
        $wp_query->is_single = false;
        $wp_query->is_archive = false;
        $wp_query->is_category = false;
        $wp_query->is_tag = false;
        $wp_query->is_tax = false;
        $wp_query->is_author = false;
        $wp_query->is_date = false;
        $wp_query->is_search = false;
        $wp_query->is_404 = false;
    }
});