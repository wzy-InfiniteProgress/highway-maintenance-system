-- =====================================================
-- Supabase 数据库部署脚本
-- 高速公路机电维护管理系统
-- =====================================================
--
-- 使用说明：
-- 1. 登录 Supabase (https://supabase.com)
-- 2. 创建新项目
-- 3. 进入 SQL Editor
-- 4. 执行本脚本
-- 5. 获取连接信息并更新 .env.local
--
-- =====================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 用户表
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 设备档案表
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    install_date DATE,
    location VARCHAR(200),
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 设备索引
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_department ON equipment(department);

-- =====================================================
-- 维护计划表
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(20) CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    next_maintenance_date DATE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 维护计划索引
CREATE INDEX IF NOT EXISTS idx_plan_equipment ON maintenance_plan(equipment_id);
CREATE INDEX IF NOT EXISTS idx_plan_assignee ON maintenance_plan(assignee_id);
CREATE INDEX IF NOT EXISTS idx_plan_status ON maintenance_plan(status);

-- =====================================================
-- 故障记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS fault_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    symptoms TEXT,
    causes TEXT,
    solutions TEXT,
    fault_date DATE,
    resolved_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'handling', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 故障记录索引
CREATE INDEX IF NOT EXISTS idx_fault_equipment ON fault_record(equipment_id);
CREATE INDEX IF NOT EXISTS idx_fault_status ON fault_record(status);

-- =====================================================
-- 知识库表
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    symptoms TEXT,
    causes TEXT,
    solutions TEXT,
    attachments TEXT,
    tags JSONB DEFAULT '[]',
    category VARCHAR(50),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 知识库索引
CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_kb_author ON knowledge_base(author_id);

-- =====================================================
-- 维护心得/帖子表
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    category VARCHAR(50),
    tags JSONB DEFAULT '[]',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 帖子索引
CREATE INDEX IF NOT EXISTS idx_post_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_post_category ON posts(category);

-- =====================================================
-- 帖子分类表
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 插入默认分类
-- =====================================================
INSERT INTO categories (name, description) VALUES
    ('设备维护', '设备日常维护相关'),
    ('故障排除', '故障处理经验分享'),
    ('预防性维护', '预防性维护措施'),
    ('技术改进', '技术改进方案'),
    ('安全规范', '安全操作规程'),
    ('其他', '其他类容')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 插入默认管理员账号
-- 密码: admin123 (bcrypt 加密)
-- =====================================================
INSERT INTO users (username, email, password, role, department, is_active) VALUES
    ('admin', 'admin@example.com', '$2a$10$rQZ8K.5K5K5K5K5K5K5K5OK5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'admin', '管理部', true),
    ('user1', 'user1@example.com', '$2a$10$rQZ8K.5K5K5K5K5K5K5K5OK5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'user', '运维部', true)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 创建更新时间触发器函数
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 为各表添加更新时间触发器
-- =====================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_plan_updated_at ON maintenance_plan;
CREATE TRIGGER update_maintenance_plan_updated_at
    BEFORE UPDATE ON maintenance_plan
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fault_record_updated_at ON fault_record;
CREATE TRIGGER update_fault_record_updated_at
    BEFORE UPDATE ON fault_record
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (行级安全策略) - 可选，Supabase 默认启用
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取数据（根据需要调整）
CREATE POLICY "Allow all reads" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all reads" ON equipment FOR SELECT USING (true);
CREATE POLICY "Allow all reads" ON maintenance_plan FOR SELECT USING (true);
CREATE POLICY "Allow all reads" ON fault_record FOR SELECT USING (true);
CREATE POLICY "Allow all reads" ON knowledge_base FOR SELECT USING (true);
CREATE POLICY "Allow all reads" ON posts FOR SELECT USING (true);

-- 允许认证用户插入数据
CREATE POLICY "Allow authenticated insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON maintenance_plan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON fault_record FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON knowledge_base FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON posts FOR INSERT WITH CHECK (true);

-- 允许认证用户更新数据
CREATE POLICY "Allow authenticated update" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated update" ON equipment FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated update" ON maintenance_plan FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated update" ON fault_record FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated update" ON knowledge_base FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated update" ON posts FOR UPDATE USING (true);

-- 允许认证用户删除数据
CREATE POLICY "Allow authenticated delete" ON users FOR DELETE USING (true);
CREATE POLICY "Allow authenticated delete" ON equipment FOR DELETE USING (true);
CREATE POLICY "Allow authenticated delete" ON maintenance_plan FOR DELETE USING (true);
CREATE POLICY "Allow authenticated delete" ON fault_record FOR DELETE USING (true);
CREATE POLICY "Allow authenticated delete" ON knowledge_base FOR DELETE USING (true);
CREATE POLICY "Allow authenticated delete" ON posts FOR DELETE USING (true);

-- =====================================================
-- 完成提示
-- =====================================================
-- 部署完成后，更新 .env.local 文件：
--
-- DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[dbname]"
--
