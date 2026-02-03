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
    
    console.log('🔍 PUT /api/products/{id} - Starting...');
    console.log('📦 Update data received:', body);
    
    // Get current product before update for history
    const [currentProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    
    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const updatedData = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    console.log('✨ Updated data:', updatedData);

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

    // Add history record for update
    try {
      const client = createClient({
        url: process.env.TURSO_DATABASE_URL || '',
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      });
      
      await client.execute(`
        INSERT INTO history_items (id, productId, productName, action, quantity, timestamp, userId, userName, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(),
        updatedProduct.id,
        updatedProduct.name,
        'UPDATE',
        updatedProduct.quantity,
        new Date().getTime().toString(), // Use numeric timestamp for schema
        'system', // TODO: Get actual user ID from auth
        'System',
        `Memperbarui produk: ${updatedProduct.name}`
      ]);
      
      console.log('✅ Update history record created');
    } catch (historyError) {
      console.warn('Failed to create update history:', historyError);
      // Continue even if history fails
    }

    console.log('✅ Product updated successfully!');
    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully',
      data: updatedProduct 
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Failed to update product', message: error.message },
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
    
    console.log('🗑️ DELETE /api/products/{id} - Starting...');
    console.log('🆔 Product ID to delete:', id);
    
    // Get product info before delete for history
    const [productToDelete] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    
    console.log('📦 Product found:', !!productToDelete);
    if (productToDelete) {
      console.log('📦 Product details:', {
        id: productToDelete.id,
        name: productToDelete.name,
        quantity: productToDelete.quantity
      });
    }
    
    if (!productToDelete) {
      console.log('❌ Product not found in database');
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
      console.log('🔄 Starting delete history creation...');
      
      const client = createClient({
        url: process.env.TURSO_DATABASE_URL || '',
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      });
      
      const historyId = crypto.randomUUID();
      const timestamp = new Date().getTime().toString();
      
      console.log('📝 Preparing history record:', {
        historyId,
        productId: deletedProduct.id,
        productName: deletedProduct.name,
        action: 'DELETE',
        quantity: deletedProduct.quantity,
        timestamp,
        userId: 'system',
        userName: 'System',
        details: `Menghapus produk: ${deletedProduct.name} (${deletedProduct.quantity} ${deletedProduct.unit})`
      });
      
      await client.execute(`
        INSERT INTO history_items (id, productId, productName, action, quantity, timestamp, userId, userName, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        historyId,
        deletedProduct.id,
        deletedProduct.name,
        'DELETE',
        deletedProduct.quantity,
        timestamp,
        'system',
        'System',
        `Menghapus produk: ${deletedProduct.name} (${deletedProduct.quantity} ${deletedProduct.unit})`
      ]);
      
      console.log('✅ Delete history record created successfully');
      
      // Verify the record was inserted
      const verifyResult = await client.execute(`
        SELECT * FROM history_items WHERE productId = ? AND action = 'DELETE' ORDER BY timestamp DESC LIMIT 1
      `, [deletedProduct.id]);
      
      console.log('🔍 Verification - Record found in database:', verifyResult.rows.length > 0);
      if (verifyResult.rows.length > 0) {
        console.log('📋 Stored record:', verifyResult.rows[0]);
      } else {
        console.log('❌ ERROR: History record was NOT found in database after insert!');
      }
      
    } catch (historyError) {
      console.error('❌ FAILED to create delete history:', historyError);
      console.error('❌ History error details:', {
        message: historyError.message,
        stack: historyError.stack
      });
      // Continue even if history fails - but log the error
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
