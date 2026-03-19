/**
 * =====================================================
 * 认证模块 - 获取当前用户 API
 * =====================================================
 *
 * 功能说明：
 * - 获取当前登录用户的信息
 * - 验证 JWT Token 有效性
 * - 从数据库查询用户详细信息
 *
 * 请求方法：GET
 * 请求路径：/api/auth/me
 *
 * 认证方式：
 * - 通过 Cookie 中的 Token 进行认证
 * - Token 无效或过期返回 401
 *
 * 响应：
 * - 成功：返回用户信息
 * - 失败：返回错误信息
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 中获取 Token
    const token = request.cookies.get('token')?.value;

    // Token 不存在：用户未登录
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    // 验证 Token 有效性
    const payload = verifyToken(token);

    // Token 无效或过期
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: '无效的token' } },
        { status: 401 }
      );
    }

    // 从数据库查询用户信息
    const user = await dbUtils.user.findUnique({ id: payload.userId });

    // 用户不存在（可能被删除）
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } },
        { status: 404 }
      );
    }

    // 返回用户信息（不包含密码）
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
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
