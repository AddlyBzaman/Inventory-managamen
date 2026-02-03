'use client'

import { InventoryItem, HistoryItem } from '../types';
import { Package, TrendingUp, TrendingDown, AlertTriangle, Activity, DollarSign, ShoppingCart, Users } from 'lucide-react';

interface DashboardProps {
  inventory: InventoryItem[];
  history: HistoryItem[];
}

export function Dashboard({ inventory, history }: DashboardProps) {
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const recentActivity = history.slice(0, 5);
  
  const totalCategories = [...new Set(inventory.map(item => item.category))].length;
  const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
  const recentAdditions = history.filter(item => item.action === 'added').length;
  const recentUpdates = history.filter(item => item.action === 'updated').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your inventory management</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalItems}</p>
              <p className="text-xs text-gray-500 mt-1">Across {totalCategories} categories</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">Rp {totalValue.toLocaleString('id-ID')}</p>
              <p className="text-xs text-gray-500 mt-1">Current inventory value</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{lowStockItems}</p>
              <p className="text-xs text-gray-500 mt-1">{outOfStockItems} out of stock</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{history.length}</p>
              <p className="text-xs text-gray-500 mt-1">{recentAdditions} added, {recentUpdates} updated</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-gray-600" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Start by adding or updating items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.action === 'added' ? 'bg-green-500' :
                        activity.action === 'updated' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.action} by {activity.userName || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {activity.action === 'added' ? '+' : activity.action === 'updated' ? '±' : '-'}{Math.abs(activity.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Low Stock Items
            </h2>
          </div>
          <div className="p-6">
            {lowStockItems === 0 ? (
              <div className="text-center py-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-500">All items are well stocked</p>
                <p className="text-sm text-gray-400 mt-1">No items need attention</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inventory
                  .filter(item => item.quantity <= item.minStock)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          item.quantity === 0 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {item.quantity} / {item.minStock}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity === 0 ? 'Out of stock' : `Need ${item.minStock - item.quantity} more`}
                        </p>
                      </div>
                    </div>
                  ))}
                {lowStockItems > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    And {lowStockItems - 5} more items...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Category Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...new Set(inventory.map(item => item.category))].map((category) => {
              const categoryItems = inventory.filter(item => item.category === category);
              const categoryValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const lowStockCount = categoryItems.filter(item => item.quantity <= item.minStock).length;
              
              return (
                <div key={category} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-900 text-sm mb-2">{category}</h3>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">{categoryItems.length}</span> items
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Rp {categoryValue.toLocaleString('id-ID')}</span> value
                    </p>
                    {lowStockCount > 0 && (
                      <p className="text-xs text-red-600">
                        <span className="font-medium">{lowStockCount}</span> low stock
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
