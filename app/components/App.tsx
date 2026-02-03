'use client'

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { InventoryList } from "./InventoryList";
import { InventoryForm } from "./InventoryForm";
import { HistoryList } from "./HistoryList";
import { Reports } from "./Reports";
import { InventoryItem, ViewState, HistoryItem } from "../types";
import { toast, Toaster } from "sonner";
import { inventoryService } from '../../services/inventoryService';

export function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Starting data load...');
      console.log('🌐 API_BASE:', process.env.NEXT_PUBLIC_API_URL);
      
      const [inventoryData, historyData] = await Promise.all([
        inventoryService.getAllProducts(),
        inventoryService.getAllHistory()
      ]);
      
      console.log('✅ Data loaded successfully');
      console.log('📦 Inventory:', inventoryData);
      console.log('📜 History:', historyData);
      
      setInventory(inventoryData);
      setHistory(historyData);
    } catch (error) {
      console.error('❌ Load data error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    // This function is now handled by the dedicated add page
    // Redirect to add page instead of inline form
    window.location.href = '/add';
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await inventoryService.updateProduct(id, updates);
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      toast.success('Item updated successfully');
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      // Get product name before delete for better notification
      const productToDelete = inventory.find(item => item.id === id);
      const productName = productToDelete?.name || 'Item';
      
      await inventoryService.deleteProduct(id);
      
      // Remove from local state immediately
      setInventory(inventory.filter(item => item.id !== id));
      
      // Show clear notification with product name
      toast.success(`✅ ${productName} berhasil dihapus!`);
      
      // Auto refresh data after 1 second to ensure sync
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`❌ Gagal menghapus item. Silakan coba lagi.`);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard inventory={inventory} history={history} />;
      case 'inventory':
        return (
          <InventoryList 
            items={inventory} 
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onRefresh={loadData}
          />
        );
      case 'add':
        return <InventoryForm onSubmit={handleAddItem} />;
      case 'history':
        return <HistoryList items={history} />;
      case 'reports':
        return <Reports inventory={inventory} history={history} />;
      default:
        return <Dashboard inventory={inventory} history={history} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
