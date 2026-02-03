import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { quantity, type, notes } = await request.json(); // type: 'add' | 'subtract', quantity: number
    
    // Create direct client connection
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
    
    console.log('Updating stock for product ID:', id, 'Type:', type, 'Quantity:', quantity);
    
    // Get current product
    const productResult = await client.execute('SELECT * FROM products WHERE id = ?', [id]);
    const currentProduct = productResult.rows[0];
    
    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    const currentQuantity = Number(currentProduct.quantity);
    let newQuantity;
    
    if (type === 'add') {
      newQuantity = currentQuantity + quantity;
    } else if (type === 'subtract') {
      newQuantity = currentQuantity - quantity;
      if (newQuantity < 0) {
        return NextResponse.json(
          { success: false, message: 'Insufficient stock' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid type. Use "add" or "subtract"' },
        { status: 400 }
      );
    }
    
    // Update stock
    await client.execute(`
      UPDATE products 
      SET quantity = ?, updatedAt = ?
      WHERE id = ?
    `, [newQuantity, new Date().toISOString(), id]);
    
    // Add history record
    try {
      const historyRecord = {
        id: crypto.randomUUID(),
        productId: id,
        productName: currentProduct.name,
        action: type === 'add' ? 'added' : 'sold',
        quantity: newQuantity,
        timestamp: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        details: type === 'add' 
          ? `Added ${quantity} ${currentProduct.unit} to ${currentProduct.name}. New stock: ${newQuantity} ${currentProduct.unit}. ${notes || ''}`
          : `Sold ${quantity} ${currentProduct.unit} of ${currentProduct.name}. Remaining stock: ${newQuantity} ${currentProduct.unit}. ${notes || ''}`
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
    }
    
    console.log('Stock updated successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: `Stock ${type === 'add' ? 'added' : 'sold'} successfully`,
      data: {
        oldQuantity: currentQuantity,
        newQuantity: newQuantity,
        change: quantity,
        type: type
      }
    });
    
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server', error: error.message },
      { status: 500 }
    );
  }
}
