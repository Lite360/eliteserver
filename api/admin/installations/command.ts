import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dbPool, signCommandPayload } from '../../db';

const ALLOWED_COMMANDS = [
  'LOCK_APPLICATION',
  'FORCE_RECHECK',
  'REVOKE_ACCESS',
  'REMOVE_APPLICATION_FILES',
  'REMOVE_APPLICATION_DATABASE',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { installation_id, command_type, admin_id, payload } = req.body;

    if (!installation_id || !command_type || !ALLOWED_COMMANDS.includes(command_type)) {
      return res.status(400).json({ error: 'Valid installation_id and allowlisted command_type required' });
    }

    const commandId = `CMD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minute expiration

    const commandData = {
      id: commandId,
      installation_id,
      command_type,
      timestamp,
      payload: payload || {},
    };

    const signature = signCommandPayload(commandData);

    try {
      await dbPool.query(
        `INSERT INTO remote_commands 
         (id, installation_id, command_type, command_status, command_payload, command_signature, created_by, expires_at)
         VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7)`,
        [commandId, installation_id, command_type, JSON.stringify(payload || {}), signature, admin_id || 'system_admin', expiresAt]
      );

      // Audit Log entry
      await dbPool.query(
        `INSERT INTO activity_logs (id, administrator_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`act_${Date.now()}`, admin_id || 'system_admin', `ISSUE_COMMAND_${command_type}`, 'installation', installation_id, JSON.stringify({ commandId, signature })]
      );
    } catch (dbErr) {
      // Mock mode fallback
    }

    return res.status(200).json({
      success: true,
      command_id: commandId,
      command_type,
      signature,
      expires_at: expiresAt,
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to issue remote command' });
  }
}
