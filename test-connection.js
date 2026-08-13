// Test PostgreSQL connection
import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Denden_071798@localhost:5432/madetogether';

console.log('Testing connection to PostgreSQL...');
console.log('Database URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

async function testConnection() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Test if database exists
    const dbResult = await client.query(`SELECT datname FROM pg_database WHERE datname = 'madetogether'`);
    if (dbResult.rows.length > 0) {
      console.log('✅ Database "madetogether" exists');
    } else {
      console.log('❌ Database "madetogether" does NOT exist');
      console.log('   Please create it first:');
      console.log('   1. Open pgAdmin');
      console.log('   2. Right-click Databases → Create → Database');
      console.log('   3. Name: madetogether');
      console.log('   OR use SQL: CREATE DATABASE madetogether;');
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if PostgreSQL is running');
    console.log('2. Verify the password is correct: Denden_071798');
    console.log('3. Try connecting with pgAdmin to confirm credentials');
    console.log('4. Check if your PostgreSQL is listening on port 5432');
    console.log('\n💡 Common fixes:');
    console.log('- Open pgAdmin and verify you can connect with user "postgres"');
    console.log('- Check PostgreSQL service is running in Services (services.msc)');
    console.log('- Your password might need URL encoding if it has special chars');
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();
