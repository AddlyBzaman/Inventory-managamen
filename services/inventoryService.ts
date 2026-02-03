// Inventory service for managing products and history using API routes
import { InventoryItem, HistoryItem } from '../app/types';

class InventoryService {
  private readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

  async getAllProducts(): Promise<InventoryItem[]> {
    try {
      console.log('🔄 Fetching products from:', `${this.API_BASE}/api/products`);
      
      const response = await fetch(`${this.API_BASE}/api/products`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!data.success) {
        throw new Error('Failed to fetch products');
      }
      
      return data.data as InventoryItem[];
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  }

  async getAllHistory(): Promise<HistoryItem[]> {
    try {
      const response = await fetch(`${this.API_BASE}/api/history`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch history');
      }
      
      return data.data as HistoryItem[];
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }

  async createProduct(productData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    try {
      const response = await fetch(`${this.API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to create product');
      }
      
      return data.data as InventoryItem;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
