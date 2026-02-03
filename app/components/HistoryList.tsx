'use client'

import { useState } from 'react';
import { HistoryItem } from '../types';
import { Search, Filter, Plus, Minus, Edit, Trash2, Calendar, User, Package, Clock } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
}

export function HistoryList({ items }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  // Filter items based on search and action
  const filteredItems = items.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || item.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  // Get action counts
  const actionCounts = {
    create: items.filter(item => item.action === 'CREATE' || item.action === 'added').length,
    update: items.filter(item => item.action === 'UPDATE' || item.action === 'updated').length,
    delete: items.filter(item => item.action === 'DELETE' || item.action === 'deleted').length,
    stock: items.filter(item => item.action === 'stock_added' || item.action === 'stock_subtracted').length
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'added':
        return 'Items Added';
      case 'UPDATE':
      case 'updated':
        return 'Items Updated';
      case 'DELETE':
      case 'deleted':
        return 'Items Deleted';
      case 'stock_added':
        return 'Stock Added';
      case 'stock_subtracted':
        return 'Stock Reduced';
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'added':
        return <Plus className="h-4 w-4" />;
      case 'updated':
        return <Edit className="h-4 w-4" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'added':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'updated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: number | Date) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">History</h1>
          <p className="text-gray-500 mt-1">Track all inventory changes and activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{items.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Added</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{actionCounts.create}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Updated</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{actionCounts.update}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Deleted</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{actionCounts.delete}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
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
                placeholder="Search by product name or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Items Added</option>
              <option value="UPDATE">Items Updated</option>
              <option value="DELETE">Items Deleted</option>
              <option value="stock_added">Stock Added</option>
              <option value="stock_subtracted">Stock Reduced</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No history found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedAction !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'No activities recorded yet'
              }
            </p>
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
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const { date, time } = formatDate(item.timestamp);
                  const actionColor = getActionColor(item.action);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                            {item.details && (
                              <div className="text-xs text-gray-500">{item.details}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${actionColor}`}>
                          {getActionIcon(item.action)}
                          <span className="ml-1">{getActionLabel(item.action)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${
                          item.action === 'CREATE' || item.action === 'added' || item.action === 'stock_added' 
                            ? 'text-green-600' 
                            : item.action === 'DELETE' || item.action === 'deleted' || item.action === 'stock_subtracted'
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {item.action === 'CREATE' || item.action === 'added' || item.action === 'stock_added' ? '+' : 
                           item.action === 'DELETE' || item.action === 'deleted' || item.action === 'stock_subtracted' ? '-' : '±'}
                          {Math.abs(item.quantity)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{item.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
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
          Showing {filteredItems.length} of {items.length} activities
          {searchTerm && ` for "${searchTerm}"`}
          {selectedAction !== 'all' && ` with action "${selectedAction}"`}
        </div>
      )}
    </div>
  );
}
