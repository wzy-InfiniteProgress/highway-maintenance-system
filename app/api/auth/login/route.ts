/**
 * =====================================================
 * 认证模块 - 用户登录 API
 * =====================================================
 *
 * 功能说明：
 * - 验证用户登录凭证
 * - 验证成功后生成 JWT Token
 * - 设置 HttpOnly Cookie
 *
 * 请求方法：POST
 * 请求路径：/api/auth/login
 *
 * 请求体：
 * {
 *   username: string,  // 用户名
 *   password: string   // 密码
 * }
 *
 * 响应：
 * - 成功：返回用户信息和 Token
 * - 失败：返回错误信息
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';

/**
 * POST /api/auth/login
 * 用户登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '用户名和密码不能为空' } },
        { status: 400 }
      );
    }

    // 查询用户
    const user = dbUtils.user.findUnique({ username });

    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' } },
        { status: 401 }
      );
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' } },
        { status: 401 }
      );
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_INACTIVE', message: '用户已被禁用' } },
        { status: 403 }
      );
    }

    // 生成 JWT Token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    // 构建响应
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: !!user.isActive
        },
        token
      }
    });

    // 设置 HttpOnly Cookie（安全存储 Token）
    response.cookies.set('token', token, {
      httpOnly: true,                    // 防止 XSS 攻击
      secure: process.env.NODE_ENV === 'production',  // 生产环境使用 HTTPS
      sameSite: 'lax',                  // 允许同站请求携带 Cookie
      maxAge: 60 * 60 * 24 * 7         // 7 天过期
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
