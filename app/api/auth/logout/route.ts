/**
 * =====================================================
 * 认证模块 - 用户登出 API
 * =====================================================
 *
 * 功能说明：
 * - 处理用户登出操作
 * - 清除存储在 Cookie 中的 JWT Token
 * - 返回登出成功提示
 *
 * 请求方法：POST
 * 请求路径：/api/auth/logout
 *
 * 响应：
 * - 成功：返回登出成功消息
 * - 失败：返回错误信息
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * 用户登出
 */
export async function POST(request: NextRequest) {
  try {
    // 创建成功响应
    const response = NextResponse.json({
      success: true,
      data: { message: '登出成功' }
    });

    // 删除 Cookie 中的 Token
    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
