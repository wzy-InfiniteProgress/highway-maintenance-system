import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const plan = await dbUtils.maintenancePlan.findUnique(id);

    if (!plan) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '维护计划不存在' } },
        { status: 404 }
      );
    }

    const equipment = plan.equipment_id ? await dbUtils.equipment.findUnique(plan.equipment_id) : null;
    const equipmentName = equipment?.name || plan.equipment_id;

    const users = await dbUtils.user.findMany();
    const user = users.find(u => u.id === plan.assignee_id);
    const assigneeName = user?.username || plan.assignee_id;

    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        equipmentName,
        assigneeName
      }
    });
  } catch (error) {
    console.error('Get maintenance plan error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取维护计划详情失败' } },
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

    const existing = await dbUtils.maintenancePlan.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '维护计划不存在' } },
        { status: 404 }
      );
    }

    await dbUtils.maintenancePlan.update(id, body);

    const updated = await dbUtils.maintenancePlan.findUnique(id);
    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update maintenance plan error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '更新维护计划失败' } },
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

    const existing = await dbUtils.maintenancePlan.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '维护计划不存在' } },
        { status: 404 }
      );
    }

    await dbUtils.maintenancePlan.delete(id);

    return NextResponse.json({
      success: true,
      message: '维护计划删除成功'
    });
  } catch (error) {
    console.error('Delete maintenance plan error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '删除维护计划失败' } },
      { status: 500 }
    );
  }
}
