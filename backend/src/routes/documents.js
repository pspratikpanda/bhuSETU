import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/documents
router.get('/', (req, res) => {
  const documents = db.getCollection('documents');
  res.json({ success: true, count: documents.length, data: documents });
});

// POST /api/v1/documents
router.post('/', (req, res) => {
  const { name, type, ulpin } = req.body;
  const newDoc = {
    id: Date.now(),
    name: name || 'Uploaded_Document.pdf',
    type: type || 'Supporting Record',
    ulpin: ulpin || 'JH-22-1048-0021',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'In Review'
  };

  db.insert('documents', newDoc);
  res.status(201).json({ success: true, data: newDoc });
});

export default router;
