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

    // 获取分页后的心得列表
    const result = dbUtils.post.findMany({ page, pageSize, category, authorId });
    let posts = result.posts;

    // 如果有搜索关键词，筛选标题和内容匹配的帖子
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // 如果有标签筛选，按标签筛选
    if (tag) {
      posts = posts.filter(post => {
        try {
          const tags = JSON.parse(post.tags);
          return tags.includes(tag);
        } catch {
          return false;
        }
      });
    }

    // 未登录用户只能查看公开帖子
    if (!currentUserId) {
      posts = posts.filter(post => post.isPublic === 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        // 格式化返回数据
        posts: posts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          authorId: post.authorId,
          isPublic: !!post.isPublic,
          views: post.views,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
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

/**
 * POST /api/posts
 * 创建心得文章
 *
 * @description 创建新的维护心得文章，需要登录
 *
 * @param request.json 请求体包含文章信息
 * @returns 创建成功的心得信息
 */
export async function POST(request: NextRequest) {
  try {
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

    // 解析请求体
    const body = await request.json();
    const { title, content, category, tags, isPublic } = body;

    // 验证必填字段
    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '标题、内容和分类不能为空' } },
        { status: 400 }
      );
    }

    // 创建心得记录
    const post = dbUtils.post.create({
      title,                                      // 标题
      content,                                   // 内容（富文本）
      category,                                  // 分类
      tags: tags ? JSON.stringify(tags) : '[]', // 标签数组转为 JSON 字符串
      authorId: payload.userId,                 // 作者ID（从 Token 获取）
      isPublic: isPublic ? 1 : 0,             // 是否公开
      views: 0                                   // 初始浏览量为 0
    });

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
          isPublic: !!post.isPublic,
          views: post.views,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
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
