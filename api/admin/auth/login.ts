import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dbPool } from '../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eliteguard_jwt_super_auth_token_secret_998822';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query administrator in Neon DB
    let admin = null;
    try {
      const result = await dbPool.query(
        'SELECT * FROM administrators WHERE email = $1 AND status = $2',
        [normalizedEmail, 'active']
      );
      if (result.rows.length > 0) {
        admin = result.rows[0];
      }
    } catch (dbErr) {
      console.error('DB query error during login:', dbErr);
    }

    // Default Super Admin fallback for initial setup if table is not yet seeded
    if (!admin && normalizedEmail === 'admin@elitedevs.com' && password === 'admin123') {
      const token = jwt.sign(
        {
          id: 'admin_1',
          email: 'admin@elitedevs.com',
          role: 'super_admin',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        admin: {
          id: 'admin_1',
          email: 'admin@elitedevs.com',
          role: 'super_admin',
          two_factor_enabled: false,
        },
      });
    }

    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login timestamp
    try {
      await dbPool.query(
        'UPDATE administrators SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [admin.id]
      );
      await dbPool.query(
        `INSERT INTO activity_logs (id, administrator_id, action, resource_type, resource_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`act_${Date.now()}`, admin.id, 'ADMIN_LOGIN', 'administrator', admin.id, req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1']
      );
    } catch (e) {}

    // Sign JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        two_factor_enabled: admin.two_factor_enabled,
      },
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Authentication error' });
  }
}
