import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

// 状态映射：中文 -> 英文
const statusMap: Record<string, string> = {
  '正常': 'active',
  '维护中': 'maintenance',
  '故障': 'fault',
  '已报废': 'retired'
};

/**
 * 批量导入设备
 * 接收JSON数组格式的设备数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipmentList } = body;

    // 验证数据格式
    if (!Array.isArray(equipmentList) || equipmentList.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '请提供有效的设备列表数据' } },
        { status: 400 }
      );
    }

    // 必填字段验证
    const requiredFields = ['name', 'model', 'manufacturer', 'installDate', 'location', 'department'];
    const errors: string[] = [];

    equipmentList.forEach((item, index) => {
      for (const field of requiredFields) {
        if (!item[field]) {
          errors.push(`第 ${index + 1} 行：缺少必填字段 "${field}"`);
        }
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: errors.join('；') } },
        { status: 400 }
      );
    }

    // 批量创建设备
    const createdEquipment: any[] = [];
    for (const item of equipmentList) {
      // 将中文状态转换为英文状态
      const rawStatus = item.status || 'active';
      const status = statusMap[rawStatus] || rawStatus;

      const equipment = dbUtils.equipment.create({
        name: item.name,
        model: item.model,
        manufacturer: item.manufacturer,
        installDate: item.installDate,
        location: item.location,
        department: item.department,
        status: status,
        ip: item.ip || null
      });
      createdEquipment.push(equipment);
    }

    return NextResponse.json({
      success: true,
      data: {
        total: createdEquipment.length,
        created: createdEquipment
      },
      message: `成功导入 ${createdEquipment.length} 条设备数据`
    });
  } catch (error) {
    console.error('Batch import equipment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '批量导入失败' } },
      { status: 500 }
    );
  }
}
