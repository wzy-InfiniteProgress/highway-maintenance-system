/**
 * =====================================================
 * 维护心得模块 - 心得列表和创建 API
 * =====================================================
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;
    const authorId = searchParams.get('authorId') || undefined;

    const token = request.cookies.get('token')?.value;
    let currentUserId: string | undefined;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        currentUserId = payload.userId;
      }
    }

    const result = await dbUtils.post.findMany({ page, pageSize, category, authorId });
    let posts = result.posts;

    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        (post.content && post.content.toLowerCase().includes(searchLower))
      );
    }

    if (tag) {
      posts = posts.filter(post => {
        try {
          const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
          return tags.includes(tag);
        } catch {
          return false;
        }
      });
    }

    if (!currentUserId) {
      posts = posts.filter(post => post.is_public === true || post.is_public === 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        posts: posts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: typeof post.tags === 'string' ? post.tags : JSON.stringify(post.tags || []),
          authorId: post.author_id,
          isPublic: !!post.is_public,
          views: post.views,
          createdAt: post.created_at
        })),
        total: result.total,
        page,
        pageSize
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { title, content, category, tags, isPublic } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '标题、内容和分类不能为空' } },
        { status: 400 }
      );
    }

    const post = await dbUtils.post.create({
      title,
      content,
      category,
      tags: tags ? JSON.stringify(tags) : '[]',
      author_id: payload.userId,
      is_public: isPublic ? true : false,
      views: 0
    });

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
          isPublic: !!post.is_public,
          views: post.views,
          createdAt: post.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}