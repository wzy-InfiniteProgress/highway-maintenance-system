/**
 * =====================================================
 * 数据库模块 - Supabase PostgreSQL 数据库操作封装
 * =====================================================
 *
 * 功能说明：
 * - 使用 @supabase/supabase-js 连接 Supabase PostgreSQL 数据库
 * - 提供各表的 CRUD 操作封装
 * - 支持分页、筛选、统计等查询
 *
 * Supabase 配置：
 * - Project URL: https://db.eogcfmczanqkfisjzkyp.supabase.co
 *
 * @author 系统自动生成
 * @date 2024
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.eogcfmczanqkfisjzkyp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/* =====================================================
 * 数据模型接口定义
 * ===================================================== */

/** 用户模型 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** 维护心得/帖子模型 */
export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  author_id: string | null;
  is_public: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

/** 帖子分类模型 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

/** 设备模型 */
export interface Equipment {
  id: string;
  name: string;
  model: string | null;
  manufacturer: string | null;
  install_date: string | null;
  location: string | null;
  department: string | null;
  status: string;
  ip: string | null;
  created_at: string;
  updated_at: string;
}

/** 维护计划模型 */
export interface MaintenancePlan {
  id: string;
  equipment_id: string | null;
  title: string;
  description: string | null;
  schedule_type: string | null;
  next_maintenance_date: string | null;
  assignee_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/** 故障记录模型 */
export interface FaultRecord {
  id: string;
  equipment_id: string | null;
  title: string;
  symptoms: string | null;
  causes: string | null;
  solutions: string | null;
  fault_date: string | null;
  resolved_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/** 知识库模型 */
export interface KnowledgeBase {
  id: string;
  title: string;
  symptoms: string | null;
  causes: string | null;
  solutions: string | null;
  attachments: string | null;
  tags: any;
  category: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

/* =====================================================
 * 数据库操作工具类
 * ===================================================== */

export const dbUtils = {
  user: {
    findUnique: async (where: { username?: string; id?: string }): Promise<User | null> => {
      if (where.username) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', where.username)
          .single();
        if (error) return null;
        return data as User;
      }
      if (where.id) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', where.id)
          .single();
        if (error) return null;
        return data as User;
      }
      return null;
    },

    findMany: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return [];
      return data as User[];
    },

    create: async (data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
      const { data: result, error } = await supabase
        .from('users')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result as User;
    },

    update: async (id: string, data: Partial<User>): Promise<void> => {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    count: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    }
  },

  post: {
    findUnique: async (id: string): Promise<Post | null> => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as Post;
    },

    findMany: async (params?: { page?: number; pageSize?: number; category?: string; authorId?: string }): Promise<{ posts: Post[]; total: number }> => {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const offset = (page - 1) * pageSize;

      let query = supabase.from('posts').select('*', { count: 'exact' });

      if (params?.category) {
        query = query.eq('category', params.category);
      }
      if (params?.authorId) {
        query = query.eq('author_id', params.authorId);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) return { posts: [], total: 0 };
      return { posts: data as Post[], total: count || 0 };
    },

    create: async (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> => {
      const { data: result, error } = await supabase
        .from('posts')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result as Post;
    },

    update: async (id: string, data: Partial<Post>): Promise<void> => {
      const { error } = await supabase
        .from('posts')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    incrementViews: async (id: string): Promise<void> => {
      const { error } = await supabase.rpc('increment_post_views', { post_id: id });
      if (error) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ views: 1 })
          .eq('id', id);
        if (updateError) console.error('Failed to increment views:', updateError);
      }
    },

    count: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },

    getTotalViews: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('posts')
        .select('views');
      if (error) return 0;
      return data.reduce((sum, post) => sum + (post.views || 0), 0);
    },

    getCategoryStats: async (): Promise<{ category: string; count: number }[]> => {
      const { data, error } = await supabase
        .from('posts')
        .select('category');
      if (error) return [];
      const stats: Record<string, number> = {};
      data.forEach(post => {
        const cat = post.category || '未分类';
        stats[cat] = (stats[cat] || 0) + 1;
      });
      return Object.entries(stats).map(([category, count]) => ({ category, count }));
    },

    getRecentPosts: async (limit: number = 5): Promise<Post[]> => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return [];
      return data as Post[];
    }
  },

  category: {
    findMany: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) return [];
      return data as Category[];
    },

    findUnique: async (name: string): Promise<Category | null> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('name', name)
        .single();
      if (error) return null;
      return data as Category;
    }
  },

  equipment: {
    findUnique: async (id: string): Promise<Equipment | null> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as Equipment;
    },

    findMany: async (params?: { status?: string; department?: string }): Promise<Equipment[]> => {
      let query = supabase.from('equipment').select('*');

      if (params?.status) {
        query = query.eq('status', params.status);
      }
      if (params?.department) {
        query = query.eq('department', params.department);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return [];
      return data as Equipment[];
    },

    create: async (data: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> => {
      const { data: result, error } = await supabase
        .from('equipment')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result as Equipment;
    },

    update: async (id: string, data: Partial<Equipment>): Promise<void> => {
      const { error } = await supabase
        .from('equipment')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    count: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },

    getStatusStats: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('status');
      if (error) return {};
      const stats: Record<string, number> = {};
      data.forEach(item => {
        const status = item.status || 'unknown';
        stats[status] = (stats[status] || 0) + 1;
      });
      return stats;
    }
  },

  maintenancePlan: {
    findUnique: async (id: string): Promise<MaintenancePlan | null> => {
      const { data, error } = await supabase
        .from('maintenance_plan')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as MaintenancePlan;
    },

    findMany: async (params?: { equipmentId?: string; assigneeId?: string; status?: string }): Promise<MaintenancePlan[]> => {
      let query = supabase.from('maintenance_plan').select('*');

      if (params?.equipmentId) {
        query = query.eq('equipment_id', params.equipmentId);
      }
      if (params?.assigneeId) {
        query = query.eq('assignee_id', params.assigneeId);
      }
      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const { data, error } = await query.order('next_maintenance_date', { ascending: true });
      if (error) return [];
      return data as MaintenancePlan[];
    },

    create: async (data: Omit<MaintenancePlan, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenancePlan> => {
      const { data: result, error } = await supabase
        .from('maintenance_plan')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result as MaintenancePlan;
    },

    update: async (id: string, data: Partial<MaintenancePlan>): Promise<void> => {
      const { error } = await supabase
        .from('maintenance_plan')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('maintenance_plan')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    count: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('maintenance_plan')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },

    getStatusStats: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from('maintenance_plan')
        .select('status');
      if (error) return {};
      const stats: Record<string, number> = {};
      data.forEach(item => {
        const status = item.status || 'unknown';
        stats[status] = (stats[status] || 0) + 1;
      });
      return stats;
    },

    getUpcoming: async (limit: number = 5): Promise<MaintenancePlan[]> => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('maintenance_plan')
        .select('*')
        .gte('next_maintenance_date', today)
        .eq('status', 'pending')
        .order('next_maintenance_date', { ascending: true })
        .limit(limit);
      if (error) return [];
      return data as MaintenancePlan[];
    }
  },

  faultRecord: {
    findUnique: async (id: string): Promise<FaultRecord | null> => {
      const { data, error } = await supabase
        .from('fault_record')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as FaultRecord;
    },

    findMany: async (params?: { equipmentId?: string; status?: string }): Promise<FaultRecord[]> => {
      let query = supabase.from('fault_record').select('*');

      if (params?.equipmentId) {
        query = query.eq('equipment_id', params.equipmentId);
      }
      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const { data, error } = await query.order('fault_date', { ascending: false });
      if (error) return [];
      return data as FaultRecord[];
    },

    create: async (data: Omit<FaultRecord, 'id' | 'created_at' | 'updated_at'>): Promise<FaultRecord> => {
      const { data: result, error } = await supabase
        .from('fault_record')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result as FaultRecord;
    },

    update: async (id: string, data: Partial<FaultRecord>): Promise<void> => {
      const { error } = await supabase
        .from('fault_record')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('fault_record')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    count: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('fault_record')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },

    getStatusStats: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from('fault_record')
        .select('status');
      if (error) return {};
      const stats: Record<string, number> = {};
      data.forEach(item => {
        const status = item.status || 'unknown';
        stats[status] = (stats[status] || 0) + 1;
      });
      return stats;
    },

    getRecent: async (limit: number = 5): Promise<FaultRecord[]> => {
      const { data, error } = await supabase
        .from('fault_record')
        .select('*')
        .order('fault_date', { ascending: false })
        .limit(limit);
      if (error) return [];
      return data as FaultRecord[];
    }
  },

  knowledgeBase: {
    findUnique: async (id: string): Promise<KnowledgeBase | null> => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as KnowledgeBase;
    },

    findMany: async (params?: { category?: string; authorId?: string }): Promise<KnowledgeBase[]> => {
      let query = supabase.from('knowledge_base').select('*');

      if (params?.category) {
        query = query.eq('category', params.category);
      }
      if (params?.authorId) {
        query = query.eq('author_id', params.authorId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return [];
      return data as KnowledgeBase[];
    },

    create: async (data: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeBase> => {
      const { data: result, error } = await supabase
        .from('knowledge_base')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result as KnowledgeBase;
    },

    update: async (id: string, data: Partial<KnowledgeBase>): Promise<void> => {
      const { error } = await supabase
        .from('knowledge_base')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    count: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    },

    search: async (keyword: string): Promise<KnowledgeBase[]> => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .or(`title.ilike.%${keyword}%,symptoms.ilike.%${keyword}%,solutions.ilike.%${keyword}%`)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data as KnowledgeBase[];
    }
  }
};

export default supabase;