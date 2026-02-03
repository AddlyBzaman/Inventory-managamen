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
    
    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}
