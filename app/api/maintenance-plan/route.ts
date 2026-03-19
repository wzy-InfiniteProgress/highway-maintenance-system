import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const equipmentId = searchParams.get('equipmentId') || undefined;
    const assigneeId = searchParams.get('assigneeId') || undefined;

    const plans = await dbUtils.maintenancePlan.findMany({ status, equipmentId, assigneeId });

    const equipment = await dbUtils.equipment.findMany();
    const equipmentMap = equipment.reduce((acc, e) => {
      acc[e.id] = e.name;
      return acc;
    }, {} as Record<string, string>);

    const users = await dbUtils.user.findMany();
    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u.username;
      return acc;
    }, {} as Record<string, string>);

    const statusCounts = await dbUtils.maintenancePlan.getStatusStats();

    const formattedPlans = plans.map(plan => ({
      ...plan,
      equipmentName: plan.equipment_id ? equipmentMap[plan.equipment_id] || plan.equipment_id : plan.equipment_id,
      assigneeName: plan.assignee_id ? userMap[plan.assignee_id] || plan.assignee_id : plan.assignee_id
    }));

    return NextResponse.json({
      success: true,
      data: {
        list: formattedPlans,
        total: plans.length,
        statusCounts
      }
    });
  } catch (error) {
    console.error('Get maintenance plan list error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取维护计划列表失败' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentId, title, description, scheduleType, nextMaintenanceDate, assigneeId, status } = body;

    if (!equipmentId || !title || !scheduleType || !nextMaintenanceDate || !assigneeId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '请填写所有必填字段' } },
        { status: 400 }
      );
    }

    const plan = await dbUtils.maintenancePlan.create({
      equipment_id: equipmentId,
      title,
      description: description || '',
      schedule_type: scheduleType,
      next_maintenance_date: nextMaintenanceDate,
      assignee_id: assigneeId,
      status: status || 'pending'
    });

    return NextResponse.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Create maintenance plan error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '创建维护计划失败' } },
      { status: 500 }
    );
  }
}
