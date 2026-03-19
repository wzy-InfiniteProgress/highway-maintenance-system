/**
 * =====================================================
 * 维护心得模块 - 心得详情、更新、删除 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 根据 ID 获取心得详情，增加浏览次数
 * - PUT: 根据 ID 更新心得内容（需是作者或管理员）
 * - DELETE: 根据 ID 删除心得（需是作者或管理员）
 *
 * 请求路径：/api/posts/[id]
 *
 * 权限说明：
 * - GET: 公开帖子所有人都能访问，私有帖子只有作者能访问
 * - PUT/DELETE: 只有作者和管理员能操作
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/posts/[id]
 * 获取心得详情
 *
 * @description 根据帖子 ID 查询详情，自动增加浏览次数
 * - 公开帖子：所有人可访问
 * - 私有帖子：只有作者能访问
 *
 * @param params.id 帖子 ID
 * @returns 帖子详细信息（含作者名称、浏览次数+1）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的帖子 ID
    const { id } = await params;

    // 查询帖子详情
    const post = dbUtils.post.findUnique(id);

    // 帖子不存在
    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'POST_NOT_FOUND', message: '帖子不存在' } },
        { status: 404 }
      );
    }

    // 验证 Token 获取当前用户 ID
    const token = request.cookies.get('token')?.value;
    let currentUserId: string | undefined;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        currentUserId = payload.userId;
      }
    }

    // 私有帖子只能作者访问
    if (!post.isPublic && post.authorId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      );
    }

    // 增加浏览次数
    dbUtils.post.incrementViews(id);

    // 获取作者名称
    const author = dbUtils.user.findUnique({ id: post.authorId });

    return NextResponse.json({
      success: true,
      data: {
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          authorId: post.authorId,
          authorName: author?.username || '未知用户',
          isPublic: !!post.isPublic,
          views: post.views + 1,  // 返回浏览次数 +1
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * 更新心得内容
 *
 * @description 更新帖子内容，只有作者和管理员能操作
 *
 * @param params.id 帖子 ID
 * @param request.json 更新字段（title, content, category, tags, isPublic）
 * @returns 更新后的帖子信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的帖子 ID
    const { id } = await params;

    // 查询帖子详情
    const post = dbUtils.post.findUnique(id);

    // 帖子不存在
    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'POST_NOT_FOUND', message: '帖子不存在' } },
        { status: 404 }
      );
    }

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

    // 检查权限：只有作者和管理员能更新
    if (post.authorId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权编辑' } },
        { status: 403 }
      );
    }

    // 解析更新内容
    const body = await request.json();
    const { title, content, category, tags, isPublic } = body;

    // 构建更新数据
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (isPublic !== undefined) updateData.isPublic = isPublic ? 1 : 0;

    // 执行更新
    dbUtils.post.update(id, updateData);

    // 获取更新后的帖子
    const updatedPost = dbUtils.post.findUnique(id);

    return NextResponse.json({
      success: true,
      data: {
        post: {
          id: updatedPost!.id,
          title: updatedPost!.title,
          content: updatedPost!.content,
          category: updatedPost!.category,
          tags: updatedPost!.tags,
          authorId: updatedPost!.authorId,
          isPublic: !!updatedPost!.isPublic,
          views: updatedPost!.views,
          createdAt: updatedPost!.createdAt,
          updatedAt: updatedPost!.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * 删除心得
 *
 * @description 删除帖子，只有作者和管理员能操作
 *
 * @param params.id 帖子 ID
 * @returns 删除成功消息
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的帖子 ID
    const { id } = await params;

    // 查询帖子详情
    const post = dbUtils.post.findUnique(id);

    // 帖子不存在
    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'POST_NOT_FOUND', message: '帖子不存在' } },
        { status: 404 }
      );
    }

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

    // 检查权限：只有作者和管理员能删除
    if (post.authorId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权删除' } },
        { status: 403 }
      );
    }

    // 执行删除
    dbUtils.post.delete(id);

    return NextResponse.json({
      success: true,
      data: { message: '删除成功' }
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
