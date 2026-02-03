import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    const allProducts = await client.execute('SELECT * FROM products ORDER BY createdAt DESC');
    
    return NextResponse.json({ success: true, data: allProducts.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    
    const newProduct = {
      id: crypto.randomUUID(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert product
    await client.execute(`
      INSERT INTO products (id, name, description, category, quantity, minStock, price, location, sku, unit, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newProduct.id,
      newProduct.name,
      newProduct.description,
      newProduct.category,
      newProduct.quantity,
      newProduct.minStock,
      newProduct.price,
      newProduct.location,
      newProduct.sku,
      newProduct.unit,
      newProduct.createdAt,
      newProduct.updatedAt
    ]);
    
    // Add history record
    const historyRecord = {
      id: crypto.randomUUID(),
      productId: newProduct.id,
      productName: newProduct.name,
      action: 'added',
      quantity: newProduct.quantity,
      timestamp: Date.now().toString(),
      userId: 'system', // TODO: Get from auth session
      userName: 'System',
      details: `Added ${newProduct.quantity} ${newProduct.unit} of ${newProduct.name}`
    };
    
    await client.execute(`
      INSERT INTO historyItems (id, productId, productName, action, quantity, timestamp, userId, userName, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      historyRecord.id,
      historyRecord.productId,
      historyRecord.productName,
      historyRecord.action,
      historyRecord.quantity,
      historyRecord.timestamp,
      historyRecord.userId,
      historyRecord.userName,
      historyRecord.details
    ]);
    
    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
