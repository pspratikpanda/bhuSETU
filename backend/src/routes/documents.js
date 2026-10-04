import express from 'express';
import { query, isPgConnected } from '../db/postgres.js';
import { db } from '../db/database.js';

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
    if (isPgConnected()) {
      const { rows } = await query('SELECT * FROM documents ORDER BY id DESC');
      return res.json({ success: true, count: rows.length, data: rows.map(mapDoc) });
    }
    const documents = db.getCollection('documents');
    res.json({ success: true, count: documents.length, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/documents
router.post('/', async (req, res) => {
  try {
    const { name, type, ulpin, ocrData } = req.body;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (isPgConnected()) {
      const { rows } = await query(
        `INSERT INTO documents (name, type, ulpin, date, status, ocr_data)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name || 'Uploaded_Document.pdf', type || 'Supporting Record', ulpin || 'JH-22-1048-0021', dateStr, 'In Review', ocrData ? JSON.stringify(ocrData) : null]
      );
      return res.status(201).json({ success: true, data: mapDoc(rows[0]) });
    }

    const newDoc = {
      id: Date.now(),
      name: name || 'Uploaded_Document.pdf',
      type: type || 'Supporting Record',
      ulpin: ulpin || 'JH-22-1048-0021',
      date: dateStr,
      status: 'In Review'
    };
    db.insert('documents', newDoc);
    res.status(201).json({ success: true, data: newDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
