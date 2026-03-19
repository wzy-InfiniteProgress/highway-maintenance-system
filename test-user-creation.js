const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('=== 测试用户创建流程 ===\n');

// 测试密码加密
const testPassword = 'ww';
const hashedPassword = bcrypt.hashSync(testPassword, 10);

console.log('1. 密码加密测试:');
console.log('   原始密码:', testPassword);
console.log('   加密后:', hashedPassword);
console.log('   验证结果:', bcrypt.compareSync(testPassword, hashedPassword));

// 删除已存在的ww用户
console.log('\n2. 删除已存在的ww用户:');
const deleteResult = db.prepare('DELETE FROM User WHERE username = ?').run('ww');
console.log('   删除结果:', deleteResult.changes > 0 ? '成功' : '用户不存在');

// 创建新用户
console.log('\n3. 创建新用户ww:');
const id = 'ww-' + Date.now();
const now = new Date().toISOString();

try {
  db.prepare(`
    INSERT INTO User (id, username, email, password, role, department, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, 'ww', 'ww@qq.com', hashedPassword, 'viewer', '测试部门', 1, now, now);

  console.log('   用户创建成功');

  // 验证用户
  console.log('\n4. 验证用户:');
  const user = db.prepare('SELECT * FROM User WHERE username = ?').get('ww');
  console.log('   用户名:', user.username);
  console.log('   邮箱:', user.email);
  console.log('   密码哈希:', user.password);
  console.log('   密码匹配:', bcrypt.compareSync('ww', user.password));

  console.log('\n=== 测试完成 ===');
  console.log('\n现在可以使用以下信息登录:');
  console.log('用户名: ww');
  console.log('密码: ww');

} catch (error) {
  console.error('错误:', error.message);
}

db.close();