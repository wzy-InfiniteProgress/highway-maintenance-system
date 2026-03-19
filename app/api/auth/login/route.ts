import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';

async function ensureAdminExists() {
  const existingAdmin = await dbUtils.user.findUnique({ username: 'admin' });
  if (!existingAdmin) {
    const adminPassword = await hashPassword('admin123');
    await dbUtils.user.create({
      username: 'admin',
      email: 'admin@highway-maintenance.com',
      password: adminPassword,
      role: 'admin',
      department: '管理部门',
      is_active: true
    });
    console.log('管理员用户已自动创建');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '用户名和密码不能为空' } },
        { status: 400 }
      );
    }

    let user = await dbUtils.user.findUnique({ username });

    if (!user) {
      await ensureAdminExists();
      user = await dbUtils.user.findUnique({ username });
      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' } },
          { status: 401 }
        );
      }
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' } },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_INACTIVE', message: '用户已被禁用' } },
        { status: 403 }
      );
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: !!user.is_active
        },
        token
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
