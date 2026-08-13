// Verify database schema
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verifySchema() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('✅ Database tables created:');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    // Count records
    const eventCount = await pool.query('SELECT COUNT(*) FROM events');
    const participantCount = await pool.query('SELECT COUNT(*) FROM participants');
    const photoCount = await pool.query('SELECT COUNT(*) FROM photos');
    
    console.log('\n📊 Current data:');
    console.log('  - Events:', eventCount.rows[0].count);
    console.log('  - Participants:', participantCount.rows[0].count);
    console.log('  - Photos:', photoCount.rows[0].count);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

verifySchema();
