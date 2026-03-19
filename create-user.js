const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

const username = process.argv[2] || 'testuser';
const email = process.argv[3] || 'test@test.com';
const password = process.argv[4] || 'password123';
const role = process.argv[5] || 'viewer';

const hashedPassword = bcrypt.hashSync(password, 10);
const id = username + '-' + Date.now();
const now = new Date().toISOString();

db.prepare(`
  INSERT INTO User (id, username, email, password, role, department, isActive, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(id, username, email, hashedPassword, role, '测试部门', 1, now, now);

console.log('用户创建成功！');
console.log('用户名:', username);
console.log('密码:', password);
console.log('邮箱:', email);
console.log('角色:', role);
console.log('加密密码:', hashedPassword);
console.log('验证:', bcrypt.compareSync(password, hashedPassword));

db.close();