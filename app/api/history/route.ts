import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    
    const result = await client.execute('SELECT * FROM history_items ORDER BY timestamp DESC');
    
    console.log('History result:', result.rows.length, 'records');
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}
