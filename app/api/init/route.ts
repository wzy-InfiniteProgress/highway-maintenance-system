import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const existingUsers = await dbUtils.user.findMany();

    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        message: '数据库已有用户，无需初始化'
      });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await dbUtils.user.create({
      username: 'admin',
      email: 'admin@highway-maintenance.com',
      password: hashedPassword,
      role: 'admin',
      department: '管理部门',
      is_active: true
    });

    return NextResponse.json({
      success: true,
      message: '管理员用户创建成功',
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({
      success: false,
      message: '初始化失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: '请使用 POST 方法初始化数据库'
  });
}
