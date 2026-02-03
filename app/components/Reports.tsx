'use client'

import { InventoryItem, HistoryItem } from '../types';

interface ReportsProps {
  inventory: InventoryItem[];
  history: HistoryItem[];
}

export function Reports({ inventory, history }: ReportsProps) {
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const categoryCounts = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports</h1>
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">Rp {totalValue.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="flex justify-between">
                <span className="text-gray-700">{category}</span>
                <span className="font-medium">{count} items</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alert</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500">No items are low in stock</p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-600">{item.quantity} / {item.minStock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
