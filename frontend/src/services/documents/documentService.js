import { documents } from '../../data/mockDocuments';
import { getAuthToken } from '../auth/authService';

const API_URL = '/api/v1/documents';
const OCR_API_URL = '/api/v1/ocr';

export const getDocuments = async () => {
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, using local document records:', error);
  }
  return documents;
};

export const uploadDocument = async (docData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, saving document locally:', error);
  }
  return { id: Date.now(), ...docData, status: 'In Review' };
};

export const processDocumentOCR = async (documentName, documentType, ulpin) => {
  try {
    const token = getAuthToken();
    const res = await fetch(`${OCR_API_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ documentName, documentType, ulpin })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('AI OCR Backend API error:', error);
  }

  // Local fallback simulation
  return {
    documentName: documentName || 'Sale_Deed_2025.pdf',
    extractedFields: {
      sellerName: 'Somra Soren',
      buyerName: 'Ananya Soren',
      surveyNumber: '12/4',
      areaAcres: '2.47',
      transactionDate: '14 Mar 2025',
      declaredValue: '₹35,00,000'
    },
    ocrConfidenceScore: 88
  };
};
