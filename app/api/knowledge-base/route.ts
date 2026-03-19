/**
 * =====================================================
 * 知识库模块 - 知识库列表和创建 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 获取知识库列表，支持按分类、关键词搜索
 * - POST: 创建新的知识库条目
 *
 * 请求路径：/api/knowledge-base
 *
 * GET 参数：
 * - category: 按分类筛选
 * - search: 关键词搜索（搜索标题、故障现象、原因、解决方案、标签）
 *
 * POST 请求体：
 * - title: 标题（必填）
 * - category: 分类（必填）
 * - authorId: 作者ID（必填）
 * - symptoms: 故障现象（可选，富文本）
 * - causes: 故障原因（可选，富文本）
 * - solutions: 解决方案（可选，富文本）
 * - attachments: 附件（可选）
 * - tags: 标签数组（可选）
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * GET /api/knowledge-base
 * 获取知识库列表
 *
 * @description 查询知识库列表，支持按分类筛选和关键词搜索
 *
 * @param request.url 包含查询参数：category, search
 * @returns 知识库列表、总数、分类列表
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;  // 分类筛选
    const search = searchParams.get('search') || undefined;       // 搜索关键词

    // 从数据库获取知识库列表
    let knowledgeList = dbUtils.knowledgeBase.findMany({ category });

    // 如果有搜索关键词，进行多字段模糊搜索
    if (search) {
      const searchLower = search.toLowerCase();
      knowledgeList = knowledgeList.filter(k =>
        k.title.toLowerCase().includes(searchLower) ||         // 匹配标题
        k.symptoms.toLowerCase().includes(searchLower) ||      // 匹配故障现象
        k.causes.toLowerCase().includes(searchLower) ||         // 匹配故障原因
        k.solutions.toLowerCase().includes(searchLower) ||     // 匹配解决方案
        k.tags.toLowerCase().includes(searchLower)              // 匹配标签
      );
    }

    // 获取用户列表用于显示作者名称
    const users = dbUtils.user.findMany();
    // 构建用户ID到用户名的映射
    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u.username;
      return acc;
    }, {} as Record<string, string>);

    // 格式化数据，将作者ID转换为名称，标签JSON字符串转换为数组
    const formattedList = knowledgeList.map(item => ({
      ...item,
      authorName: userMap[item.authorId] || item.authorId,  // 作者名称
      tagsArray: item.tags ? JSON.parse(item.tags) : []     // 标签数组
    }));

    // 获取所有分类（去重）
    const categories = [...new Set(knowledgeList.map(k => k.category).filter(Boolean))];

    return NextResponse.json({
      success: true,
      data: {
        list: formattedList,       // 知识库列表
        total: knowledgeList.length, // 知识库总数
        categories                // 分类列表
      }
    });
  } catch (error) {
    console.error('Get knowledge base list error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取知识库列表失败' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge-base
 * 创建知识库条目
 *
 * @description 创建新的故障知识库记录
 *
 * @param request.json 请求体包含知识库信息
 * @returns 创建成功的知识库信息
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { title, symptoms, causes, solutions, attachments, tags, category, authorId } = body;

    // 验证必填字段
    if (!title || !category || !authorId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '请填写必填字段' } },
        { status: 400 }
      );
    }

    // 处理标签数组：如果标签是数组则转换为 JSON 字符串，否则保持原样
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');

    // 创建知识库记录
    const knowledge = dbUtils.knowledgeBase.create({
      title,                           // 标题
      symptoms: symptoms || '',       // 故障现象
      causes: causes || '',           // 故障原因
      solutions: solutions || '',     // 解决方案
      attachments: attachments || '', // 附件
      tags: tagsJson,                 // 标签
      category,                       // 分类
      authorId                       // 作者ID
    });

    return NextResponse.json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    console.error('Create knowledge base error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '创建知识库条目失败' } },
      { status: 500 }
    );
  }
}
