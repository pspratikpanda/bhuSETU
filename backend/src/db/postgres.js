import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.POSTGRES_URL;
const schema = process.env.POSTGIS_SCHEMA || 'gis';

if (!connectionString) {
  console.error('❌ POSTGRES_URL environment variable is required. Exiting.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

export const query = async (text, params = []) => {
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
  const res = await query('SELECT NOW()');
  console.log(`✅ Connected to PostgreSQL (Schema: ${schema}) at ${res.rows[0].now}`);
};

export default pool;
