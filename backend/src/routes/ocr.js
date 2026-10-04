import express from 'express';
import { query } from '../db/postgres.js';
import { authenticateToken } from '../middleware/auth.js';
import { emitToUser } from '../socket/socketManager.js';

const router = express.Router();

// POST /api/v1/ocr/process - Process document through AI OCR pipeline
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { documentName, documentType, ulpin } = req.body;
    const targetUlpin = ulpin || 'JH-22-1048-0021';
    
    const { rows } = await query('SELECT survey_number, owner, area FROM parcels WHERE ulpin = $1', [targetUlpin]);
    const parcel = rows[0] || { owner: 'Ananya Soren', area: '2.50', survey_number: '12/4' };

    // Simulated AI Vision / OCR Document Extraction Engine
    const extractedMetadata = {
      documentName: documentName || 'Sale_Deed_2025.pdf',
      documentType: documentType || 'Deed of Sale',
      ulpin: targetUlpin,
      extractedFields: {
        sellerName: 'Somra Soren',
        buyerName: 'Ananya Soren',
        surveyNumber: parcel.survey_number || '12/4',
        areaAcres: '2.47',
        transactionDate: '14 Mar 2025',
        declaredValue: '₹35,00,000',
        stampDeedNo: 'JH-REG-2025-9941'
      },
      ocrConfidenceScore: 94,
      extractedAt: new Date().toISOString(),
      crossVerification: {
        ownerMatched: true,
        surveyMatched: true,
        areaDiscrepancy: false,
        discrepancyNote: 'Deed area 2.47 acres aligns within 1% of survey record 2.50 acres.'
      }
    };

    // Log OCR Audit Event
    await query(
      `INSERT INTO audit_logs (action, actor, target) VALUES ($1, $2, $3)`,
      ['AI_OCR_DOCUMENT_PARSED', req.user?.name || 'System AI Engine', extractedMetadata.documentName]
    );

    const userId = req.user?.id;
    if (userId) {
      emitToUser(userId, 'ocr:result_ready', {
        documentId: extractedMetadata.documentName,
        extractedData: extractedMetadata.extractedFields,
        confidence: extractedMetadata.ocrConfidenceScore,
        timestamp: extractedMetadata.extractedAt,
      });
    }

    res.json({
      success: true,
      message: 'Document successfully parsed via AI OCR pipeline.',
      data: extractedMetadata
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/ocr/status/:docId - Get extraction status for document
router.get('/status/:docId', (req, res) => {
  const { docId } = req.params;
  res.json({
    success: true,
    docId,
    status: 'PARSED',
    confidenceScore: 94
  });
});

export default router;
