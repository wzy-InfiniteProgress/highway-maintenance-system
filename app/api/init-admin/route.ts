import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    const adminPassword = await hashPassword('admin123');

    const existingAdmin = await dbUtils.user.findUnique({ username: 'admin' });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: '管理员用户已存在',
        user: {
          id: existingAdmin.id,
          username: existingAdmin.username,
          role: existingAdmin.role
        }
      });
    }

    const admin = await dbUtils.user.create({
      username: 'admin',
      email: 'admin@highway-maintenance.com',
      password: adminPassword,
      role: 'admin',
      department: '管理部门',
      is_active: true
    });

    return NextResponse.json({
      success: true,
      message: '管理员用户创建成功',
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '初始化失败' } },
      { status: 500 }
    );
  }
}
