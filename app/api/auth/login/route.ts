import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Create direct client connection
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    // Query user from database
    const userResult = await client.execute('SELECT * FROM users WHERE username = ? AND isActive = 1', [username]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username tidak ditemukan atau akun tidak aktif', error: 'USER_NOT_FOUND' },
        { status: 401 }
      );
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Password salah. Silakan coba lagi.', error: 'INVALID_PASSWORD' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      { expiresIn: '7d' }
    );
    
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      message: 'Login berhasil'
    });

    // Set JWT token in httpOnly cookie (more secure)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // Temporarily disable for debugging
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
