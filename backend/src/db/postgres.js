import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.POSTGRES_URL;
const schema = process.env.POSTGIS_SCHEMA || 'gis';

let isPostgresAvailable = false;
let pool = null;

if (connectionString && !connectionString.includes('[YOUR-PASSWORD]')) {
  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });
}

export const isPgConnected = () => isPostgresAvailable;

export const query = async (text, params = []) => {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized');
  }
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schema}, public;`);
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
};

export const connectDB = async () => {
  if (!pool) {
    console.log('ℹ️ Local Mode: PostgreSQL URL not configured. Using local JSON store.');
    return false;
  }
  try {
    const res = await query('SELECT NOW()');
    isPostgresAvailable = true;
    console.log(`✅ Connected to Supabase/PostgreSQL (Schema: ${schema}) at ${res.rows[0].now}`);
    return true;
  } catch (err) {
    isPostgresAvailable = false;
    console.warn(`⚠️ PostgreSQL Notice: ${err.message}`);
    console.log(`💡 Cloud Deployment Note: Render/Vercel will execute queries directly on Supabase PostgreSQL + PostGIS (Schema: ${schema}).`);
    return false;
  }
};

export default pool;
