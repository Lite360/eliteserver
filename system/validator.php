<?php
/**
 * EliteGuard Validator Main Entrypoint
 * Invoked directly inside customer application's config.php
 *
 * Example Usage:
 *   require_once __DIR__ . '/system/validator.php';
 *   EliteAccess::check();
 */

require_once __DIR__ . '/client.php';
require_once __DIR__ . '/security.php';

class EliteAccess {
    
    /**
     * Perform validation check on current request
     */
    public static function check(): void {
        if (!defined('ELITE_ACCESS_KEY')) {
            self::deny('Access key is missing in config initialization.');
        }

        // Validate installation with central EliteGuard server
        $result = EliteClient::validate();

        // Process any attached pending commands
        if (isset($result['pending_command'])) {
            EliteClient::processPendingCommands($result['pending_command']);
        }

        if (isset($result['valid']) && $result['valid'] === false) {
            self::deny($result['message'] ?? 'Unauthorized installation detected.');
        }
    }

    /**
     * Centralized Application Denial Screen
     */
    public static function deny(string $reason = 'Unauthorized installation'): void {
        http_response_code(403);
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Access Restricted - Elite Guard</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    background-color: #0b0f19;
                    color: #f1f5f9;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 20px;
                }
                .card {
                    background: #151d30;
                    border: 1px solid #233252;
                    border-radius: 12px;
                    max-width: 520px;
                    width: 100%;
                    padding: 36px;
                    text-align: center;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                }
                .icon-box {
                    width: 64px;
                    height: 64px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 28px;
                    font-weight: bold;
                }
                h1 {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    color: #ffffff;
                    margin-bottom: 12px;
                }
                p {
                    font-size: 15px;
                    color: #94a3b8;
                    line-height: 1.6;
                    margin-bottom: 28px;
                }
                .contact-btn {
                    display: inline-block;
                    background: #3b82f6;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    padding: 12px 28px;
                    border-radius: 6px;
                    transition: background 0.2s ease;
                }
                .contact-btn:hover {
                    background: #2563eb;
                }
                .footer {
                    margin-top: 24px;
                    font-size: 12px;
                    color: #475569;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="icon-box">✕</div>
                <h1>ACCESS RESTRICTED</h1>
                <p>This software installation is not authorized for use on this domain.</p>
                <p>Please contact <strong>Elite Developers</strong> to resolve your installation or obtain authorized access credentials.</p>
                <a href="mailto:support@elitedevs.com?subject=EliteGuard%20License%20Authorization" class="contact-btn">
                    CONTACT ELITE DEVELOPERS
                </a>
                <div class="footer">
                    Protected by EliteGuard System
                </div>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}
