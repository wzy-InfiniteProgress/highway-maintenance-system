/**
 * =====================================================
 * 用户管理模块 - 用户详情、更新、删除 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 根据 ID 获取用户详情（仅管理员）
 * - PUT: 根据 ID 更新用户信息（仅管理员）
 * - DELETE: 根据 ID 删除用户（仅管理员）
 *
 * 请求路径：/api/users/[id]
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
 * GET /api/users/[id]
 * 获取用户详情
 *
 * @description 根据用户 ID 查询详细信息（不包含密码）
 * 权限：仅管理员可访问
 *
 * @param params.id 用户 ID
 * @returns 用户详细信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的用户 ID
    const { id } = await params;

    // 验证 Token
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

    // 检查管理员权限
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      );
    }

    // 查询用户详情
    const user = dbUtils.user.findUnique({ id });

    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: !!user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * 更新用户信息
 *
 * @description 根据用户 ID 更新用户信息
 * 权限：仅管理员可访问
 *
 * @param params.id 用户 ID
 * @param request.json 更新字段（username, email, password, role, department, isActive）
 * @returns 更新后的用户信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的用户 ID
    const { id } = await params;

    // 验证 Token
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

    // 检查管理员权限
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      );
    }

    // 查询用户详情
    const user = dbUtils.user.findUnique({ id });

    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } },
        { status: 404 }
      );
    }

    // 解析更新内容
    const body = await request.json();
    const { username, email, password, role, department, isActive } = body;

    // 构建更新数据
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive ? 1 : 0;

    // 如果提供了新密码，则加密
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // 执行更新
    dbUtils.user.update(id, updateData);

    // 获取更新后的用户
    const updatedUser = dbUtils.user.findUnique({ id });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser!.id,
          username: updatedUser!.username,
          email: updatedUser!.email,
          role: updatedUser!.role,
          department: updatedUser!.department,
          isActive: !!updatedUser!.isActive,
          createdAt: updatedUser!.createdAt,
          updatedAt: updatedUser!.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * 删除用户
 *
 * @description 根据用户 ID 删除用户账号
 * 权限：仅管理员可访问
 *
 * @param params.id 用户 ID
 * @returns 删除成功消息
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的用户 ID
    const { id } = await params;

    // 验证 Token
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

    // 检查管理员权限
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      );
    }

    // 查询用户详情
    const user = dbUtils.user.findUnique({ id });

    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } },
        { status: 404 }
      );
    }

    // 执行删除
    dbUtils.user.delete(id);

    return NextResponse.json({
      success: true,
      data: { message: '删除成功' }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
