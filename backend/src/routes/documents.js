import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

function mapDoc(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    ulpin: row.ulpin,
    date: row.date,
    status: row.status,
    ocrData: row.ocr_data
  };
}

// GET /api/v1/documents
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM documents ORDER BY id DESC');
    res.json({ success: true, count: rows.length, data: rows.map(mapDoc) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/documents
router.post('/', async (req, res) => {
  try {
    const { name, type, ulpin, ocrData } = req.body;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const { rows } = await query(
      `INSERT INTO documents (name, type, ulpin, date, status, ocr_data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name || 'Uploaded_Document.pdf', type || 'Supporting Record', ulpin || 'JH-22-1048-0021', dateStr, 'In Review', ocrData ? JSON.stringify(ocrData) : null]
    );
    res.status(201).json({ success: true, data: mapDoc(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
