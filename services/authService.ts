// Client-side auth service for Next.js app directory
// Uses API routes instead of direct database access

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  role: string;
  isActive: boolean;
}

class AuthService {
  private readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

  async login(username: string, password: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        cache: 'no-store'
      });

      const data = await response.json();

      if (!data.success) {
        return null;
      }

      // Store token in localStorage as fallback
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }

      return data.user;
      
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear localStorage token
      localStorage.removeItem('auth-token');
      
      await fetch(`${this.API_BASE}/auth/logout`, {
        method: 'POST',
        cache: 'no-store'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Try to get token from localStorage first
      const token = localStorage.getItem('auth-token');
      
      const response = await fetch(`${this.API_BASE}/auth/me`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        cache: 'no-store'
      });
      const data = await response.json();

      if (!data.success) {
        return null;
      }

      return data.user;
      
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    // Token refresh is handled by session cookies in API routes
    return true;
  }

  async createUser(userData: {
    username: string;
    email?: string;
    password: string;
    name?: string;
    role?: string;
  }): Promise<User | null> {
    // This would need a separate API route for user creation
    // For now, return null as it's not implemented
    console.warn('Create user functionality needs API route implementation');
    return null;
  }
}

export const authService = new AuthService();
