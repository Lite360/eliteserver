EliteGuard
Elite Developers Software Protection & Control Platform
1. PROJECT OVERVIEW

Build EliteGuard, a centralized software protection and remote-control platform owned and operated by Elite Developers.

EliteGuard is designed to protect commercial PHP applications distributed by Elite Developers.

The customer-facing PHP application must require no installation wizard and must require no license-related database tables.

Instead:

A unique access key is embedded directly inside the PHP application.
A small neutral PHP component is included in the application under /system/.
config.php initializes the component.
The component communicates securely with the EliteGuard API.
EliteGuard determines whether the current installation/domain is authorized.
If the installation is unauthorized or the access key is being used on a different domain, the PHP application enters a locked state.
The locked application displays a clear message telling the user to contact Elite Developers.
Elite Developers can manage installations from the central React dashboard.
Administrators can explicitly issue installation-specific remote actions.
File/database removal must NEVER happen automatically merely because of a temporary API failure.
Destructive actions require explicit administrator confirmation and must be audited.

The system must be designed as a reusable platform that can protect multiple Elite Developers PHP products.

2. TECHNOLOGY STACK
Central Platform

Frontend:

React
Vite
TypeScript
Tailwind CSS
Responsive desktop/tablet/mobile dashboard
Modern but professional UI
Avoid excessive AI-looking visual effects

Backend/API:

Vercel
TypeScript
Vercel server-side functions/API routes
REST-style API
Server-side authentication and authorization

Database:

Neon PostgreSQL

File storage:

Vercel Blob

Authentication:

Secure admin authentication
Password hashing
Session/token protection
Optional 2FA
Role-based access control

Customer application:

PHP 8+
Plain/core PHP
No Laravel
cPanel compatible
MySQL-compatible existing application
Do not require modifications to the customer's existing database schema
3. IMPORTANT ARCHITECTURAL RULE

Never mix EliteGuard data with the customer's application database.

The customer application database must NOT receive:

license table
access-key table
installation table
domain registration table
license status table
EliteGuard logs
EliteGuard migrations
EliteGuard database columns

All protection data belongs exclusively to the EliteGuard Neon PostgreSQL database.

Customer application:

Existing PHP Database
├── users
├── orders
├── transactions
├── settings
└── existing tables

EliteGuard:

Neon PostgreSQL
├── products
├── access_keys
├── installations
├── domains
├── commands
├── administrators
├── activity_logs
└── security_events
4. CUSTOMER-SIDE DIRECTORY STRUCTURE

The customer application should contain:

project/
│
├── config.php
│
├── system/
│   ├── client.php
│   ├── validator.php
│   └── security.php
│
├── includes/
├── assets/
├── admin/
├── pages/
└── existing application files...

Do NOT name the directory:

license/
licensing/
license-system/
license-validator/

Use:

system/

The purpose is to keep the integration neutral and clean.

5. CONFIG.PHP INTEGRATION

The customer's existing config.php should contain only a small integration block.

Example:

define('ELITE_ACCESS_KEY', 'ED-XXXX-XXXX-XXXX');
define('ELITE_SERVER', 'https://eliteguard.example.com');

require_once __DIR__ . '/system/validator.php';

EliteAccess::check();

The final implementation should avoid exposing sensitive server credentials.

The embedded access key identifies the distributed copy.

The customer's database must not be modified to store this information.

6. ACCESS KEY MODEL

Each distributed product receives a unique access key.

Example:

ED-8F92-XK73-29PQ

Access keys should have:

unique ID
product ID
key hash
status
authorized domain
installation ID
creation date
activation date
expiration date if applicable
activation limit
metadata

Do not store raw keys in plaintext where unnecessary.

Prefer storing a secure hash or encrypted representation.

7. PRODUCT MANAGEMENT

Administrators can create products.

Example:

Product:
Elite VTU System

Product ID:
VTU-PRO

Current Version:
2.4.0

Status:
Active

Products can have:

name
slug
description
version
release information
status
Blob assets
creation date
update date

Multiple PHP products can use the same EliteGuard infrastructure.

8. INSTALLATION DETECTION

When the PHP application contacts EliteGuard, it should report enough information for the server to identify the installation.

Possible information:

Access key
Current domain
Installation identifier
Product identifier
Script version
PHP version
Server software
IP address
Timestamp

The server should normalize domains.

Examples:

https://www.example.com/
example.com
WWW.EXAMPLE.COM

should resolve consistently to:

example.com

Do not rely on the domain alone as the only installation identifier.

9. FIRST CONTACT

When a new authorized application contacts EliteGuard:

PHP Application
      ↓
EliteGuard API
      ↓
Validate access key
      ↓
Determine current domain
      ↓
Create installation record
      ↓
Bind authorized installation
      ↓
Return signed response

No installation wizard is required.

The application automatically registers through its normal request.

10. DOMAIN MATCHING

The central server must compare:

Authorized domain

against:

Current domain

Example:

Authorized:
example.com

Current:
example.com

Result:
MATCH

Copied application:

Authorized:
example.com

Current:
anotherdomain.com

Result:
MISMATCH

A mismatch should create a security event.

11. NORMAL LICENSE/ACCESS VALIDATION

When valid:

{
  "valid": true,
  "status": "active",
  "domain": "example.com",
  "product": "VTU-PRO",
  "expires_at": null
}

The application continues normally.

12. MISMATCH RESPONSE

When a mismatch occurs:

{
  "valid": false,
  "status": "domain_mismatch",
  "message": "Unauthorized installation"
}

The PHP application must enter a locked state.

Display:

ACCESS RESTRICTED

This software installation is not authorized.

Please contact Elite Developers to obtain access.

CONTACT ELITE DEVELOPERS

Do not expose:

API URLs
database information
internal security details
access keys
server secrets
debugging information
13. IMPORTANT FAILURE RULE

A temporary failure of EliteGuard must NOT automatically trigger destructive actions.

For example:

EliteGuard temporarily unavailable

must not mean:

DELETE FILES

Instead use a controlled validation/grace mechanism.

Possible states:

ACTIVE
MISMATCH
REVOKED
EXPIRED
SUSPENDED
SERVER_UNAVAILABLE

The application should distinguish an explicit server decision from a network outage.

14. CENTRAL DASHBOARD

Build a professional React/Vite admin dashboard.

Main navigation:

Dashboard
Products
Access Keys
Installations
Domains
Security Events
Remote Actions
Activity Logs
Administrators
Settings

Dashboard cards:

Total Products
Active Access Keys
Active Installations
Unauthorized Installations
Suspended Installations
Security Events

Recent activity:

example.com
Access verified
2 minutes ago

anotherdomain.com
Domain mismatch
5 minutes ago

shop.com
Access revoked
20 minutes ago
15. ACCESS KEY MANAGEMENT

Administrators can:

generate access key
view key metadata
assign product
assign domain
activate
suspend
revoke
expire
regenerate
view installation
view history

Example:

Access Key
ED-XXXX-XXXX

Product
VTU Pro

Authorized Domain
example.com

Status
ACTIVE

Installation
INST-123456

Created
23 September 2026

Last Seen
23 September 2026
16. INSTALLATION MANAGEMENT

Installation page:

Installation Details

Installation ID
INST-123456

Product
VTU Pro

Domain
example.com

IP
xxx.xxx.xxx.xxx

PHP
8.2

Script Version
2.4.0

First Seen
23 Sep 2026

Last Seen
23 Sep 2026

Status
Active

Actions:

Suspend
Revoke
Force Revalidation
View Events
Remote Actions
17. DOMAIN MANAGEMENT

Show:

Domain
Product
Access Key
Installation
Status
First Seen
Last Seen

Detect suspicious domain changes.

Example:

Authorized Domain:
example.com

Detected Domain:
copiedsite.com

Security Event:
DOMAIN_MISMATCH
18. SECURITY EVENTS

Record:

DOMAIN_MISMATCH
INVALID_ACCESS_KEY
REVOKED_ACCESS
EXPIRED_ACCESS
INSTALLATION_CHANGE
UNEXPECTED_PRODUCT
SIGNATURE_FAILURE
INVALID_COMMAND

Each event should include:

event
installation
domain
IP
timestamp
metadata

Do not expose sensitive secrets in logs.

19. REMOTE COMMAND SYSTEM

Build a secure command mechanism.

Example commands:

LOCK_APPLICATION
FORCE_RECHECK
REVOKE_ACCESS
REMOVE_APPLICATION_FILES
REMOVE_APPLICATION_DATABASE

Commands must be:

installation-specific
authenticated
signed
timestamped
auditable
replay-protected
explicitly authorized

Never create a generic unrestricted command such as:

execute arbitrary shell command

The command system must use an allowlist of supported operations.

20. FILE REMOVAL

The administrator may explicitly choose:

REMOVE APPLICATION FILES

This must NOT happen automatically on every mismatch.

Confirmation:

Remove Application Files?

Domain:
example.com

Installation:
INST-123456

This will permanently remove the files belonging to this application.

Type:
REMOVE

[ CANCEL ]
[ CONFIRM ]

The implementation must scope deletion to known application paths.

Do not blindly delete the entire cPanel account filesystem.

21. DATABASE REMOVAL

Separate administrative action:

REMOVE APPLICATION DATABASE

Confirmation:

Remove Application Database?

Database:
application_database

This operation is permanent.

Type:
DELETE DATABASE

[ CANCEL ]
[ CONFIRM ]

The command must target only the application's configured database.

Do not provide a generic database-server destruction command.

22. REMOTE ACTION SECURITY

Every destructive action should require:

Authenticated administrator
+
appropriate permission
+
explicit confirmation
+
installation ID
+
signed command
+
timestamp
+
unique command ID
+
audit record

Prevent command replay.

Each command should have a unique identifier.

Example:

CMD-83A72C
23. COMMAND FLOW
Administrator
     ↓
React Dashboard
     ↓
Protected Vercel API
     ↓
Verify admin permission
     ↓
Create command
     ↓
Sign command
     ↓
Store in Neon
     ↓
PHP client polls/checks
     ↓
Verify signature
     ↓
Verify command ID
     ↓
Verify installation ID
     ↓
Execute allowed operation
     ↓
Send result
     ↓
Store audit record
24. DATABASE SCHEMA
administrators
id
email
password_hash
role
two_factor_enabled
status
created_at
updated_at
last_login_at
products
id
name
slug
description
version
status
created_at
updated_at
access_keys
id
product_id
key_hash
status
authorized_domain
installation_id
activation_limit
expires_at
created_at
updated_at
installations
id
access_key_id
product_id
installation_identifier
domain
ip_address
php_version
server_software
script_version
status
first_seen_at
last_seen_at
created_at
updated_at
security_events
id
installation_id
event_type
domain
ip_address
metadata
created_at
remote_commands
id
installation_id
command_type
command_status
command_payload
command_signature
created_by
created_at
expires_at
executed_at
result
activity_logs
id
administrator_id
action
resource_type
resource_id
metadata
ip_address
created_at
25. NEON POSTGRESQL

Use PostgreSQL through Neon.

Requirements:

parameterized queries
migrations
indexes
foreign keys
transaction handling
connection pooling where appropriate
server-side credentials only
no database credentials in React
no database credentials in customer PHP code

React must NEVER connect directly to Neon.

Architecture:

React
  ↓
Vercel API
  ↓
Neon
26. VERCEL

Deploy:

React/Vite frontend
+
server-side API

Use environment variables:

DATABASE_URL
BLOB_READ_WRITE_TOKEN
AUTH_SECRET
COMMAND_SIGNING_SECRET
API_SECRET

Never hard-code these values.

27. VERCEL BLOB

Use Blob for:

product release packages where appropriate
product documentation
logos
screenshots
optional update assets
other platform-managed files

Do not expose private Blob tokens to the browser.

If private assets are required, use server-side authorization before issuing access.

28. SECURITY

Implement:

HTTPS
secure cookies
CSRF protection where applicable
rate limiting
input validation
output escaping
SQL parameterization
authentication
authorization
RBAC
2FA support
signed commands
replay protection
request timestamps
domain normalization
audit logs
security event logging
secret management
secure error handling

Never return stack traces to the customer application.

29. ADMIN ROLES

At minimum:

Super Admin

Can:

create products
generate access keys
manage administrators
revoke access
suspend installations
execute destructive actions
view all logs
Administrator

Can:

manage access keys
inspect installations
suspend/revoke access
view security events

Destructive actions can optionally be restricted to Super Admin.

30. ADMIN DASHBOARD UI

Use a clean professional design.

Avoid:

excessive glassmorphism
excessive gradients
flashy animations
fake terminal interfaces
unnecessary AI-style UI

Use:

responsive sidebar
clear tables
status badges
confirmation dialogs
searchable installations
filters
pagination
detail drawers/pages
activity timelines
clear destructive-action warnings

Use a distinct Elite Developers visual identity.

31. API ENDPOINTS

Suggested API:

POST /api/v1/access/validate
POST /api/v1/access/register
POST /api/v1/access/heartbeat
POST /api/v1/access/report
POST /api/v1/commands/poll
POST /api/v1/commands/result

Admin:

GET  /api/admin/products
POST /api/admin/products

GET  /api/admin/access-keys
POST /api/admin/access-keys

GET  /api/admin/installations
GET  /api/admin/installations/:id

POST /api/admin/installations/:id/suspend
POST /api/admin/installations/:id/revoke
POST /api/admin/installations/:id/recheck

POST /api/admin/installations/:id/remove-files
POST /api/admin/installations/:id/remove-database

GET /api/admin/security-events
GET /api/admin/activity
32. PHP CLIENT API COMMUNICATION

The PHP client should:

use HTTPS
set short connection timeouts
validate HTTPS certificates
send only required information
validate server responses
verify response signatures
avoid leaking credentials
handle temporary network failure gracefully

Example conceptual request:

{
  "access_key": "ED-XXXX-XXXX",
  "product": "VTU-PRO",
  "domain": "example.com",
  "installation_id": "INST-123456",
  "version": "2.4.0",
  "php_version": "8.2"
}

The actual implementation should authenticate requests without exposing a permanent server secret in a way that can be trivially extracted from the PHP application.

33. SIGNED RESPONSES

The EliteGuard server should sign validation responses.

Conceptually:

Response
+
timestamp
+
nonce
+
signature

The PHP client verifies the signature using a verification key embedded in the application.

Do not rely solely on a shared secret embedded in the PHP application for server authentication.

34. CACHING

Use a short-lived local validation cache.

Example:

Last successful verification:
07:30

Cache valid until:
07:40

If the EliteGuard server is temporarily unavailable, follow the defined grace policy.

However:

Explicit server response:
REVOKED

must override the cache.

35. APPLICATION LOCK

Create a central method:

EliteAccess::check();

When invalid:

EliteAccess::deny();

The denial response should be centralized so individual application pages don't need custom license code.

The message:

ACCESS RESTRICTED

This software installation is not authorized.

Please contact Elite Developers to obtain access.

Include a configurable contact button/link.

36. NO CUSTOMER DATABASE DEPENDENCY

The customer application must continue using its existing database exactly as it currently does.

EliteGuard should be independent.

This means:

Customer DB
     X
     │
     X no EliteGuard tables
     │
EliteGuard
     ↓
Neon PostgreSQL
37. MVP

The first MVP should contain:

Central server
React/Vite dashboard
Admin login
Products
Access key generation
Domain binding
Installation registration
Domain mismatch detection
Installation status
Activity logs
Security events
Suspend access
Revoke access
Force revalidation
PHP component
Embedded access key
config.php integration
Automatic domain detection
API validation
Installation registration
Domain matching
Application lock
Contact Elite Developers screen
Signed server response verification
Temporary network failure handling
MVP remote actions
Force recheck
Lock application
Revoke access

Then add destructive actions after the core validation system is stable.

38. PHASE 2

Add:

remove application files
remove application database
command queue
command signatures
command expiration
command audit trail
2FA confirmation
advanced security events
version management
release management
Vercel Blob release storage
39. PHASE 3

Add:

automatic product update system
customer portal if required
license/access renewal
multiple installations per key
activation limits
product editions
subscription expiration
webhook notifications
email alerts
advanced analytics
IP/domain change detection
administrator activity monitoring
40. DEVELOPMENT RULES

The coding agent must follow these rules:

Use React + Vite + TypeScript.
Use plain PHP 8+ for the customer-side component.
Do not use Laravel.
Use Neon PostgreSQL.
Use Vercel.
Use Vercel Blob where file storage is required.
Do not put EliteGuard data into the customer's application database.
Do not create customer-side license tables.
Do not create an installation wizard.
The access key must be embedded in the PHP script.
Use /system/ rather than /license/.
Do not expose internal API secrets.
Use signed server responses.
Use secure HTTPS communication.
Separate validation from destructive commands.
Never automatically delete files merely because a validation request fails.
Destructive operations require explicit administrator authorization.
Destructive operations must be installation-scoped.
Maintain complete audit logs.
Never implement an arbitrary remote shell/command-execution endpoint.
Do not expose Neon credentials to React.
Do not expose Vercel Blob write credentials to the browser.
Do not break the customer's existing PHP application structure.
Keep the PHP integration minimal.
Make the PHP component reusable across all Elite Developers products.
41. ACCEPTANCE CRITERIA

The MVP is complete when:

Installation

A PHP product can be distributed with:

define('ELITE_ACCESS_KEY', 'ED-XXXX');
require_once __DIR__ . '/system/validator.php';
EliteAccess::check();

and no installation wizard is required.

Database

The customer's existing database receives:

NO EliteGuard tables
NO EliteGuard migrations
NO EliteGuard columns
Validation

A valid domain runs normally.

An unauthorized domain is detected.

Lock

A mismatch produces:

ACCESS RESTRICTED

This software installation is not authorized.

Please contact Elite Developers to obtain access.
Dashboard

The administrator can see:

License/access key
Product
Domain
Installation
IP
PHP version
Script version
Status
First seen
Last seen
Control

The administrator can:

Suspend
Revoke
Force Recheck
Remote deletion

Only after explicit administrator confirmation can the system issue an installation-specific:

REMOVE APPLICATION FILES

or:

REMOVE APPLICATION DATABASE

command.

Security

All destructive actions are:

Authenticated
Authorized
Signed
Installation-specific
Logged
Auditable
42. FINAL PRODUCT MODEL

The final ecosystem should look like:

                    ELITEGUARD
              Elite Developers
                     │
        ┌────────────┴─────────────┐
        │                          │
     React                     Vercel API
    Dashboard                      │
        │                          │
        └──────────────┬───────────┘
                       │
                  Neon PostgreSQL
                       │
                 Vercel Blob
                       │
          ─────────────┼─────────────
                       │
              Customer PHP Apps
                       │
                 config.php
                       │
                    system/
                       │
                EliteAccess
                       │
                    HTTPS
                       │
                  EliteGuard

The key design principle is:

EliteGuard is the central authority. The customer's PHP application only contains the small system/ client and embedded access key. The customer's existing database remains untouched.