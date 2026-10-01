import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dbPool, signResponse } from '../../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { installation_id, access_key } = req.body;

    if (!installation_id || !access_key) {
      return res.status(400).json({ error: 'installation_id and access_key required' });
    }

    let pendingCommand = null;

    try {
      const dbResult = await dbPool.query(
        `SELECT * FROM remote_commands 
         WHERE installation_id = $1 AND command_status = 'pending' AND expires_at > CURRENT_TIMESTAMP 
         ORDER BY created_at ASC LIMIT 1`,
        [installation_id]
      );

      if (dbResult.rows.length > 0) {
        pendingCommand = dbResult.rows[0];
      }
    } catch (dbErr) {
      // Mock fallback if DB is not configured
    }

    return res.status(200).json(signResponse({
      installation_id,
      command: pendingCommand
    }));

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Command polling failed' });
  }
}
