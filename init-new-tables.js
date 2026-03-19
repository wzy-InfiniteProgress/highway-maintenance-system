const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('开始创建新的数据库表...\n');

// 创建设备表
console.log('1. 创建Equipment表...');
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT,
      manufacturer TEXT,
      installDate TEXT,
      location TEXT,
      department TEXT,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('   ✅ Equipment表创建成功');
} catch (error) {
  console.log('   ⚠️  Equipment表可能已存在:', error.message);
}

// 创建维护计划表
console.log('2. 创建MaintenancePlan表...');
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS MaintenancePlan (
      id TEXT PRIMARY KEY,
      equipmentId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      scheduleType TEXT NOT NULL,
      nextMaintenanceDate TEXT NOT NULL,
      assigneeId TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('   ✅ MaintenancePlan表创建成功');
} catch (error) {
  console.log('   ⚠️  MaintenancePlan表可能已存在:', error.message);
}

// 创建故障记录表
console.log('3. 创建FaultRecord表...');
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS FaultRecord (
      id TEXT PRIMARY KEY,
      equipmentId TEXT NOT NULL,
      title TEXT NOT NULL,
      symptoms TEXT,
      causes TEXT,
      solutions TEXT,
      faultDate TEXT NOT NULL,
      resolvedDate TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('   ✅ FaultRecord表创建成功');
} catch (error) {
  console.log('   ⚠️  FaultRecord表可能已存在:', error.message);
}

// 创建知识库表
console.log('4. 创建KnowledgeBase表...');
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS KnowledgeBase (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      symptoms TEXT,
      causes TEXT,
      solutions TEXT,
      attachments TEXT,
      tags TEXT,
      category TEXT,
      authorId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('   ✅ KnowledgeBase表创建成功');
} catch (error) {
  console.log('   ⚠️  KnowledgeBase表可能已存在:', error.message);
}

// 插入示例设备数据
console.log('\n5. 插入示例设备数据...');
const equipmentData = [
  ['ETC车道控制器', 'ETC-2020', '华为', '2020-05-15', '收费站A', '收费系统', 'active'],
  ['车辆检测器', 'VD-100', '西门子', '2019-08-20', '收费站B', '监控系统', 'active'],
  ['道路监控摄像头', 'CAM-500', '海康威视', '2021-03-10', 'K100+500', '监控系统', 'active'],
  ['可变情报板', 'VMS-300', '国产', '2020-11-25', 'K50+200', '信息发布', 'maintenance'],
  ['气象监测站', 'WMS-200', '进口', '2019-06-30', 'K80+800', '气象监测', 'active'],
  ['照明控制器', 'LC-100', '国产', '2020-02-15', '隧道入口', '照明系统', 'active'],
  ['栏杆机', 'TG-200', '国产', '2021-01-20', '收费站C', '收费系统', 'active'],
  ['称重系统', 'WIM-500', '进口', '2020-09-10', '收费站D', '超限检测', 'maintenance']
];

for (const equipment of equipmentData) {
  const id = `equipment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO Equipment (id, name, model, manufacturer, installDate, location, department, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, ...equipment, now, now);
}
console.log('   ✅ 插入8条设备数据');

// 插入示例维护计划数据
console.log('6. 插入示例维护计划数据...');
const planData = [
  ['ETC车道控制器', '月度维护检查', 'monthly', '2026-04-01', 'pending'],
  ['车辆检测器', '季度校准', 'quarterly', '2026-04-15', 'pending'],
  ['道路监控摄像头', '年度清洁保养', 'yearly', '2026-05-01', 'pending'],
  ['可变情报板', '月度巡检', 'monthly', '2026-03-25', 'pending'],
  ['气象监测站', '季度维护', 'quarterly', '2026-04-10', 'completed']
];

for (const plan of planData) {
  const id = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO MaintenancePlan (id, equipmentId, title, description, scheduleType, nextMaintenanceDate, assigneeId, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, plan[0], plan[1], '定期维护', plan[2], plan[3], 'admin-id-1', plan[4], now, now);
}
console.log('   ✅ 插入5条维护计划数据');

// 插入示例故障记录数据
console.log('7. 插入示例故障记录数据...');
const faultData = [
  ['ETC车道控制器', 'ETC车道无法识别标签', '识别率下降', '设备老化', '更换读卡器', '2026-03-10', '2026-03-12', 'resolved'],
  ['车辆检测器', '数据丢失', '检测数据异常', '软件故障', '升级固件', '2026-03-05', '2026-03-05', 'resolved'],
  ['可变情报板', '显示内容错误', '显示内容错乱', '控制系统故障', '检查控制线路', '2026-03-15', null, 'pending']
];

for (const fault of faultData) {
  const id = `fault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO FaultRecord (id, equipmentId, title, symptoms, causes, solutions, faultDate, resolvedDate, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, fault[0], fault[1], fault[2], fault[3], fault[4], fault[5], fault[6], fault[7], now, now);
}
console.log('   ✅ 插入3条故障记录数据');

// 插入示例知识库数据
console.log('8. 插入示例知识库数据...');
const kbData = [
  {
    title: 'ETC车道识别率下降故障处理',
    symptoms: '车辆通过时标签识别率明显下降，部分车辆需要倒车重试',
    causes: '1. 天线发射功率下降\n2. 标签老化\n3. 周围干扰源增加',
    solutions: '1. 检查并调整天线发射功率\n2. 清洁天线表面\n3. 检测周围电磁环境',
    category: '故障排除',
    tags: '["ETC", "识别率", "故障处理"]'
  },
  {
    title: '监控摄像头图像模糊处理方法',
    symptoms: '摄像头画面模糊，夜视效果差',
    causes: '1. 镜头污染\n2. 红外灯老化\n3. 焦距偏移',
    solutions: '1. 清洁镜头和防护罩\n2. 更换红外灯\n3. 重新调整焦距',
    category: '故障排除',
    tags: '["监控", "摄像头", "维护"]'
  },
  {
    title: '道路照明系统日常维护规范',
    symptoms: '',
    causes: '',
    solutions: '1. 每月检查照明亮度\n2. 每季度清洁灯具\n3. 每年检查电路',
    category: '预防性维护',
    tags: '["照明", "维护规范", "日常维护"]'
  }
];

for (const kb of kbData) {
  const id = `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO KnowledgeBase (id, title, symptoms, causes, solutions, attachments, tags, category, authorId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, kb.title, kb.symptoms, kb.causes, kb.solutions, '', kb.tags, kb.category, 'admin-id-1', now, now);
}
console.log('   ✅ 插入3条知识库数据');

console.log('\n=== 数据库扩展完成 ===\n');

console.log('数据库表结构:');
console.log('- User: 用户表（已有）');
console.log('- Post: 维护心得表（已有）');
console.log('- Category: 分类表（已有）');
console.log('- Equipment: 设备档案表（新建）');
console.log('- MaintenancePlan: 维护计划表（新建）');
console.log('- FaultRecord: 故障记录表（新建）');
console.log('- KnowledgeBase: 知识库表（新建）');

db.close();