/**
 * =====================================================
 * 数据库模块 - SQLite 数据库操作封装
 * =====================================================
 *
 * 功能说明：
 * - 使用 better-sqlite3 操作本地 SQLite 数据库
 * - 提供各表的 CRUD 操作封装
 * - 支持分页、筛选、统计等查询
 *
 * 数据库文件位置：prisma/dev.db
 *
 * @author 系统自动生成
 * @date 2024
 */

import Database from 'better-sqlite3';
import path from 'path';

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

// 创建数据库连接
const db = new Database(dbPath);

/* =====================================================
 * 数据模型接口定义
 * ===================================================== */

/** 用户模型 */
export interface User {
  id: string;                    // 用户ID
  username: string;              // 用户名
  email: string;                 // 邮箱
  password: string;              // 密码（加密存储）
  role: string;                  // 角色：admin-管理员, user-普通用户
  department: string | null;    // 部门
  isActive: number;              // 是否激活：1-激活, 0-未激活
  createdAt: string;            // 创建时间
  updatedAt: string;             // 更新时间
}

/** 维护心得/帖子模型 */
export interface Post {
  id: string;                    // 帖子ID
  title: string;                  // 标题
  content: string;               // 内容（富文本HTML）
  category: string;              // 分类
  tags: string;                  // 标签（JSON数组字符串）
  authorId: string;              // 作者ID
  isPublic: number;              // 是否公开：1-公开, 0-私有
  views: number;                 // 浏览次数
  createdAt: string;            // 创建时间
  updatedAt: string;             // 更新时间
}

/** 帖子分类模型 */
export interface Category {
  id: number;                    // 分类ID
  name: string;                  // 分类名称
  description: string | null;    // 分类描述
  createdAt: string;            // 创建时间
}

/** 设备模型 */
export interface Equipment {
  id: string;                    // 设备ID
  name: string;                  // 设备名称
  model: string;                 // 设备型号
  manufacturer: string;          // 制造商
  installDate: string;           // 安装日期
  location: string;              // 安装位置
  department: string;            // 所属部门
  status: string;               // 状态：active-正常, inactive-停用, maintenance-维护中
  ip: string | null;             // IP地址
  createdAt: string;              // 创建时间
  updatedAt: string;             // 更新时间
}

/** 维护计划模型 */
export interface MaintenancePlan {
  id: string;                    // 计划ID
  equipmentId: string;          // 关联设备ID
  title: string;                 // 计划标题
  description: string;           // 计划描述
  scheduleType: string;          // 计划类型：daily-每日, weekly-每周, monthly-每月, yearly-每年
  nextMaintenanceDate: string;    // 下次维护日期
  assigneeId: string;           // 负责人ID
  status: string;               // 状态：pending-待执行, in_progress-执行中, completed-已完成
  createdAt: string;            // 创建时间
  updatedAt: string;             // 更新时间
}

/** 故障记录模型 */
export interface FaultRecord {
  id: string;                    // 故障ID
  equipmentId: string;           // 关联设备ID
  title: string;                 // 故障标题
  symptoms: string;             // 故障现象
  causes: string;                // 故障原因
  solutions: string;            // 解决方案
  faultDate: string;            // 故障日期
  resolvedDate: string | null;   // 解决日期
  status: string;               // 状态：pending-待处理, handling-处理中, resolved-已解决
  createdAt: string;            // 创建时间
  updatedAt: string;             // 更新时间
}

/** 知识库模型 */
export interface KnowledgeBase {
  id: string;                    // 知识库ID
  title: string;                 // 标题
  symptoms: string;             // 故障现象（富文本）
  causes: string;                // 故障原因（富文本）
  solutions: string;            // 解决方案（富文本）
  attachments: string;          // 附件
  tags: string;                 // 标签（JSON数组字符串）
  category: string;             // 分类
  authorId: string;              // 作者ID
  createdAt: string;            // 创建时间
  updatedAt: string;             // 更新时间
}

/* =====================================================
 * 数据库操作工具类
 * ===================================================== */

/**
 * 用户表操作
 * - findUnique: 按用户名或ID查询单个用户
 * - findMany: 查询所有用户
 * - create: 创建用户
 * - update: 更新用户信息
 * - delete: 删除用户
 * - count: 统计用户数量
 */
export const dbUtils = {
  user: {
    /** 根据用户名或ID查找用户 */
    findUnique: (where: { username?: string; id?: string }): User | undefined => {
      if (where.username) {
        const stmt = db.prepare('SELECT * FROM User WHERE username = ?');
        return stmt.get(where.username) as User | undefined;
      }
      if (where.id) {
        const stmt = db.prepare('SELECT * FROM User WHERE id = ?');
        return stmt.get(where.id) as User | undefined;
      }
      return undefined;
    },

    /** 查询所有用户 */
    findMany: (): User[] => {
      const stmt = db.prepare('SELECT * FROM User');
      return stmt.all() as User[];
    },

    /** 创建新用户 */
    create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
      const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO User (id, username, email, password, role, department, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, data.username, data.email, data.password, data.role, data.department, data.isActive, now, now);
      return { ...data, id, createdAt: now, updatedAt: now };
    },

    /** 更新用户信息 */
    update: (id: string, data: Partial<User>): void => {
      const now = new Date().toISOString();
      const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
      const values = fields.map(key => data[key as keyof User]);
      const setClause = fields.map(key => `${key} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE User SET ${setClause}, updatedAt = ? WHERE id = ?`);
      stmt.run(...values, now, id);
    },

    /** 删除用户 */
    delete: (id: string): void => {
      const stmt = db.prepare('DELETE FROM User WHERE id = ?');
      stmt.run(id);
    },

    /** 统计用户数量 */
    count: (): number => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM User');
      const result = stmt.get() as { count: number };
      return result.count;
    }
  },

  /**
   * 维护心得/帖子表操作
   */
  post: {
    /** 根据ID查询帖子 */
    findUnique: (id: string): Post | undefined => {
      const stmt = db.prepare('SELECT * FROM Post WHERE id = ?');
      return stmt.get(id) as Post | undefined;
    },

    /**
     * 分页查询帖子
     * @param params.page 页码
     * @param params.pageSize 每页数量
     * @param params.category 按分类筛选
     * @param params.authorId 按作者筛选
     */
    findMany: (params?: { page?: number; pageSize?: number; category?: string; authorId?: string }): { posts: Post[]; total: number } => {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const offset = (page - 1) * pageSize;

      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params?.category) {
        whereClause += ' AND category = ?';
        queryParams.push(params.category);
      }

      if (params?.authorId) {
        whereClause += ' AND authorId = ?';
        queryParams.push(params.authorId);
      }

      const countStmt = db.prepare(`SELECT COUNT(*) as total FROM Post ${whereClause}`);
      const { total } = countStmt.get(...queryParams) as { total: number };

      const stmt = db.prepare(`
        SELECT * FROM Post ${whereClause}
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?
      `);
      const posts = stmt.all(...queryParams, pageSize, offset) as Post[];

      return { posts, total };
    },

    /** 创建帖子 */
    create: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post => {
      const id = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO Post (id, title, content, category, tags, authorId, isPublic, views, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, data.title, data.content, data.category, data.tags, data.authorId, data.isPublic, data.views, now, now);
      return { ...data, id, createdAt: now, updatedAt: now };
    },

    /** 更新帖子 */
    update: (id: string, data: Partial<Post>): void => {
      const now = new Date().toISOString();
      const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
      const values = fields.map(key => data[key as keyof Post]);
      const setClause = fields.map(key => `${key} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE Post SET ${setClause}, updatedAt = ? WHERE id = ?`);
      stmt.run(...values, now, id);
    },

    /** 删除帖子 */
    delete: (id: string): void => {
      const stmt = db.prepare('DELETE FROM Post WHERE id = ?');
      stmt.run(id);
    },

    /** 增加浏览次数 */
    incrementViews: (id: string): void => {
      const stmt = db.prepare('UPDATE Post SET views = views + 1 WHERE id = ?');
      stmt.run(id);
    },

    /** 统计帖子总数 */
    count: (): number => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM Post');
      const result = stmt.get() as { count: number };
      return result.count;
    },

    /** 获取总浏览量 */
    getTotalViews: (): number => {
      const stmt = db.prepare('SELECT SUM(views) as total FROM Post');
      const result = stmt.get() as { total: number };
      return result.total || 0;
    },

    /** 按分类统计 */
    getCategoryStats: (): { category: string; count: number }[] => {
      const stmt = db.prepare('SELECT category, COUNT(*) as count FROM Post GROUP BY category');
      return stmt.all() as { category: string; count: number }[];
    },

    /** 获取最新帖子 */
    getRecentPosts: (limit: number = 5): Post[] => {
      const stmt = db.prepare('SELECT * FROM Post ORDER BY createdAt DESC LIMIT ?');
      return stmt.all(limit) as Post[];
    }
  },

  /**
   * 帖子分类表操作
   */
  category: {
    /** 查询所有分类 */
    findMany: (): Category[] => {
      const stmt = db.prepare('SELECT * FROM Category');
      return stmt.all() as Category[];
    },

    /** 根据名称查询分类 */
    findUnique: (name: string): Category | undefined => {
      const stmt = db.prepare('SELECT * FROM Category WHERE name = ?');
      return stmt.get(name) as Category | undefined;
    }
  },

  /**
   * 设备档案表操作
   */
  equipment: {
    /** 根据ID查询设备 */
    findUnique: (id: string): Equipment | undefined => {
      const stmt = db.prepare('SELECT * FROM Equipment WHERE id = ?');
      return stmt.get(id) as Equipment | undefined;
    },

    /**
     * 查询设备列表
     * @param params.status 按状态筛选
     * @param params.department 按部门筛选
     */
    findMany: (params?: { status?: string; department?: string }): Equipment[] => {
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params?.status) {
        whereClause += ' AND status = ?';
        queryParams.push(params.status);
      }

      if (params?.department) {
        whereClause += ' AND department = ?';
        queryParams.push(params.department);
      }

      const stmt = db.prepare(`SELECT * FROM Equipment ${whereClause} ORDER BY createdAt DESC`);
      return stmt.all(...queryParams) as Equipment[];
    },

    /** 创建设备 */
    create: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Equipment => {
      const id = `equipment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO Equipment (id, name, model, manufacturer, installDate, location, department, status, ip, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, data.name, data.model, data.manufacturer, data.installDate, data.location, data.department, data.status, data.ip || null, now, now);
      return { ...data, id, createdAt: now, updatedAt: now };
    },

    /** 更新设备 */
    update: (id: string, data: Partial<Equipment>): void => {
      const now = new Date().toISOString();
      const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
      const values = fields.map(key => data[key as keyof Equipment]);
      const setClause = fields.map(key => `${key} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE Equipment SET ${setClause}, updatedAt = ? WHERE id = ?`);
      stmt.run(...values, now, id);
    },

    /** 删除设备 */
    delete: (id: string): void => {
      const stmt = db.prepare('DELETE FROM Equipment WHERE id = ?');
      stmt.run(id);
    },

    /** 统计设备数量 */
    count: (): number => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM Equipment');
      const result = stmt.get() as { count: number };
      return result.count;
    },

    /** 按状态统计 */
    getStatusStats: (): { status: string; count: number }[] => {
      const stmt = db.prepare('SELECT status, COUNT(*) as count FROM Equipment GROUP BY status');
      return stmt.all() as { status: string; count: number }[];
    }
  },

  /**
   * 维护计划表操作
   */
  maintenancePlan: {
    /** 根据ID查询计划 */
    findUnique: (id: string): MaintenancePlan | undefined => {
      const stmt = db.prepare('SELECT * FROM MaintenancePlan WHERE id = ?');
      return stmt.get(id) as MaintenancePlan | undefined;
    },

    /**
     * 查询维护计划列表
     * @param params.equipmentId 按设备筛选
     * @param params.assigneeId 按负责人筛选
     * @param params.status 按状态筛选
     */
    findMany: (params?: { equipmentId?: string; assigneeId?: string; status?: string }): MaintenancePlan[] => {
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params?.equipmentId) {
        whereClause += ' AND equipmentId = ?';
        queryParams.push(params.equipmentId);
      }

      if (params?.assigneeId) {
        whereClause += ' AND assigneeId = ?';
        queryParams.push(params.assigneeId);
      }

      if (params?.status) {
        whereClause += ' AND status = ?';
        queryParams.push(params.status);
      }

      const stmt = db.prepare(`SELECT * FROM MaintenancePlan ${whereClause} ORDER BY nextMaintenanceDate ASC`);
      return stmt.all(...queryParams) as MaintenancePlan[];
    },

    /** 创建维护计划 */
    create: (data: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): MaintenancePlan => {
      const id = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO MaintenancePlan (id, equipmentId, title, description, scheduleType, nextMaintenanceDate, assigneeId, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, data.equipmentId, data.title, data.description, data.scheduleType, data.nextMaintenanceDate, data.assigneeId, data.status, now, now);
      return { ...data, id, createdAt: now, updatedAt: now };
    },

    /** 更新维护计划 */
    update: (id: string, data: Partial<MaintenancePlan>): void => {
      const now = new Date().toISOString();
      const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
      const values = fields.map(key => data[key as keyof MaintenancePlan]);
      const setClause = fields.map(key => `${key} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE MaintenancePlan SET ${setClause}, updatedAt = ? WHERE id = ?`);
      stmt.run(...values, now, id);
    },

    /** 删除维护计划 */
    delete: (id: string): void => {
      const stmt = db.prepare('DELETE FROM MaintenancePlan WHERE id = ?');
      stmt.run(id);
    },

    /** 统计计划数量 */
    count: (): number => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM MaintenancePlan');
      const result = stmt.get() as { count: number };
      return result.count;
    },

    /** 按状态统计 */
    getStatusStats: (): { status: string; count: number }[] => {
      const stmt = db.prepare('SELECT status, COUNT(*) as count FROM MaintenancePlan GROUP BY status');
      return stmt.all() as { status: string; count: number }[];
    },

    /** 获取即将到期的维护计划 */
    getUpcoming: (limit: number = 5): MaintenancePlan[] => {
      const today = new Date().toISOString().split('T')[0];
      const stmt = db.prepare('SELECT * FROM MaintenancePlan WHERE nextMaintenanceDate >= ? AND status = ? ORDER BY nextMaintenanceDate ASC LIMIT ?');
      return stmt.all(today, 'pending', limit) as MaintenancePlan[];
    }
  },

  /**
   * 故障记录表操作
   */
  faultRecord: {
    /** 根据ID查询故障 */
    findUnique: (id: string): FaultRecord | undefined => {
      const stmt = db.prepare('SELECT * FROM FaultRecord WHERE id = ?');
      return stmt.get(id) as FaultRecord | undefined;
    },

    /**
     * 查询故障记录列表
     * @param params.equipmentId 按设备筛选
     * @param params.status 按状态筛选
     */
    findMany: (params?: { equipmentId?: string; status?: string }): FaultRecord[] => {
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params?.equipmentId) {
        whereClause += ' AND equipmentId = ?';
        queryParams.push(params.equipmentId);
      }

      if (params?.status) {
        whereClause += ' AND status = ?';
        queryParams.push(params.status);
      }

      const stmt = db.prepare(`SELECT * FROM FaultRecord ${whereClause} ORDER BY faultDate DESC`);
      return stmt.all(...queryParams) as FaultRecord[];
    },

    /** 创建故障记录 */
    create: (data: Omit<FaultRecord, 'id' | 'createdAt' | 'updatedAt'>): FaultRecord => {
      const id = `fault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO FaultRecord (id, equipmentId, title, symptoms, causes, solutions, faultDate, resolvedDate, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, data.equipmentId, data.title, data.symptoms, data.causes, data.solutions, data.faultDate, data.resolvedDate, data.status, now, now);
      return { ...data, id, createdAt: now, updatedAt: now };
    },

    /** 更新故障记录 */
    update: (id: string, data: Partial<FaultRecord>): void => {
      const now = new Date().toISOString();
      const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
      const values = fields.map(key => data[key as keyof FaultRecord]);
      const setClause = fields.map(key => `${key} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE FaultRecord SET ${setClause}, updatedAt = ? WHERE id = ?`);
      stmt.run(...values, now, id);
    },

    /** 删除故障记录 */
    delete: (id: string): void => {
      const stmt = db.prepare('DELETE FROM FaultRecord WHERE id = ?');
      stmt.run(id);
    },

    /** 统计故障数量 */
    count: (): number => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM FaultRecord');
      const result = stmt.get() as { count: number };
      return result.count;
    },

    /** 按状态统计 */
    getStatusStats: (): { status: string; count: number }[] => {
      const stmt = db.prepare('SELECT status, COUNT(*) as count FROM FaultRecord GROUP BY status');
      return stmt.all() as { status: string; count: number }[];
    },

    /** 获取最新故障记录 */
    getRecent: (limit: number = 5): FaultRecord[] => {
      const stmt = db.prepare('SELECT * FROM FaultRecord ORDER BY faultDate DESC LIMIT ?');
      return stmt.all(limit) as FaultRecord[];
    }
  },

  /**
   * 知识库表操作
   */
  knowledgeBase: {
    /** 根据ID查询知识库 */
    findUnique: (id: string): KnowledgeBase | undefined => {
      const stmt = db.prepare('SELECT * FROM KnowledgeBase WHERE id = ?');
      return stmt.get(id) as KnowledgeBase | undefined;
    },

    /**
     * 查询知识库列表
     * @param params.category 按分类筛选
     * @param params.authorId 按作者筛选
     */
    findMany: (params?: { category?: string; authorId?: string }): KnowledgeBase[] => {
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params?.category) {
        whereClause += ' AND category = ?';
        queryParams.push(params.category);
      }

      if (params?.authorId) {
        whereClause += ' AND authorId = ?';
        queryParams.push(params.authorId);
      }

      const stmt = db.prepare(`SELECT * FROM KnowledgeBase ${whereClause} ORDER BY createdAt DESC`);
      return stmt.all(...queryParams) as KnowledgeBase[];
    },

    /** 创建知识库条目 */
    create: (data: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeBase => {
      const id = `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO KnowledgeBase (id, title, symptoms, causes, solutions, attachments, tags, category, authorId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, data.title, data.symptoms, data.causes, data.solutions, data.attachments, data.tags, data.category, data.authorId, now, now);
      return { ...data, id, createdAt: now, updatedAt: now };
    },

    /** 更新知识库 */
    update: (id: string, data: Partial<KnowledgeBase>): void => {
      const now = new Date().toISOString();
      const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
      const values = fields.map(key => data[key as keyof KnowledgeBase]);
      const setClause = fields.map(key => `${key} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE KnowledgeBase SET ${setClause}, updatedAt = ? WHERE id = ?`);
      stmt.run(...values, now, id);
    },

    /** 删除知识库 */
    delete: (id: string): void => {
      const stmt = db.prepare('DELETE FROM KnowledgeBase WHERE id = ?');
      stmt.run(id);
    },

    /** 统计知识库数量 */
    count: (): number => {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM KnowledgeBase');
      const result = stmt.get() as { count: number };
      return result.count;
    },

    /** 搜索知识库 */
    search: (keyword: string): KnowledgeBase[] => {
      const stmt = db.prepare('SELECT * FROM KnowledgeBase WHERE title LIKE ? OR symptoms LIKE ? OR solutions LIKE ? ORDER BY createdAt DESC');
      const pattern = `%${keyword}%`;
      return stmt.all(pattern, pattern, pattern) as KnowledgeBase[];
    }
  }
};

// 导出数据库实例
export default db;
