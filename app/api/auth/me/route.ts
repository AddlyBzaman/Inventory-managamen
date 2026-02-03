import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET(request: NextRequest) {
  try {
    // Get user from session (simplified - implement proper session management)
    const sessionId = request.cookies.get('session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }

    // For demo purposes, return a mock user
    // In production, validate session against database
    const mockUser = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      name: 'Administrator',
      role: 'admin',
      isActive: true
    };

    return NextResponse.json({
      success: true,
      user: mockUser
    });

  } catch (error) {
    console.error('Auth me API error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
