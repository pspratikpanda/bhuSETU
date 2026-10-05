import dotenv from 'dotenv';
dotenv.config();

import { query, connectDB } from './postgres.js';

async function seed() {
  await connectDB();
  console.log('🌱 Seeding PostgreSQL database...');

  const schema = process.env.POSTGIS_SCHEMA || 'gis';

  // Ensure schema and extension exist
  await query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);
  await query(`CREATE EXTENSION IF NOT EXISTS postgis SCHEMA ${schema};`);

  // Users
  await query(`
    INSERT INTO users (id, name, email, role, district) VALUES
    ('USR-001', 'Ananya Soren', 'ananya@jharkhand.gov.in', 'Citizen', 'Khunti'),
    ('USR-002', 'Rajesh Kumar Verma', 'officer@jharkhand.gov.in', 'Revenue Officer', 'Khunti')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Parcels
  const parcels = [
    {
      ulpin: 'JH-22-1048-0021', owner: 'Ananya Soren', area: '2.50', land_type: 'Agricultural',
      location: 'Ranchi, Jharkhand', risk: 'Low', status: 'Verified', current_use: 'Agriculture',
      survey_number: '12/4', registered_value: '₹25,00,000',
      risk_scores: { overall: 24, document: 20, ownership: 15, mutation: 10, transaction: 10, encroachment: 10 },
      ownership_history: [
        { owner: 'Budhram Soren', year: 1998, event: 'Original Grant' },
        { owner: 'Somra Soren', year: 2012, event: 'Succession' },
        { owner: 'Ananya Soren', year: 2022, event: 'Mutation Approval' }
      ],
      polyWkt: 'POLYGON((85.2751 23.0782, 85.2778 23.0789, 85.2782 23.0764, 85.2755 23.0758, 85.2751 23.0782))'
    },
    {
      ulpin: 'JH-22-1048-0022', owner: 'Vikram Singh', area: '1.80', land_type: 'Commercial',
      location: 'Khunti, Jharkhand', risk: 'Medium', status: 'Pending Mutation', current_use: 'Commercial Store',
      survey_number: '88/2', registered_value: '₹48,00,000',
      risk_scores: { overall: 48, document: 40, ownership: 35, mutation: 30, transaction: 25, encroachment: 20 },
      ownership_history: [
        { owner: 'Ramesh Singh', year: 2005, event: 'Registered Sale Deed' },
        { owner: 'Vikram Singh', year: 2024, event: 'Sale Agreement' }
      ],
      polyWkt: 'POLYGON((85.2790 23.0785, 85.2815 23.0792, 85.2820 23.0770, 85.2794 23.0763, 85.2790 23.0785))'
    },
    {
      ulpin: 'JH-22-1048-0023', owner: 'Meera Toppo', area: '3.16', land_type: 'Residential',
      location: 'Ranchi, Jharkhand', risk: 'High', status: 'Under Review', current_use: 'Residential',
      survey_number: '44/7', registered_value: '₹62,00,000',
      risk_scores: { overall: 72, document: 70, ownership: 65, mutation: 60, transaction: 55, encroachment: 50 },
      ownership_history: [
        { owner: 'Kalyan Toppo', year: 2001, event: 'Inheritance' },
        { owner: 'Meera Toppo', year: 2025, event: 'Partition Deed' }
      ],
      polyWkt: 'POLYGON((85.2710 23.0810, 85.2742 23.0818, 85.2748 23.0791, 85.2715 23.0784, 85.2710 23.0810))'
    },
    {
      ulpin: 'JH-22-1048-0024', owner: 'Deepak Munda', area: '4.25', land_type: 'Agricultural',
      location: 'Khunti, Jharkhand', risk: 'Low', status: 'Verified', current_use: 'Crop Cultivation',
      survey_number: '102/1', registered_value: '₹38,00,000',
      risk_scores: { overall: 18, document: 15, ownership: 10, mutation: 10, transaction: 10, encroachment: 5 },
      ownership_history: [
        { owner: 'Sukhdeo Munda', year: 1995, event: 'Survey Settlement' },
        { owner: 'Deepak Munda', year: 2018, event: 'Succession' }
      ],
      polyWkt: 'POLYGON((85.2830 23.0760, 85.2865 23.0768, 85.2870 23.0739, 85.2835 23.0732, 85.2830 23.0760))'
    }
  ];

  for (const p of parcels) {
    await query(`
      INSERT INTO parcels (ulpin, owner, area, land_type, location, risk, status, current_use, survey_number, registered_value, risk_scores, ownership_history, geom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ST_GeomFromText($13, 4326))
      ON CONFLICT (ulpin) DO NOTHING;
    `, [p.ulpin, p.owner, p.area, p.land_type, p.location, p.risk, p.status, p.current_use, p.survey_number, p.registered_value, JSON.stringify(p.risk_scores), JSON.stringify(p.ownership_history), p.polyWkt]);
  }

  // Audit Log
  await query(`INSERT INTO audit_logs (action, actor, target) VALUES ('SEED_DATABASE', 'System', 'PostgreSQL PostGIS DB');`);

  console.log('✅ PostgreSQL database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
