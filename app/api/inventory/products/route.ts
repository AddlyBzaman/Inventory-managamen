import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { products, historyItems } from '../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json({ success: true, data: allProducts });
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
    
    const newProduct = {
      id: crypto.randomUUID(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.insert(products).values(newProduct);
    
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
    
    await db.insert(historyItems).values(historyRecord);
    
    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
