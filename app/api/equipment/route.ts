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
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;      // 状态筛选
    const department = searchParams.get('department') || undefined; // 部门筛选
    const search = searchParams.get('search') || undefined;      // 搜索关键词

    // 从数据库获取设备列表
    let equipment = dbUtils.equipment.findMany({ status, department });

    // 如果有搜索关键词，进行模糊搜索匹配
    if (search) {
      const searchLower = search.toLowerCase();
      equipment = equipment.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||           // 匹配设备名称
        e.model.toLowerCase().includes(searchLower) ||         // 匹配设备型号
        e.location.toLowerCase().includes(searchLower)          // 匹配安装位置
      );
    }

    // 统计各状态的设备数量
    const statusStats = dbUtils.equipment.getStatusStats();
    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    // 提取所有部门列表（去重）
    const departments = [...new Set(equipment.map(e => e.department).filter(Boolean))];

    return NextResponse.json({
      success: true,
      data: {
        list: equipment,           // 设备列表
        total: equipment.length,   // 设备总数
        statusCounts,              // 各状态数量
        departments                // 部门列表
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
    const equipment = dbUtils.equipment.create({
      name,                        // 设备名称
      model,                       // 型号
      manufacturer,                 // 制造商
      installDate,                 // 安装日期
      location,                    // 安装位置
      department,                  // 所属部门
      status: status || 'active', // 状态默认为正常
      ip: ip || null              // IP 地址
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
