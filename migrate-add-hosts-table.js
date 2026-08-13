// Migration: Add hosts table
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/madetogether',
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration: Add hosts table...');
    
    // Create hosts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hosts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(6) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create index on code for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hosts_code ON hosts(code);
    `);
    
    console.log('✅ Migration completed successfully');
    
    // Show table structure
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hosts'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 Hosts table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
