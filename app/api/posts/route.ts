/**
 * =====================================================
 * 维护心得模块 - 心得列表和创建 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 获取心得列表，支持分页、分类、标签、搜索筛选
 * - POST: 创建新的心得文章
 *
 * 请求路径：/api/posts
 *
 * GET 参数：
 * - page: 页码（默认 1）
 * - pageSize: 每页数量（默认 10）
 * - category: 按分类筛选
 * - tag: 按标签筛选
 * - search: 关键词搜索（搜索标题、内容）
 * - authorId: 按作者筛选
 *
 * POST 请求体：
 * - title: 标题（必填）
 * - content: 内容（必填，富文本 HTML）
 * - category: 分类（必填）
 * - tags: 标签数组（可选）
 * - isPublic: 是否公开（可选，默认 false）
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/posts
 * 获取心得列表
 *
 * @description 查询心得列表，支持分页和多条件筛选
 * 注意：未登录用户只能查看公开的心得
 *
 * @param request.url 包含查询参数
 * @returns 心得列表、总数、分页信息
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');           // 页码
    const pageSize = parseInt(searchParams.get('pageSize') || '10');   // 每页数量
    const category = searchParams.get('category') || undefined;     // 分类筛选
    const tag = searchParams.get('tag') || undefined;                // 标签筛选
    const search = searchParams.get('search') || undefined;          // 搜索关键词
    const authorId = searchParams.get('authorId') || undefined;      // 作者筛选

    // 验证 Token 获取当前用户 ID
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

    // 如果有标签筛选，按标签筛选
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
      posts = posts.filter(post => {
        const isPublic = post.is_public;
        return Boolean(isPublic);
      });
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