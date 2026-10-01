import type { 
  Product, 
  AccessKey, 
  Installation, 
  SecurityEvent, 
  RemoteCommand, 
  ActivityLog, 
  Administrator 
} from './types';

export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Elite VTU System',
    slug: 'vtu-pro',
    description: 'Automated Telecommunication & Utility Payment Portal for PHP.',
    version: '2.4.0',
    status: 'active',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-09-20T14:30:00Z',
  },
  {
    id: 'prod_2',
    name: 'Elite BankGateway',
    slug: 'bank-gateway',
    description: 'Multi-bank auto-reconciliation PHP payment engine.',
    version: '1.8.2',
    status: 'active',
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-09-18T09:15:00Z',
  },
  {
    id: 'prod_3',
    name: 'Elite SMS Portal',
    slug: 'sms-portal',
    description: 'Bulk SMS and WhatsApp marketing platform.',
    version: '3.1.0',
    status: 'active',
    created_at: '2025-11-10T08:00:00Z',
    updated_at: '2026-08-05T11:45:00Z',
  }
];

export const mockAccessKeys: AccessKey[] = [
  {
    id: 'key_1',
    key: 'ED-8F92-XK73-29PQ',
    product_id: 'prod_1',
    product_name: 'Elite VTU System',
    authorized_domain: 'example.com',
    status: 'active',
    installation_id: 'INST-123456',
    activation_limit: 1,
    expires_at: null,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'key_2',
    key: 'ED-99AB-34CD-77EF',
    product_id: 'prod_1',
    product_name: 'Elite VTU System',
    authorized_domain: 'payvtu.ng',
    status: 'active',
    installation_id: 'INST-654321',
    activation_limit: 1,
    expires_at: '2027-09-01T00:00:00Z',
    created_at: '2026-09-10T12:00:00Z',
  },
  {
    id: 'key_3',
    key: 'ED-77XX-88YY-99ZZ',
    product_id: 'prod_2',
    product_name: 'Elite BankGateway',
    authorized_domain: 'shop-unauthorized.com',
    status: 'suspended',
    installation_id: 'INST-999888',
    activation_limit: 1,
    expires_at: null,
    created_at: '2026-09-15T15:20:00Z',
  },
  {
    id: 'key_4',
    key: 'ED-11AA-22BB-33CC',
    product_id: 'prod_3',
    product_name: 'Elite SMS Portal',
    authorized_domain: 'smsking.com',
    status: 'revoked',
    installation_id: 'INST-444555',
    activation_limit: 1,
    expires_at: null,
    created_at: '2026-08-20T10:00:00Z',
  }
];

export const mockInstallations: Installation[] = [
  {
    id: 'INST-123456',
    access_key_id: 'key_1',
    access_key: 'ED-8F92-XK73-29PQ',
    product_id: 'prod_1',
    product_name: 'Elite VTU System',
    domain: 'example.com',
    ip_address: '198.51.100.45',
    php_version: '8.2.14',
    server_software: 'Apache/2.4.58 (cPanel)',
    script_version: '2.4.0',
    status: 'active',
    first_seen_at: '2026-09-01T08:12:00Z',
    last_seen_at: '2026-09-23T08:00:00Z',
  },
  {
    id: 'INST-654321',
    access_key_id: 'key_2',
    access_key: 'ED-99AB-34CD-77EF',
    product_id: 'prod_1',
    product_name: 'Elite VTU System',
    domain: 'payvtu.ng',
    ip_address: '102.89.23.11',
    php_version: '8.3.2',
    server_software: 'nginx/1.24.0',
    script_version: '2.4.0',
    status: 'active',
    first_seen_at: '2026-09-10T12:05:00Z',
    last_seen_at: '2026-09-23T07:45:00Z',
  },
  {
    id: 'INST-999888',
    access_key_id: 'key_3',
    access_key: 'ED-77XX-88YY-99ZZ',
    product_id: 'prod_2',
    product_name: 'Elite BankGateway',
    domain: 'copiedsite.com',
    ip_address: '185.220.101.5',
    php_version: '8.1.10',
    server_software: 'Apache/2.4.52',
    script_version: '1.8.2',
    status: 'domain_mismatch',
    first_seen_at: '2026-09-15T15:22:00Z',
    last_seen_at: '2026-09-23T08:10:00Z',
  },
  {
    id: 'INST-444555',
    access_key_id: 'key_4',
    access_key: 'ED-11AA-22BB-33CC',
    product_id: 'prod_3',
    product_name: 'Elite SMS Portal',
    domain: 'smsking.com',
    ip_address: '45.33.21.90',
    php_version: '8.2.0',
    server_software: 'LiteSpeed',
    script_version: '3.1.0',
    status: 'revoked',
    first_seen_at: '2026-08-20T10:15:00Z',
    last_seen_at: '2026-09-21T18:30:00Z',
  }
];

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'sec_1',
    installation_id: 'INST-999888',
    event_type: 'DOMAIN_MISMATCH',
    domain: 'copiedsite.com',
    ip_address: '185.220.101.5',
    metadata: {
      authorized_domain: 'shop-unauthorized.com',
      attempted_domain: 'copiedsite.com',
      access_key: 'ED-77XX-88YY-99ZZ',
    },
    created_at: '2026-09-23T08:10:00Z',
  },
  {
    id: 'sec_2',
    installation_id: null,
    event_type: 'INVALID_ACCESS_KEY',
    domain: 'hacker-site.org',
    ip_address: '193.142.146.21',
    metadata: {
      raw_key_sent: 'ED-FAKE-KEY-9999',
    },
    created_at: '2026-09-23T05:30:00Z',
  },
  {
    id: 'sec_3',
    installation_id: 'INST-444555',
    event_type: 'REVOKED_ACCESS',
    domain: 'smsking.com',
    ip_address: '45.33.21.90',
    metadata: {
      reason: 'Administrative revocation due to unpaid subscription',
    },
    created_at: '2026-09-21T18:30:00Z',
  }
];

export const mockRemoteCommands: RemoteCommand[] = [
  {
    id: 'CMD-83A72C',
    installation_id: 'INST-999888',
    domain: 'copiedsite.com',
    command_type: 'LOCK_APPLICATION',
    command_status: 'executed',
    command_payload: { reason: 'Domain mismatch security isolation' },
    command_signature: 'sig_hmac_998877665544332211',
    created_by: 'admin@elitedevs.com',
    created_at: '2026-09-23T08:11:00Z',
    expires_at: '2026-09-24T08:11:00Z',
    executed_at: '2026-09-23T08:11:05Z',
    result: { status: 'success', message: 'Application locked successfully' },
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'act_1',
    administrator_id: 'admin_1',
    administrator_email: 'admin@elitedevs.com',
    action: 'REMOTE_COMMAND_ISSUED',
    resource_type: 'remote_command',
    resource_id: 'CMD-83A72C',
    metadata: { command_type: 'LOCK_APPLICATION', installation_id: 'INST-999888' },
    ip_address: '105.112.54.12',
    created_at: '2026-09-23T08:11:00Z',
  },
  {
    id: 'act_2',
    administrator_id: 'admin_1',
    administrator_email: 'admin@elitedevs.com',
    action: 'ACCESS_KEY_GENERATED',
    resource_type: 'access_key',
    resource_id: 'key_1',
    metadata: { key: 'ED-8F92-XK73-29PQ', domain: 'example.com' },
    ip_address: '105.112.54.12',
    created_at: '2026-09-01T08:00:00Z',
  }
];

export const mockAdministrators: Administrator[] = [
  {
    id: 'admin_1',
    email: 'admin@elitedevs.com',
    role: 'super_admin',
    two_factor_enabled: true,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    last_login_at: '2026-09-23T08:12:00Z',
  },
  {
    id: 'admin_2',
    email: 'support@elitedevs.com',
    role: 'admin',
    two_factor_enabled: false,
    status: 'active',
    created_at: '2026-05-10T10:00:00Z',
    last_login_at: '2026-09-22T14:20:00Z',
  }
];
