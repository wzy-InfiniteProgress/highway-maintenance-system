const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

const username = process.argv[2] || 'newuser';
const email = process.argv[3] || `${username}@example.com`;
const password = process.argv[4] || 'password123';
const role = process.argv[5] || 'viewer';

// 删除已存在的用户
console.log(`删除已存在的用户 ${username}...`);
db.prepare('DELETE FROM User WHERE username = ?').run(username);

// 加密密码
const hashedPassword = bcrypt.hashSync(password, 10);

// 创建用户
const id = username + '-' + Date.now();
const now = new Date().toISOString();

console.log(`创建用户 ${username}...`);

try {
  db.prepare(`
    INSERT INTO User (id, username, email, password, role, department, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, email, hashedPassword, role, '测试部门', 1, now, now);

  console.log('✅ 用户创建成功！');
  console.log('用户名:', username);
  console.log('密码:', password);
  console.log('邮箱:', email);
  console.log('角色:', role);
  console.log('验证:', bcrypt.compareSync(password, hashedPassword));
} catch (error) {
  console.error('❌ 创建失败:', error.message);
}

db.close();