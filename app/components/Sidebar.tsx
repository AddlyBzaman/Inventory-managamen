'use client'

import { Package, History, FileText, Home, LogOut, User } from 'lucide-react';
import { ViewState } from '../types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard' as ViewState, label: 'Dashboard', icon: Home },
    { id: 'inventory' as ViewState, label: 'Inventory', icon: Package },
    { id: 'history' as ViewState, label: 'History', icon: History },
    { id: 'reports' as ViewState, label: 'Reports', icon: FileText },
  ];

  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Apakah Anda yakin ingin logout?');
    
    if (!confirmed) {
      return; // User cancelled
    }

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('auth-token'); // Clear auth token too
        
        toast.success('Logout berhasil');
        
        // Redirect to login
        router.push('/login');
      } else {
        toast.error('Logout gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>
      
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-700 transition-colors ${
                currentView === item.id ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-700">
        {/* User Info */}
        <div className="px-6 py-4">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-3 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.username || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.role || 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-6 py-3 text-left hover:bg-red-600 transition-colors border-t border-gray-700"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
