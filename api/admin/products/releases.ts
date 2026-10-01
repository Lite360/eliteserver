import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { filename, product_id, version } = req.query;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename parameter is required' });
    }

    // Handle Blob storage upload
    // Requires BLOB_READ_WRITE_TOKEN environment variable in Vercel
    const blob = await put(`releases/${product_id || 'general'}/${filename}`, req, {
      access: 'public',
      addRandomSuffix: false,
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Blob release upload failed' });
  }
}
