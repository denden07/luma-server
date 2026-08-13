// Add host_code column to events table
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  try {
    console.log('Running migration: Add host_code to events table...');
    
    // Add column
    await pool.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS host_code VARCHAR(50) NOT NULL DEFAULT '';
    `);
    
    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_host_code ON events(host_code);
    `);
    
    console.log('✅ Migration completed successfully');
    
    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 Events table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
