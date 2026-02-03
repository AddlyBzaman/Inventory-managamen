'use client'

import { useState } from 'react';
import { InventoryItem } from '../types';
import { Search, Plus, Edit2, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown, PlusCircle, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryListProps {
  items: InventoryItem[];
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void; // Add refresh callback
}

export function InventoryList({ items, onUpdate, onDelete, onRefresh }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(items.map(item => item.category))];

  // Calculate stats
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.quantity <= item.minStock).length;
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage your inventory items</p>
        </div>
        <button
          onClick={() => window.location.href = '/add'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalItems}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{lowStockItems}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">Rp {totalValue.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first item'
              }
            </p>
            <button
              onClick={() => window.location.href = '/add'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const isLowStock = item.quantity <= item.minStock;
                  const totalItemValue = item.price * item.quantity;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          {item.location && (
                            <div className="text-xs text-gray-400">📍 {item.location}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            isLowStock ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.quantity} {item.unit}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {item.minStock} {item.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          Rp {item.price.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          Rp {totalItemValue.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {/* Add Stock Button */}
                          <button
                            onClick={() => {
                              const quantity = prompt(`Tambah stok untuk ${item.name}:`, '10');
                              if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
                                const notes = prompt('Catatan (opsional):', 'Pembelian dari supplier');
                                fetch(`/api/products/${item.id}/stock`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    quantity: Number(quantity),
                                    type: 'add',
                                    notes: notes || ''
                                  })
                                })
                                .then(response => response.json())
                                .then(data => {
                                  if (data.success) {
                                    toast.success(`Stok berhasil ditambah! ${data.data.change} ${item.unit}`);
                                    // Refresh data instead of full page reload
                                    onRefresh();
                                  } else {
                                    toast.error(`Gagal tambah stok: ${data.message}`);
                                  }
                                })
                                .catch(error => {
                                  console.error('Error adding stock:', error);
                                  toast.error('Gagal tambah stok. Silakan coba lagi.');
                                });
                              }
                            }}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Tambah stok"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                          
                          {/* Sell/Reduce Stock Button */}
                          <button
                            onClick={() => {
                              const quantity = prompt(`Jual ${item.name}:`, '1');
                              if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
                                const notes = prompt('Catatan (opsional):', 'Pelanggan');
                                fetch(`/api/products/${item.id}/stock`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    quantity: Number(quantity),
                                    type: 'subtract',
                                    notes: notes || ''
                                  })
                                })
                                .then(response => response.json())
                                .then(data => {
                                  if (data.success) {
                                    toast.success(`Stok berhasil dikurangi! ${data.data.change} ${item.unit}`);
                                    // Refresh data instead of full page reload
                                    onRefresh();
                                  } else {
                                    toast.error(`Gagal kurangi stok: ${data.message}`);
                                  }
                                })
                                .catch(error => {
                                  console.error('Error reducing stock:', error);
                                  toast.error('Gagal kurangi stok. Silakan coba lagi.');
                                });
                              }
                            }}
                            className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                            title="Jual/Kurangi stok"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              const newQuantity = prompt(`Update quantity for ${item.name}:`, item.quantity.toString());
                              if (newQuantity && !isNaN(Number(newQuantity))) {
                                onUpdate(item.id, { quantity: Number(newQuantity) });
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="Update quantity"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                // Use main API (now fixed!)
                                fetch(`/api/products/${item.id}`, {
                                  method: 'DELETE',
                                })
                                .then(response => response.json())
                                .then(data => {
                                  if (data.success) {
                                    onDelete(item.id);
                                    alert('Item deleted successfully!');
                                  } else {
                                    alert(`Failed to delete: ${data.message}`);
                                  }
                                })
                                .catch(error => {
                                  console.error('Delete error:', error);
                                  alert('Failed to delete item. Please try again.');
                                });
                              }
                            }}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredItems.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </div>
      )}
    </div>
  );
}
