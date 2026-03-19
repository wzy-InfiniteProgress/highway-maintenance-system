/**
 * =====================================================
 * 维护心得模块 - 心得详情、更新、删除 API
 * =====================================================
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await dbUtils.post.findUnique(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'POST_NOT_FOUND', message: '帖子不存在' } },
        { status: 404 }
      );
    }

    const token = request.cookies.get('token')?.value;
    let currentUserId: string | undefined;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        currentUserId = payload.userId;
      }
    }

    if (!post.is_public && post.author_id !== currentUserId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      );
    }

    await dbUtils.post.incrementViews(id);

    const author = post.author_id ? await dbUtils.user.findUnique({ id: post.author_id }) : null;

    return NextResponse.json({
      success: true,
      data: {
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: typeof post.tags === 'string' ? post.tags : JSON.stringify(post.tags || []),
          authorId: post.author_id,
          authorName: author?.username || '未知用户',
          isPublic: !!post.is_public,
          views: post.views + 1,
          createdAt: post.created_at,
          updatedAt: post.updated_at
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await dbUtils.post.findUnique(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'POST_NOT_FOUND', message: '帖子不存在' } },
        { status: 404 }
      );
    }

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

    if (post.author_id !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权编辑' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category, tags, isPublic } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (isPublic !== undefined) updateData.is_public = isPublic;

    await dbUtils.post.update(id, updateData);

    const updatedPost = await dbUtils.post.findUnique(id);

    return NextResponse.json({
      success: true,
      data: {
        post: {
          id: updatedPost!.id,
          title: updatedPost!.title,
          content: updatedPost!.content,
          category: updatedPost!.category,
          tags: typeof updatedPost!.tags === 'string' ? updatedPost!.tags : JSON.stringify(updatedPost!.tags || []),
          authorId: updatedPost!.author_id,
          isPublic: !!updatedPost!.is_public,
          views: updatedPost!.views,
          createdAt: updatedPost!.created_at,
          updatedAt: updatedPost!.updated_at
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await dbUtils.post.findUnique(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'POST_NOT_FOUND', message: '帖子不存在' } },
        { status: 404 }
      );
    }

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

    if (post.author_id !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权删除' } },
        { status: 403 }
      );
    }

    await dbUtils.post.delete(id);

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