import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://db.eogcfmczanqkfisjzkyp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('请设置 SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量');
  console.error('你可以在 Supabase Dashboard → Settings → API 中找到这些密钥');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('开始创建管理员用户...');
  console.log('Supabase URL:', supabaseUrl);

  const adminPassword = await bcrypt.hash('admin123', 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id: 'admin-id-1',
        username: 'admin',
        email: 'admin@highway-maintenance.com',
        password: adminPassword,
        role: 'admin',
        department: '管理部门',
        is_active: true
      }
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      console.log('管理员用户已存在');
    } else {
      console.error('创建管理员失败:', error);
    }
  } else {
    console.log('管理员用户创建成功!');
    console.log('用户名: admin');
    console.log('密码: admin123');
  }
}

createAdminUser();
