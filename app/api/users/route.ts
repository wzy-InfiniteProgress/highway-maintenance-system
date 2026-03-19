/**
 * =====================================================
 * 用户管理模块 - 用户列表和创建 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 获取所有用户列表（仅管理员）
 * - POST: 创建新用户（仅管理员）
 *
 * 请求路径：/api/users
 *
 * 权限说明：
 * - 只有管理员（role=admin）才能访问此接口
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { hashPassword } from '@/lib/auth';

/**
 * GET /api/users
 * 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '无效的token' } },
        { status: 401 }
      );
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      );
    }

    const users = await dbUtils.user.findMany();

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: !!user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * 创建新用户
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '无效的token' } },
        { status: 401 }
      );
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, email, password, role, department } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '用户名、邮箱和密码不能为空' } },
        { status: 400 }
      );
    }

    const existingUser = await dbUtils.user.findUnique({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_EXISTS', message: '用户名已存在' } },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await dbUtils.user.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      department,
      is_active: true
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: !!user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}