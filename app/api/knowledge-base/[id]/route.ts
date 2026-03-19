import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const knowledge = await dbUtils.knowledgeBase.findUnique(id);

    if (!knowledge) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '知识库条目不存在' } },
        { status: 404 }
      );
    }

    const users = await dbUtils.user.findMany();
    const user = users.find(u => u.id === knowledge.author_id);
    const authorName = user?.username || knowledge.author_id;

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await dbUtils.knowledgeBase.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '知识库条目不存在' } },
        { status: 404 }
      );
    }

    if (body.tags && Array.isArray(body.tags)) {
      body.tags = JSON.stringify(body.tags);
    }

    await dbUtils.knowledgeBase.update(id, body);

    const updated = await dbUtils.knowledgeBase.findUnique(id);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await dbUtils.knowledgeBase.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '知识库条目不存在' } },
        { status: 404 }
      );
    }

    await dbUtils.knowledgeBase.delete(id);

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
