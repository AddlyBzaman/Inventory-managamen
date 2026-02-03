export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  location?: string;
  sku: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryItem {
  id: string;
  productId: string;
  productName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'added' | 'updated' | 'deleted' | 'stock_added' | 'stock_subtracted';
  quantity: number;
  timestamp: Date | number;
  userId: string;
  userName: string;
  details?: string;
}

export type ViewState = 
  | 'dashboard'
  | 'inventory'
  | 'add'
  | 'history'
  | 'reports';
