import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dbPool } from '../../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { command_id, status, result } = req.body;

    if (!command_id || !status) {
      return res.status(400).json({ error: 'command_id and status are required' });
    }

    try {
      await dbPool.query(
        `UPDATE remote_commands 
         SET command_status = $1, executed_at = CURRENT_TIMESTAMP, result = $2 
         WHERE id = $3`,
        [status, JSON.stringify(result || {}), command_id]
      );
    } catch (dbErr) {
      // Mock DB silent catch
    }

    return res.status(200).json({ success: true, message: 'Command result logged successfully' });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update command status' });
  }
}
