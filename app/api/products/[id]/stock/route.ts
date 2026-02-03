import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { quantity, type, notes } = await request.json();
    const { id: productId } = await params;

    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    // Get current product
    const productResult = await client.execute('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const currentProduct = productResult.rows[0] as any;
    const currentQuantity = Number(currentProduct.quantity);
    
    // Calculate new quantity
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
        { success: false, message: 'Invalid operation type' },
        { status: 400 }
      );
    }

    // Update product quantity
    await client.execute(
      'UPDATE products SET quantity = ?, updatedAt = ? WHERE id = ?',
      [newQuantity, new Date().toISOString(), productId]
    );

    // Add history record
    const historyRecord = {
      id: crypto.randomUUID(),
      productId: productId,
      productName: currentProduct.name,
      action: type === 'add' ? 'stock_added' : 'stock_subtracted',
      quantity: quantity,
      timestamp: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      details: `${type === 'add' ? 'Added' : 'Subtracted'} ${quantity} units. ${notes || ''}`
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

    return NextResponse.json({
      success: true,
      data: {
        productId,
        previousQuantity: currentQuantity,
        newQuantity,
        change: quantity,
        type,
        notes
      }
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update stock', error: error.message },
      { status: 500 }
    );
  }
}
