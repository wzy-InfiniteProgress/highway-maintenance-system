/**
 * =====================================================
 * 设备管理模块 - 设备详情、更新、删除 API
 * =====================================================
 *
 * 功能说明：
 * - GET: 根据 ID 获取设备详情
 * - PUT: 根据 ID 更新设备信息
 * - DELETE: 根据 ID 删除设备
 *
 * 请求路径：/api/equipment/[id]
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * GET /api/equipment/[id]
 * 获取设备详情
 *
 * @description 根据设备 ID 查询设备详细信息
 *
 * @param params.id 设备 ID
 * @returns 设备详细信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的设备 ID
    const { id } = await params;

    // 查询设备详情
    const equipment = dbUtils.equipment.findUnique(id);

    // 设备不存在
    if (!equipment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '设备不存在' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取设备详情失败' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/equipment/[id]
 * 更新设备信息
 *
 * @description 根据设备 ID 更新设备的各项信息
 *
 * @param params.id 设备 ID
 * @param request.json 更新字段（name, model, manufacturer, installDate, location, department, status, ip）
 * @returns 更新后的设备信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的设备 ID
    const { id } = await params;
    // 解析请求体
    const body = await request.json();

    // 检查设备是否存在
    const existing = dbUtils.equipment.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '设备不存在' } },
        { status: 404 }
      );
    }

    // 执行更新操作
    dbUtils.equipment.update(id, body);

    // 获取更新后的设备信息
    const updated = dbUtils.equipment.findUnique(id);
    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '更新设备失败' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/equipment/[id]
 * 删除设备
 *
 * @description 根据设备 ID 删除设备档案
 *
 * @param params.id 设备 ID
 * @returns 删除成功消息
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取 URL 参数中的设备 ID
    const { id } = await params;

    // 检查设备是否存在
    const existing = dbUtils.equipment.findUnique(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '设备不存在' } },
        { status: 404 }
      );
    }

    // 执行删除操作
    dbUtils.equipment.delete(id);

    return NextResponse.json({
      success: true,
      message: '设备删除成功'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '删除设备失败' } },
      { status: 500 }
    );
  }
}
