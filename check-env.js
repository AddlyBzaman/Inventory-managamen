// Check environment variables
const { config } = require('dotenv');

console.log('🔍 Checking environment variables...');
config();

console.log('\n📋 Environment Variables:');
console.log(`TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);

if (process.env.TURSO_DATABASE_URL) {
  console.log(`URL: ${process.env.TURSO_DATABASE_URL}`);
  console.log(`Starts with libsql://: ${process.env.TURSO_DATABASE_URL.startsWith('libsql://') ? '✅ Yes' : '❌ No'}`);
}

if (process.env.TURSO_AUTH_TOKEN) {
  console.log(`Token length: ${process.env.TURSO_AUTH_TOKEN.length}`);
}
