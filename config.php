<?php
/**
 * Sample Customer Application Configuration File (config.php)
 * Demonstration of minimal EliteGuard integration.
 */

// Define application database parameters (Existing customer app tables)
define('DB_HOST', 'localhost');
define('DB_USER', 'customer_user');
define('DB_PASS', 'secret123');
define('DB_NAME', 'vtu_app_db');

// EliteGuard Product Parameters
define('ELITE_ACCESS_KEY', 'ED-8F92-XK73-29PQ');
define('ELITE_SERVER', 'http://localhost:5173');
define('ELITE_APP_VERSION', '2.4.0');

// Initialize EliteGuard Central Protection
require_once __DIR__ . '/system/validator.php';

EliteAccess::check();
