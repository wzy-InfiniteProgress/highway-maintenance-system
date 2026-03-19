import Database from 'better-sqlite3';
import { hashPassword } from '../lib/auth';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

async function initDatabase() {
  console.log('开始初始化数据库...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      department TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Post (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT,
      authorId TEXT NOT NULL,
      isPublic INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (authorId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('数据库表创建成功');

  const adminPassword = await hashPassword('admin123');
  const maintainerPassword = await hashPassword('maintainer123');
  const viewerPassword = await hashPassword('viewer123');

  const now = new Date().toISOString();

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO User (id, username, email, password, role, department, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'admin-id-1',
    'admin',
    'admin@highway-maintenance.com',
    adminPassword,
    'admin',
    '管理部门',
    1,
    now,
    now
  );

  insertUser.run(
    'maintainer-id-1',
    'maintainer',
    'maintainer@highway-maintenance.com',
    maintainerPassword,
    'maintainer',
    '维护部门',
    1,
    now,
    now
  );

  insertUser.run(
    'viewer-id-1',
    'viewer',
    'viewer@highway-maintenance.com',
    viewerPassword,
    'viewer',
    '查看部门',
    1,
    now,
    now
  );

  console.log('用户数据创建成功');

  const categories = [
    { name: '设备维护', description: '设备日常维护相关内容' },
    { name: '故障排除', description: '故障诊断和排除方法' },
    { name: '预防性维护', description: '预防性维护计划和执行' },
    { name: '技术改进', description: '技术改进和创新' },
    { name: '安全规范', description: '安全操作规范和标准' },
    { name: '其他', description: '其他相关内容' }
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO Category (name, description, createdAt)
    VALUES (?, ?, ?)
  `);

  for (const category of categories) {
    insertCategory.run(category.name, category.description, now);
  }

  console.log('分类数据创建成功');

  const insertPost = db.prepare(`
    INSERT INTO Post (id, title, content, category, tags, authorId, isPublic, views, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const samplePosts = [
    {
      id: 'post-1',
      title: '高速公路监控系统维护经验分享',
      content: '在高速公路监控系统的日常维护中，我们积累了一些宝贵的经验。首先，定期检查摄像头的清洁度非常重要，灰尘和污垢会影响图像质量。其次，网络设备的定期巡检可以及时发现潜在问题。最后，建立完善的维护记录制度对于长期维护工作至关重要。',
      category: '设备维护',
      tags: '["监控", "摄像头", "网络设备"]',
      authorId: 'admin-id-1',
      isPublic: 1,
      views: 123
    },
    {
      id: 'post-2',
      title: 'ETC车道故障快速排除方法',
      content: 'ETC车道故障是高速公路运营中常见的问题。本文总结了几个快速排除故障的方法：1. 检查天线连接是否正常；2. 验证车载标签是否有效；3. 检查栏杆机状态；4. 查看系统日志。通过这些步骤，大部分故障可以在短时间内解决。',
      category: '故障排除',
      tags: '["ETC", "故障排除", "快速维修"]',
      authorId: 'maintainer-id-1',
      isPublic: 1,
      views: 89
    },
    {
      id: 'post-3',
      title: '预防性维护计划制定指南',
      content: '制定有效的预防性维护计划是保障高速公路机电系统稳定运行的关键。本文介绍了如何根据设备类型、使用频率、环境条件等因素制定科学的维护计划。同时，还提供了维护计划的执行和评估方法。',
      category: '预防性维护',
      tags: '["预防性维护", "计划制定", "维护管理"]',
      authorId: 'admin-id-1',
      isPublic: 1,
      views: 156
    }
  ];

  for (const post of samplePosts) {
    insertPost.run(
      post.id,
      post.title,
      post.content,
      post.category,
      post.tags,
      post.authorId,
      post.isPublic,
      post.views,
      now,
      now
    );
  }

  console.log('示例帖子数据创建成功');

  console.log('数据库初始化完成！');
  db.close();
}

initDatabase().catch(console.error);