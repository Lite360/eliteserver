-- EliteGuard Neon PostgreSQL Schema Migration
-- Database schema for central protection and remote-control platform

-- 1. ADMINISTRATORS
CREATE TABLE IF NOT EXISTS administrators (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin'
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    blob_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ACCESS KEYS
CREATE TABLE IF NOT EXISTS access_keys (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'revoked', 'expired'
    authorized_domain VARCHAR(255) NOT NULL,
    installation_id VARCHAR(64),
    activation_limit INT DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INSTALLATIONS
CREATE TABLE IF NOT EXISTS installations (
    id VARCHAR(64) PRIMARY KEY,
    access_key_id VARCHAR(64) NOT NULL REFERENCES access_keys(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    installation_identifier VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    php_version VARCHAR(32),
    server_software VARCHAR(255),
    script_version VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SECURITY EVENTS
CREATE TABLE IF NOT EXISTS security_events (
    id VARCHAR(64) PRIMARY KEY,
    installation_id VARCHAR(64) REFERENCES installations(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL, -- DOMAIN_MISMATCH, INVALID_ACCESS_KEY, etc.
    domain VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. REMOTE COMMANDS
CREATE TABLE IF NOT EXISTS remote_commands (
    id VARCHAR(64) PRIMARY KEY,
    installation_id VARCHAR(64) NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    command_type VARCHAR(64) NOT NULL, -- LOCK_APPLICATION, REMOVE_APPLICATION_FILES, etc.
    command_status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'executed', 'failed', 'expired'
    command_payload JSONB DEFAULT '{}'::jsonb,
    command_signature TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    result JSONB
);

-- 7. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    administrator_id VARCHAR(64) REFERENCES administrators(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_access_keys_hash ON access_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_installations_domain ON installations(domain);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_remote_commands_inst ON remote_commands(installation_id, command_status);
