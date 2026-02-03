import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// GET all products
export async function GET() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    const result = await client.execute('SELECT * FROM products ORDER BY updatedAt DESC');
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/products - Starting...');
    
    const productData = await request.json();
    console.log('📦 Product data received:', productData);
    
    console.log('🔗 Database URL:', process.env.TURSO_DATABASE_URL ? 'Set' : 'Not set');
    console.log('🔐 Auth Token:', process.env.TURSO_AUTH_TOKEN ? 'Set' : 'Not set');
    
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
    
    console.log('✨ New product object:', newProduct);
    
    console.log('💾 Executing SQL INSERT...');
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
    
    // Add history record for product creation
    console.log('📝 Adding history record...');
    await client.execute(`
      INSERT INTO history_items (id, productId, productName, action, quantity, timestamp, userId, userName, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      crypto.randomUUID(),
      newProduct.id,
      newProduct.name,
      'CREATE',
      newProduct.quantity,
      new Date().getTime().toString(), // Use numeric timestamp for schema
      'system', // TODO: Get actual user ID from auth
      'System',
      `Menambahkan produk baru: ${newProduct.name} (${newProduct.quantity} ${newProduct.unit})`
    ]);
    
    console.log('✅ Product and history created successfully!');
    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { success: false, message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}
