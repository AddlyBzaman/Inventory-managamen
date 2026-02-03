import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    console.log('Starting database migration...');
    
    // Migration steps
    const migrations = [
      // Add minStock column if not exists
      `ALTER TABLE products ADD COLUMN minStock INTEGER DEFAULT 5 NOT NULL`,
      
      // Add location column if not exists  
      `ALTER TABLE products ADD COLUMN location TEXT`,
      
      // Drop old minQuantity column if exists
      `ALTER TABLE products DROP COLUMN minQuantity`,
      
      // Recreate history_items table
      `DROP TABLE IF EXISTS history_items`,
      `CREATE TABLE history_items (
        id TEXT PRIMARY KEY NOT NULL,
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        action TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
        userId TEXT NOT NULL,
        userName TEXT NOT NULL,
        details TEXT,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
      )`
    ];
    
    const results = [];
    
    for (const migration of migrations) {
      try {
        await db.run(sql.raw(migration));
        results.push({ success: true, query: migration });
        console.log('Migration success:', migration);
      } catch (error) {
        // Ignore errors for columns that already exist
        if (error.message.includes('duplicate column name') || 
            error.message.includes('no such column') ||
            error.message.includes('no such table')) {
          results.push({ success: true, query: migration, note: 'Already exists' });
          console.log('Migration skipped (already exists):', migration);
        } else {
          results.push({ success: false, query: migration, error: error.message });
          console.error('Migration failed:', migration, error);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed',
      results 
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Migration failed', error: error.message },
      { status: 500 }
    );
  }
}
