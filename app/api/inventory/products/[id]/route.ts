import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { products, historyItems } from '../../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@libsql/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productData = await request.json();
    
    // Create direct client connection (use environment variables)
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    
    console.log('Updating product with ID:', id);
    
    // Get current product before update for history
    const productResult = await client.execute('SELECT * FROM products WHERE id = ?', [id]);
    const currentProduct = productResult.rows[0];
    
    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Update the product
    await client.execute(`
      UPDATE products 
      SET name = ?, description = ?, category = ?, quantity = ?, minStock = ?, price = ?, location = ?, sku = ?, unit = ?, updatedAt = ?
      WHERE id = ?
    `, [
      productData.name || currentProduct.name,
      productData.description || currentProduct.description,
      productData.category || currentProduct.category,
      productData.quantity || currentProduct.quantity,
      productData.minStock || currentProduct.minStock,
      productData.price || currentProduct.price,
      productData.location || currentProduct.location,
      productData.sku || currentProduct.sku,
      productData.unit || currentProduct.unit,
      new Date().toISOString(),
      id
    ]);
    
    // Add history record for stock update
    const oldQuantity = currentProduct.quantity;
    const newQuantity = productData.quantity || currentProduct.quantity;
    
    if (oldQuantity !== newQuantity) {
      try {
        const historyRecord = {
          id: crypto.randomUUID(),
          productId: id,
          productName: currentProduct.name,
          action: 'updated',
          quantity: newQuantity,
          timestamp: Date.now().toString(),
          userId: 'system',
          userName: 'System',
          details: `Stock updated from ${oldQuantity} to ${newQuantity} ${currentProduct.unit} for ${currentProduct.name}`
        };
        
        // Disable foreign key constraints and insert history
        await client.execute('PRAGMA foreign_keys = OFF');
        await client.execute(`
          INSERT INTO history_items (id, productId, productName, action, quantity, timestamp, userId, userName, details)
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
        await client.execute('PRAGMA foreign_keys = ON');
        
        console.log('History record added for stock update:', historyRecord);
      } catch (historyError) {
        console.warn('Failed to add history record:', historyError);
        // Continue even if history fails
      }
    }
    
    console.log('Product updated successfully');
    
    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Create direct client connection (use environment variables)
    console.log('Environment check - TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
    console.log('Environment check - TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    
    console.log('Deleting product with ID:', id);
    
    // Get current product before delete for history
    const [currentProduct] = await db.select().from(products).where(eq(products.id, id));
    
    // Delete the product first
    const result = await client.execute(`DELETE FROM products WHERE id = ?`, [id]);
    
    // Add history record AFTER delete (to avoid cascade delete)
    if (currentProduct && result.rowsAffected > 0) {
      try {
        const historyRecord = {
          id: crypto.randomUUID(),
          productId: id, // Keep reference even though product is deleted
          productName: currentProduct.name,
          action: 'deleted',
          quantity: currentProduct.quantity,
          timestamp: Date.now().toString(),
          userId: 'system',
          userName: 'System',
          details: `Deleted ${currentProduct.quantity} ${currentProduct.unit} of ${currentProduct.name}`
        };
        
        // Disable foreign key constraints and insert history
        await client.execute('PRAGMA foreign_keys = OFF');
        await client.execute(`
          INSERT INTO history_items (id, productId, productName, action, quantity, timestamp, userId, userName, details)
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
        await client.execute('PRAGMA foreign_keys = ON');
        
        console.log('History record added for deleted product:', historyRecord);
      } catch (historyError) {
        console.warn('Failed to add history record:', historyError);
        // Continue even if history fails
      }
    }
    
    console.log('Delete successful:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}
