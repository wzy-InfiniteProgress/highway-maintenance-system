/**
 * =====================================================
 * 设备管理模块 - 设备列表和创建 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 获取设备列表，支持筛选和搜索
 * - POST: 创建设备档案
 *
 * 请求路径：/api/equipment
 *
 * GET 参数：
 * - status: 按设备状态筛选（active/inactive/maintenance）
 * - department: 按部门筛选
 * - search: 关键词搜索（搜索名称、型号、位置）
 *
 * POST 请求体：
 * - name: 设备名称（必填）
 * - model: 型号（必填）
 * - manufacturer: 制造商（必填）
 * - installDate: 安装日期（必填）
 * - location: 安装位置（必填）
 * - department: 所属部门（必填）
 * - status: 设备状态（默认 active）
 * - ip: IP 地址（可选）
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * GET /api/equipment
 * 获取设备列表
 *
 * @description 查询设备列表，支持按状态、部门筛选和关键词搜索
 *
 * @param request.url 包含查询参数：status, department, search
 * @returns 设备列表、总数、状态统计、部门列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const department = searchParams.get('department') || undefined;
    const search = searchParams.get('search') || undefined;

    let equipment = await dbUtils.equipment.findMany({ status, department });

    if (search) {
      const searchLower = search.toLowerCase();
      equipment = equipment.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||
        (e.model && e.model.toLowerCase().includes(searchLower)) ||
        (e.location && e.location.toLowerCase().includes(searchLower))
      );
    }

    const statusCounts = await dbUtils.equipment.getStatusStats();

    const departments = [...new Set(equipment.map(e => e.department).filter(Boolean))];

    return NextResponse.json({
      success: true,
      data: {
        list: equipment,
        total: equipment.length,
        statusCounts,
        departments
      }
    });
  } catch (error) {
    console.error('Get equipment list error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取设备列表失败' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/equipment
 * 创建设备
 *
 * @description 创建新的设备档案记录
 *
 * @param request.json 请求体包含设备信息
 * @returns 创建成功的设备信息
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { name, model, manufacturer, installDate, location, department, status, ip } = body;

    // 验证必填字段
    if (!name || !model || !manufacturer || !installDate || !location || !department) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '请填写所有必填字段' } },
        { status: 400 }
      );
    }

    // 创建设备记录
    const equipment = await dbUtils.equipment.create({
      name,
      model,
      manufacturer,
      install_date: installDate,
      location,
      department,
      status: status || 'active',
      ip: ip || null
    });

    return NextResponse.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '创建设备失败' } },
      { status: 500 }
    );
  }
}
