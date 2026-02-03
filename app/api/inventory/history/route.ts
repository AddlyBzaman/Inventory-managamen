import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { historyItems } from '../../../../lib/db/schema';
import { desc } from 'drizzle-orm';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    // Use direct client for consistency with delete history insert
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    
    const result = await client.execute('SELECT * FROM history_items ORDER BY timestamp DESC');
    
    console.log('Direct client history result:', result.rows.length, 'records');
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}
