import { Pool } from '@neondatabase/serverless';
import crypto from 'crypto';

// Initialize Neon Serverless Connection Pool
export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:mock_password@ep-mock-12345.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

// Domain Normalization Algorithm (Server-Side)
export function normalizeDomain(rawDomain: string): string {
  if (!rawDomain) return '';
  let domain = rawDomain.replace(/^https?:\/\//i, '');
  domain = domain.split('/')[0];
  domain = domain.split(':')[0];
  domain = domain.toLowerCase().trim();
  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }
  return domain;
}

// Generate Cryptographic HMAC SHA256 Signature for Server Response
export function signResponse(data: Record<string, any>): { data: Record<string, any>; timestamp: number; signature: string } {
  const secret = process.env.COMMAND_SIGNING_SECRET || 'eliteguard_default_secret_key_2026';
  const timestamp = Math.floor(Date.now() / 1000);
  const dataString = JSON.stringify(data);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${dataString}.${timestamp}`)
    .digest('hex');

  return {
    data,
    timestamp,
    signature,
  };
}

// Generate Cryptographic HMAC SHA256 Signature for Remote Command Payload
export function signCommandPayload(payload: Record<string, any>): string {
  const secret = process.env.COMMAND_SIGNING_SECRET || 'eliteguard_default_secret_key_2026';
  const timestamp = payload.timestamp || Math.floor(Date.now() / 1000);
  const dataString = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(`${payload.id}.${payload.command_type}.${payload.installation_id}.${timestamp}.${dataString}`)
    .digest('hex');
}

// Verify Command Signature
export function verifyCommandSignature(payload: Record<string, any>, signature: string): boolean {
  const expectedSignature = signCommandPayload(payload);
  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}

