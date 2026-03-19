/**
 * =====================================================
 * 维护计划模块 - 维护计划详情、更新、删除 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 根据 ID 获取维护计划详情
 * - PUT: 根据 ID 更新维护计划信息
 * - DELETE: 根据 ID 删除维护计划
 *
 * 请求路径：/api/maintenance-plan/[id]
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * GET /api/maintenance-plan/[id]
 * 获取维护计划详情
 *
 * @description 根据维护计划 ID 查询详细信息，包括关联的设备名称和负责人名称
 *
 * @param params.id 维护计划 ID
 * @returns 维护计划详细信息（含设备名称和负责人名称）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的维护计划 ID
    const { id } = await params;

    // 查询维护计划详情
    const plan = dbUtils.maintenancePlan.findUnique(id);

    // 维护计划不存在
    if (!plan) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '维护计划不存在' } },
        { status: 404 }
      );
    }

    // 获取关联设备名称
    const equipment = dbUtils.equipment.findUnique(id);
    const equipmentName = equipment?.name || plan.equipmentId;

    // 获取负责人名称
    const users = dbUtils.user.findMany();
    const user = users.find(u => u.id === plan.assigneeId);
    const assigneeName = user?.username || plan.assigneeId;

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

/**
 * PUT /api/maintenance-plan/[id]
 * 更新维护计划信息
 *
 * @description 根据维护计划 ID 更新计划信息
 *
 * @param params.id 维护计划 ID
 * @param request.json 更新字段
 * @returns 更新后的维护计划信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的维护计划 ID
    const { id } = await params;
    // 解析请求体
    const body = await request.json();

    // 检查维护计划是否存在
    const existing = dbUtils.maintenancePlan.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '维护计划不存在' } },
        { status: 404 }
      );
    }

    // 执行更新操作
    dbUtils.maintenancePlan.update(id, body);

    // 获取更新后的维护计划信息
    const updated = dbUtils.maintenancePlan.findUnique(id);
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

/**
 * DELETE /api/maintenance-plan/[id]
 * 删除维护计划
 *
 * @description 根据维护计划 ID 删除计划记录
 *
 * @param params.id 维护计划 ID
 * @returns 删除成功消息
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的维护计划 ID
    const { id } = await params;

    // 检查维护计划是否存在
    const existing = dbUtils.maintenancePlan.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '维护计划不存在' } },
        { status: 404 }
      );
    }

    // 执行删除操作
    dbUtils.maintenancePlan.delete(id);

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
