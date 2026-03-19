/**
 * =====================================================
 * 知识库模块 - 知识库详情、更新、删除 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 根据 ID 获取知识库详情
 * - PUT: 根据 ID 更新知识库信息
 * - DELETE: 根据 ID 删除知识库
 *
 * 请求路径：/api/knowledge-base/[id]
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * GET /api/knowledge-base/[id]
 * 获取知识库详情
 *
 * @description 根据知识库 ID 查询详细信息，包括作者名称
 *
 * @param params.id 知识库 ID
 * @returns 知识库详细信息（含作者名称和标签数组）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的知识库 ID
    const { id } = await params;

    // 查询知识库详情
    const knowledge = dbUtils.knowledgeBase.findUnique(id);

    // 知识库不存在
    if (!knowledge) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '知识库条目不存在' } },
        { status: 404 }
      );
    }

    // 获取作者名称
    const users = dbUtils.user.findMany();
    const user = users.find(u => u.id === knowledge.authorId);
    const authorName = user?.username || knowledge.authorId;

    return NextResponse.json({
      success: true,
      data: {
        ...knowledge,
        authorName,
        tagsArray: knowledge.tags ? JSON.parse(knowledge.tags) : []
      }
    });
  } catch (error) {
    console.error('Get knowledge base error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取知识库详情失败' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge-base/[id]
 * 更新知识库信息
 *
 * @description 根据知识库 ID 更新条目信息
 *
 * @param params.id 知识库 ID
 * @param request.json 更新字段
 * @returns 更新后的知识库信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的知识库 ID
    const { id } = await params;
    // 解析请求体
    const body = await request.json();

    // 检查知识库条目是否存在
    const existing = dbUtils.knowledgeBase.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '知识库条目不存在' } },
        { status: 404 }
      );
    }

    // 处理标签数组：如果标签是数组则转换为 JSON 字符串
    if (body.tags && Array.isArray(body.tags)) {
      body.tags = JSON.stringify(body.tags);
    }

    // 执行更新操作
    dbUtils.knowledgeBase.update(id, body);

    // 获取更新后的知识库信息
    const updated = dbUtils.knowledgeBase.findUnique(id);
    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update knowledge base error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '更新知识库条目失败' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge-base/[id]
 * 删除知识库条目
 *
 * @description 根据知识库 ID 删除条目
 *
 * @param params.id 知识库 ID
 * @returns 删除成功消息
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的知识库 ID
    const { id } = await params;

    // 检查知识库条目是否存在
    const existing = dbUtils.knowledgeBase.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '知识库条目不存在' } },
        { status: 404 }
      );
    }

    // 执行删除操作
    dbUtils.knowledgeBase.delete(id);

    return NextResponse.json({
      success: true,
      message: '知识库条目删除成功'
    });
  } catch (error) {
    console.error('Delete knowledge base error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '删除知识库条目失败' } },
      { status: 500 }
    );
  }
}
