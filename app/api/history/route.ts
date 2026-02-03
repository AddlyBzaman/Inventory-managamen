import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    
    const result = await client.execute('SELECT * FROM history_items ORDER BY timestamp DESC');
    
    console.log('📜 History result:', result.rows.length, 'records');
    
    // Filter DELETE records for verification
    const deleteRecords = result.rows.filter(r => r.action === 'DELETE');
    console.log('🗑️ Delete records found:', deleteRecords.length);
    if (deleteRecords.length > 0) {
      console.log('📋 Latest delete records:', deleteRecords.slice(0, 3).map(r => ({
        productName: r.productName,
        action: r.action,
        details: r.details,
        timestamp: r.timestamp
      })));
    }
    
    console.log('📝 All history records:', result.rows.map(r => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      action: r.action,
      quantity: r.quantity,
      timestamp: r.timestamp,
      userId: r.userId,
      userName: r.userName,
      details: r.details
    })));
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}
