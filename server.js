import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { Resend } from 'resend';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, 'hausavy.db'));
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

db.exec(`
  CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    seller_goals TEXT,
    notes TEXT,
    recommendations_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post('/api/signup', async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    email,
    address,
    sellerGoals,
    notes,
    recommendations
  } = req.body || {};

  if (!firstName || !lastName || !phone || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const insert = db.prepare(`
    INSERT INTO signups (
      first_name, last_name, phone, email, address, seller_goals, notes, recommendations_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    firstName,
    lastName,
    phone,
    email,
    address,
    sellerGoals || '',
    notes || '',
    JSON.stringify(recommendations || {})
  );

  if (resend && process.env.ADMIN_EMAIL && process.env.FROM_EMAIL) {
    const recommendationLines = recommendations
      ? Object.entries(recommendations)
          .map(([bucket, items]) => `${bucket}: ${(items || []).map(item => item.name).join(', ')}`)
          .join('\n')
      : 'No recommendations generated';

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Hausavy signup: ${firstName} ${lastName}`,
      text: `
A new seller signed up.

Name: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}
Address: ${address}
Seller goals: ${sellerGoals || 'Not provided'}
Notes: ${notes || 'None'}

Smart recommendations:
${recommendationLines}
      `.trim()
    });
  }

  res.json({ ok: true, id: result.lastInsertRowid });
});

app.get('*', (req, res) => {
  if (req.path.endsWith('.html')) {
    return res.sendFile(path.join(__dirname, req.path));
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Hausavy running on http://localhost:${port}`);
});
