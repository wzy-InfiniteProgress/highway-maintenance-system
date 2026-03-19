import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * 导出设备数据
 * 支持导出全部或按状态筛选
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    // 获取设备列表
    const equipment = dbUtils.equipment.findMany({ status });

    // CSV表头
    const headers = ['设备名称', '型号', '制造商', '安装日期', '安装位置', '所属部门', '状态', 'IP地址'];

    // 状态映射
    const statusLabels: Record<string, string> = {
      active: '正常',
      maintenance: '维护中',
      fault: '故障',
      retired: '已报废'
    };

    // 构建CSV行
    const csvRows: string[] = [];
    csvRows.push(headers.join(','));

    for (const e of equipment) {
      const row = [
        escapeCSV(e.name),
        escapeCSV(e.model),
        escapeCSV(e.manufacturer),
        escapeCSV(e.installDate),
        escapeCSV(e.location),
        escapeCSV(e.department),
        escapeCSV(statusLabels[e.status] || e.status),
        escapeCSV(e.ip || '')
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    // 使用TextEncoder处理UTF-8编码
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(csvContent);

    const filename = `equipment_${Date.now()}.csv`;

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(uint8Array.length)
      }
    });
  } catch (error) {
    console.error('Export equipment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '导出失败' } },
      { status: 500 }
    );
  }
}

// 转义CSV特殊字符
function escapeCSV(value: string): string {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
