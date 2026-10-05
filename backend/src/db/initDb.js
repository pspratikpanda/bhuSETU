import { query } from './postgres.js';

export async function initDatabase() {
  const schema = process.env.POSTGIS_SCHEMA || 'gis';

  // 1. Create Dedicated GIS Schema & Enable PostGIS extension inside it
  await query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);
  await query(`CREATE EXTENSION IF NOT EXISTS postgis SCHEMA ${schema};`);

  // 2. Create Users Table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      district VARCHAR(100),
      kyc_status VARCHAR(50),
      kyc_verified_at TIMESTAMP
    );
  `);

  // 3. Create Parcels Table
  await query(`
    CREATE TABLE IF NOT EXISTS parcels (
      id SERIAL PRIMARY KEY,
      ulpin VARCHAR(50) UNIQUE NOT NULL,
      owner VARCHAR(255) NOT NULL,
      area VARCHAR(50),
      land_type VARCHAR(100),
      location VARCHAR(255),
      risk VARCHAR(50),
      status VARCHAR(100),
      current_use VARCHAR(100),
      survey_number VARCHAR(100),
      registered_value VARCHAR(100),
      risk_scores JSONB,
      ownership_history JSONB,
      geom GEOMETRY(Polygon, 4326)
    );
  `);

  // 4. Create Applications Table
  await query(`
    CREATE TABLE IF NOT EXISTS applications (
      id VARCHAR(50) PRIMARY KEY,
      applicant VARCHAR(255) NOT NULL,
      ulpin VARCHAR(50) NOT NULL,
      type VARCHAR(100) NOT NULL,
      reason TEXT,
      submitted VARCHAR(50),
      status VARCHAR(100) NOT NULL,
      department VARCHAR(255),
      priority VARCHAR(50),
      step INT DEFAULT 1,
      notes TEXT
    );
  `);

  // 5. Create Documents Table
  await query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      ulpin VARCHAR(50) NOT NULL,
      date VARCHAR(50),
      status VARCHAR(50),
      ocr_data JSONB
    );
  `);

  // 6. Create Conflicts Table
  await query(`
    CREATE TABLE IF NOT EXISTS conflicts (
      id SERIAL PRIMARY KEY,
      ulpin VARCHAR(50) NOT NULL,
      field VARCHAR(255) NOT NULL,
      revenue_val TEXT,
      registration_val TEXT,
      gis_val TEXT,
      status VARCHAR(50)
    );
  `);

  // 7. Create Notifications Table
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      time VARCHAR(50),
      type VARCHAR(50),
      unread INT DEFAULT 1
    );
  `);

  // 8. Create Audit Logs Table
  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action VARCHAR(255) NOT NULL,
      actor VARCHAR(255),
      target VARCHAR(255),
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('✅ PostgreSQL Tables and PostGIS extension verified/created.');

  // 9. Auto-seed initial data if users table is empty
  const userCountRes = await query('SELECT COUNT(*) FROM users');
  if (parseInt(userCountRes.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding initial PostgreSQL data...');
    await seedDatabase();
  }
}

async function seedDatabase() {
  // Users
  await query(`
    INSERT INTO users (id, name, email, role, district) VALUES
    ('USR-001', 'Ananya Soren', 'ananya@jharkhand.gov.in', 'Citizen', 'Khunti'),
    ('USR-002', 'Rajesh Kumar Verma', 'officer@jharkhand.gov.in', 'Revenue Officer', 'Khunti')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Parcels with PostGIS Geometries
  const defaultParcels = [
    {
      ulpin: 'JH-22-1048-0021',
      owner: 'Ananya Soren',
      area: '2.50',
      land_type: 'Agricultural',
      location: 'Ranchi, Jharkhand',
      risk: 'Low',
      status: 'Verified',
      current_use: 'Agriculture',
      survey_number: '12/4',
      registered_value: '₹25,00,000',
      risk_scores: { overall: 24, document: 20, ownership: 15, mutation: 10, transaction: 10, encroachment: 10 },
      ownership_history: [
        { owner: 'Budhram Soren', year: 1998, event: 'Original Grant' },
        { owner: 'Somra Soren', year: 2012, event: 'Succession' },
        { owner: 'Ananya Soren', year: 2022, event: 'Mutation Approval' }
      ],
      polyWkt: 'POLYGON((85.2751 23.0782, 85.2778 23.0789, 85.2782 23.0764, 85.2755 23.0758, 85.2751 23.0782))'
    },
    {
      ulpin: 'JH-22-1048-0022',
      owner: 'Vikram Singh',
      area: '1.80',
      land_type: 'Commercial',
      location: 'Khunti, Jharkhand',
      risk: 'Medium',
      status: 'Pending Mutation',
      current_use: 'Commercial Store',
      survey_number: '88/2',
      registered_value: '₹48,00,000',
      risk_scores: { overall: 48, document: 40, ownership: 35, mutation: 30, transaction: 25, encroachment: 20 },
      ownership_history: [
        { owner: 'Ramesh Singh', year: 2005, event: 'Registered Sale Deed' },
        { owner: 'Vikram Singh', year: 2024, event: 'Sale Agreement' }
      ],
      polyWkt: 'POLYGON((85.2790 23.0785, 85.2815 23.0792, 85.2820 23.0770, 85.2794 23.0763, 85.2790 23.0785))'
    },
    {
      ulpin: 'JH-22-1048-0023',
      owner: 'Meera Toppo',
      area: '3.16',
      land_type: 'Residential',
      location: 'Ranchi, Jharkhand',
      risk: 'High',
      status: 'Under Review',
      current_use: 'Residential',
      survey_number: '44/7',
      registered_value: '₹62,00,000',
      risk_scores: { overall: 72, document: 70, ownership: 65, mutation: 60, transaction: 55, encroachment: 50 },
      ownership_history: [
        { owner: 'Kalyan Toppo', year: 2001, event: 'Inheritance' },
        { owner: 'Meera Toppo', year: 2025, event: 'Partition Deed' }
      ],
      polyWkt: 'POLYGON((85.2710 23.0810, 85.2742 23.0818, 85.2748 23.0791, 85.2715 23.0784, 85.2710 23.0810))'
    },
    {
      ulpin: 'JH-22-1048-0024',
      owner: 'Deepak Munda',
      area: '4.25',
      land_type: 'Agricultural',
      location: 'Khunti, Jharkhand',
      risk: 'Low',
      status: 'Verified',
      current_use: 'Crop Cultivation',
      survey_number: '102/1',
      registered_value: '₹38,00,000',
      risk_scores: { overall: 18, document: 15, ownership: 10, mutation: 10, transaction: 10, encroachment: 5 },
      ownership_history: [
        { owner: 'Sukhdeo Munda', year: 1995, event: 'Survey Settlement' },
        { owner: 'Deepak Munda', year: 2018, event: 'Succession' }
      ],
      polyWkt: 'POLYGON((85.2830 23.0760, 85.2865 23.0768, 85.2870 23.0739, 85.2835 23.0732, 85.2830 23.0760))'
    }
  ];

  for (const p of defaultParcels) {
    await query(`
      INSERT INTO parcels (ulpin, owner, area, land_type, location, risk, status, current_use, survey_number, registered_value, risk_scores, ownership_history, geom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ST_GeomFromText($13, 4326))
      ON CONFLICT (ulpin) DO NOTHING;
    `, [
      p.ulpin, p.owner, p.area, p.land_type, p.location, p.risk, p.status,
      p.current_use, p.survey_number, p.registered_value, JSON.stringify(p.risk_scores),
      JSON.stringify(p.ownership_history), p.polyWkt
    ]);
  }

  // Applications
  const defaultApps = [
    {
      id: 'MU-2026-0891',
      applicant: 'Ananya Soren',
      ulpin: 'JH-22-1048-0021',
      type: 'Mutation',
      reason: 'Registered sale or transfer',
      submitted: '24 Sep 2026',
      status: 'Under review',
      department: 'Revenue Department',
      priority: 'Normal',
      step: 2,
      notes: 'Sale deed attached and certified by registrar.'
    },
    {
      id: 'MU-2026-0874',
      applicant: 'Vikram Singh',
      ulpin: 'JH-22-1048-0022',
      type: 'Registration',
      reason: 'Registered sale deed',
      submitted: '20 Sep 2026',
      status: 'Submitted',
      department: 'Registration Department',
      priority: 'High',
      step: 1,
      notes: 'Commercial plot transfer request.'
    },
    {
      id: 'MU-2026-0812',
      applicant: 'Meera Toppo',
      ulpin: 'JH-22-1048-0023',
      type: 'Correction of record',
      reason: 'Correction of area entry',
      submitted: '12 Sep 2026',
      status: 'Approved',
      department: 'GIS / Survey Circle',
      priority: 'Normal',
      step: 4,
      notes: 'Boundary survey verified by GIS team.'
    }
  ];

  for (const app of defaultApps) {
    await query(`
      INSERT INTO applications (id, applicant, ulpin, type, reason, submitted, status, department, priority, step, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING;
    `, [app.id, app.applicant, app.ulpin, app.type, app.reason, app.submitted, app.status, app.department, app.priority, app.step, app.notes]);
  }

  // Documents
  const defaultDocs = [
    {
      name: 'Sale_Deed_2025.pdf',
      type: 'Sale Deed',
      ulpin: 'JH-22-1048-0021',
      date: '24 Sep 2026',
      status: 'Verified',
      ocr_data: { seller: 'Somra Soren', buyer: 'Ananya Soren', surveyNo: '12/4', area: '2.50 acres', declaredValue: '₹25,00,000', confidence: 94 }
    },
    {
      name: 'RoR_2025_certified.pdf',
      type: 'Record of Rights (Jamabandi)',
      ulpin: 'JH-22-1048-0021',
      date: '24 Sep 2026',
      status: 'Verified',
      ocr_data: { khataNo: '44', khasraNo: '12/4', owner: 'Ananya Soren', confidence: 98 }
    },
    {
      name: 'Identity_Proof_Aadhaar.pdf',
      type: 'Identity Proof',
      ulpin: 'JH-22-1048-0021',
      date: '24 Sep 2026',
      status: 'Verified',
      ocr_data: { name: 'Ananya Soren', verified: true }
    }
  ];

  for (const doc of defaultDocs) {
    await query(`
      INSERT INTO documents (name, type, ulpin, date, status, ocr_data)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [doc.name, doc.type, doc.ulpin, doc.date, doc.status, JSON.stringify(doc.ocr_data)]);
  }

  // Conflicts
  const defaultConflicts = [
    {
      ulpin: 'JH-22-1048-0021',
      field: 'Recorded owner',
      revenue_val: 'Ananya Soren',
      registration_val: 'Somra Soren',
      gis_val: 'No owner field recorded',
      status: 'Conflict'
    },
    {
      ulpin: 'JH-22-1048-0021',
      field: 'Parcel area',
      revenue_val: '2.50 acres',
      registration_val: '2.50 acres',
      gis_val: '2.72 acres',
      status: 'Conflict'
    }
  ];

  for (const c of defaultConflicts) {
    await query(`
      INSERT INTO conflicts (ulpin, field, revenue_val, registration_val, gis_val, status)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [c.ulpin, c.field, c.revenue_val, c.registration_val, c.gis_val, c.status]);
  }

  // Notifications
  const defaultNotifs = [
    { title: 'Application status update', message: 'MU-2026-0891 is currently under review by the Circle Officer.', time: '24 Sep 2026', type: 'application', unread: 1 },
    { title: 'Document verified', message: 'Sale_Deed_2025.pdf has been verified via OCR cross-check.', time: '23 Sep 2026', type: 'verified', unread: 1 },
    { title: 'Land Record update', message: 'Jamabandi extract reference updated for ULPIN JH-22-1048-0021.', time: '22 Sep 2026', type: 'verified', unread: 0 }
  ];

  for (const n of defaultNotifs) {
    await query(`
      INSERT INTO notifications (title, message, time, type, unread)
      VALUES ($1, $2, $3, $4, $5);
    `, [n.title, n.message, n.time, n.type, n.unread]);
  }

  // Audit Log
  await query(`
    INSERT INTO audit_logs (action, actor, target)
    VALUES ('SEED_DATABASE', 'System', 'PostgreSQL PostGIS DB');
  `);

  console.log('✅ PostgreSQL Database successfully populated with initial data!');
}
