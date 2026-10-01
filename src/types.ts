export interface Administrator {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  two_factor_enabled: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  last_login_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  status: 'active' | 'deprecated' | 'inactive';
  blob_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessKey {
  id: string;
  key: string;
  product_id: string;
  product_name?: string;
  authorized_domain: string;
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  installation_id?: string | null;
  activation_limit: number;
  expires_at: string | null;
  created_at: string;
}

export interface Installation {
  id: string;
  access_key_id: string;
  access_key: string;
  product_id: string;
  product_name: string;
  domain: string;
  ip_address: string;
  php_version: string;
  server_software: string;
  script_version: string;
  status: 'active' | 'domain_mismatch' | 'suspended' | 'revoked' | 'locked';
  first_seen_at: string;
  last_seen_at: string;
}

export interface SecurityEvent {
  id: string;
  installation_id: string | null;
  event_type: 'DOMAIN_MISMATCH' | 'INVALID_ACCESS_KEY' | 'REVOKED_ACCESS' | 'EXPIRED_ACCESS' | 'INSTALLATION_CHANGE' | 'UNEXPECTED_PRODUCT' | 'SIGNATURE_FAILURE' | 'INVALID_COMMAND';
  domain: string;
  ip_address: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface RemoteCommand {
  id: string;
  installation_id: string;
  domain: string;
  command_type: 'LOCK_APPLICATION' | 'FORCE_RECHECK' | 'REVOKE_ACCESS' | 'REMOVE_APPLICATION_FILES' | 'REMOVE_APPLICATION_DATABASE';
  command_status: 'pending' | 'executed' | 'failed' | 'expired';
  command_payload: Record<string, any>;
  command_signature: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  executed_at: string | null;
  result: Record<string, any> | null;
}

export interface ActivityLog {
  id: string;
  administrator_id: string;
  administrator_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, any>;
  ip_address: string;
  created_at: string;
}
