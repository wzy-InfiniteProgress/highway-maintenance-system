import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    let knowledgeList = await dbUtils.knowledgeBase.findMany({ category });

    if (search) {
      const searchLower = search.toLowerCase();
      knowledgeList = knowledgeList.filter(k =>
        k.title.toLowerCase().includes(searchLower) ||
        (k.symptoms && k.symptoms.toLowerCase().includes(searchLower)) ||
        (k.causes && k.causes.toLowerCase().includes(searchLower)) ||
        (k.solutions && k.solutions.toLowerCase().includes(searchLower)) ||
        (k.tags && k.tags.toLowerCase().includes(searchLower))
      );
    }

    const users = await dbUtils.user.findMany();
    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u.username;
      return acc;
    }, {} as Record<string, string>);

    const formattedList = knowledgeList.map(item => ({
      ...item,
      authorName: item.author_id ? userMap[item.author_id] || item.author_id : item.author_id,
      tagsArray: item.tags ? JSON.parse(item.tags) : []
    }));

    const categories = [...new Set(knowledgeList.map(k => k.category).filter(Boolean))];

    return NextResponse.json({
      success: true,
      data: {
        list: formattedList,
        total: knowledgeList.length,
        categories
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, symptoms, causes, solutions, attachments, tags, category, authorId } = body;

    if (!title || !category || !authorId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '请填写必填字段' } },
        { status: 400 }
      );
    }

    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');

    const knowledge = await dbUtils.knowledgeBase.create({
      title,
      symptoms: symptoms || '',
      causes: causes || '',
      solutions: solutions || '',
      attachments: attachments || '',
      tags: tagsJson,
      category,
      author_id: authorId
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
