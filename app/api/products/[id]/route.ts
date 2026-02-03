import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { products } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@libsql/client';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedData = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    const [updatedProduct] = await db
      .update(products)
      .set(updatedData)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get product info before delete for history
    const [productToDelete] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    
    if (!productToDelete) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete the product
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    // Add history record for deletion
    try {
      const client = createClient({
        url: process.env.TURSO_DATABASE_URL || '',
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      });
      
      await client.execute(`
        INSERT INTO history_items (id, product_id, action, quantity_before, quantity_after, user_id, timestamp, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(),
        deletedProduct.id,
        'DELETE',
        deletedProduct.quantity,
        0,
        'system', // TODO: Get actual user ID from auth
        new Date().toISOString(),
        `Menghapus produk: ${deletedProduct.name} (${deletedProduct.quantity} ${deletedProduct.unit})`
      ]);
      
      console.log('✅ Delete history record created');
    } catch (historyError) {
      console.warn('Failed to create delete history:', historyError);
      // Continue even if history fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully',
      data: deletedProduct 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
