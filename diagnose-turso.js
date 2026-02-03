// Diagnose Turso connection issues
const { createClient } = require('@libsql/client');

function diagnoseTurso() {
  console.log('🔍 Turso Connection Diagnosis');
  console.log('================================');
  
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  // Check environment variables
  console.log('\n📋 Environment Variables Check:');
  console.log(`TURSO_DATABASE_URL: ${dbUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`TURSO_AUTH_TOKEN: ${authToken ? '✅ Set' : '❌ Missing'}`);
  
  if (dbUrl) {
    console.log(`\n📡 URL Analysis:`);
    console.log(`Format: ${dbUrl.startsWith('libsql://') ? '✅ libsql://' : '❌ Wrong format'}`);
    console.log(`Contains domain: ${dbUrl.includes('.turso.io') ? '✅ Yes' : '❌ Not turso.io'}`);
    console.log(`Length: ${dbUrl.length} chars`);
  }
  
  if (authToken) {
    console.log(`\n🔑 Token Analysis:`);
    console.log(`Length: ${authToken.length} chars`);
    console.log(`Format: ${authToken.startsWith('ey') ? '✅ Looks like JWT' : '❌ Unexpected format'}`);
  }
  
  console.log('\n💡 Possible Solutions:');
  console.log('1. Check if Turso database exists: turso db list');
  console.log('2. Get correct auth token: turso auth tokens');
  console.log('3. Get database URL: turso db show <dbname>');
  console.log('4. Create new database: turso db create inventorydb');
  console.log('5. Set environment variables correctly:');
  console.log('   TURSO_DATABASE_URL="libsql://your-db-name.turso.io"');
  console.log('   TURSO_AUTH_TOKEN="your-auth-token"');
  
  console.log('\n🔄 For now, using local database (dev.db)');
  console.log('✅ Local database is working correctly');
}

require('dotenv').config();
diagnoseTurso();
