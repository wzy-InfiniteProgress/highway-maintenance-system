/**
 * =====================================================
 * 维护计划模块 - 维护计划列表和创建 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 获取维护计划列表，支持按状态、设备、负责人筛选
 * - POST: 创建新的维护计划
 *
 * 请求路径：/api/maintenance-plan
 *
 * GET 参数：
 * - status: 按状态筛选（pending/in_progress/completed）
 * - equipmentId: 按关联设备筛选
 * - assigneeId: 按负责人筛选
 *
 * POST 请求体：
 * - equipmentId: 关联设备ID（必填）
 * - title: 计划标题（必填）
 * - description: 计划描述（可选）
 * - scheduleType: 计划类型（必填）：daily-每日/weekly-每周/monthly-每月/yearly-每年
 * - nextMaintenanceDate: 下次维护日期（必填）
 * - assigneeId: 负责人ID（必填）
 * - status: 状态（默认 pending）
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * GET /api/maintenance-plan
 * 获取维护计划列表
 *
 * @description 查询维护计划列表，支持多条件筛选
 *
 * @param request.url 包含查询参数：status, equipmentId, assigneeId
 * @returns 维护计划列表、总数、状态统计
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;           // 状态筛选
    const equipmentId = searchParams.get('equipmentId') || undefined;  // 设备筛选
    const assigneeId = searchParams.get('assigneeId') || undefined;   // 负责人筛选

    // 从数据库获取维护计划列表
    const plans = dbUtils.maintenancePlan.findMany({ status, equipmentId, assigneeId });

    // 获取设备列表用于显示设备名称
    const equipment = dbUtils.equipment.findMany();
    //构建设备ID到名称的映射
    const equipmentMap = equipment.reduce((acc, e) => {
      acc[e.id] = e.name;
      return acc;
    }, {} as Record<string, string>);

    // 获取用户列表用于显示负责人名称
    const users = dbUtils.user.findMany();
    // 构建用户ID到用户名的映射
    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u.username;
      return acc;
    }, {} as Record<string, string>);

    // 统计各状态的维护计划数量
    const statusStats = dbUtils.maintenancePlan.getStatusStats();
    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    // 格式化数据，将ID转换为名称
    const formattedPlans = plans.map(plan => ({
      ...plan,
      equipmentName: equipmentMap[plan.equipmentId] || plan.equipmentId,  // 设备名称
      assigneeName: userMap[plan.assigneeId] || plan.assigneeId            // 负责人名称
    }));

    return NextResponse.json({
      success: true,
      data: {
        list: formattedPlans,      // 维护计划列表
        total: plans.length,        // 计划总数
        statusCounts               // 各状态数量
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

/**
 * POST /api/maintenance-plan
 * 创建维护计划
 *
 * @description 创建新的维护计划记录
 *
 * @param request.json 请求体包含计划信息
 * @returns 创建成功的维护计划信息
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { equipmentId, title, description, scheduleType, nextMaintenanceDate, assigneeId, status } = body;

    // 验证必填字段
    if (!equipmentId || !title || !scheduleType || !nextMaintenanceDate || !assigneeId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '请填写所有必填字段' } },
        { status: 400 }
      );
    }

    // 创建维护计划记录
    const plan = dbUtils.maintenancePlan.create({
      equipmentId,                              // 关联设备
      title,                                    // 计划标题
      description: description || '',           // 描述（默认空字符串）
      scheduleType,                             // 计划类型
      nextMaintenanceDate,                      // 下次维护日期
      assigneeId,                              // 负责人
      status: status || 'pending'              // 状态默认为待执行
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
