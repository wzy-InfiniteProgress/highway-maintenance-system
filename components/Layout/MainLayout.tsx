/**
 * =====================================================
 * 主布局组件 - 应用的整体布局结构
 * =====================================================
 *
 * 功能说明：
 * - 提供应用的整体页面框架
 * - 实现响应式布局（桌面端/移动端）
 * - 包含顶部导航、侧边栏、底部导航
 * - 处理用户认证状态
 *
 * 布局结构：
 * - 桌面端：左侧边栏 + 顶部栏 + 主内容区
 * - 移动端：顶部栏 + 主内容区 + 底部导航
 *
 * @date 2024
 */

'use client';

import { Layout, Menu, Avatar, Dropdown, Space, Drawer, Button } from 'antd';
import {
  HomeOutlined,           // 首页图标
  FileTextOutlined,        // 维护心得图标
  UserOutlined,            // 用户图标
  LogoutOutlined,          // 退出图标
  MenuFoldOutlined,        // 收起菜单图标
  MenuUnfoldOutlined,      // 展开菜单图标
  DashboardOutlined,       // 数据统计图标
  ToolOutlined,            // 设备档案图标
  CalendarOutlined,         // 维护计划图标
  BookOutlined,             // 故障知识库图标
  MenuOutlined,             // 移动端菜单图标
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * 主布局组件
 * @param children - 页面内容子组件
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();           // 路由导航
  const pathname = usePathname();       // 当前路径
  const [collapsed, setCollapsed] = useState(false);        // 侧边栏收起状态
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);  // 移动端菜单状态
  const [isMobile, setIsMobile] = useState(false);          // 是否移动端
  const [user, setUser] = useState<any>(null);              // 当前用户信息

  /**
   * 组件挂载时执行
   * - 获取当前用户信息
   * - 检测是否为移动端
   * - 添加窗口大小监听
   */
  useEffect(() => {
    fetchCurrentUser();     // 获取当前登录用户
    checkMobile();          // 检测是否为移动端
    window.addEventListener('resize', checkMobile);   // 监听窗口大小变化
    return () => window.removeEventListener('resize', checkMobile);  // 清理监听
  }, []);

  /**
   * 检测是否为移动端设备
   * 判断条件：窗口宽度小于 768px
   */
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  /**
   * 获取当前登录用户信息
   * 调用 /api/auth/me 接口获取用户数据
   * 如果未登录则跳转到登录页
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      router.push('/login');
    }
  };

  /**
   * 处理用户登出
   * 调用 /api/auth/logout 接口
   * 登出后跳转到登录页
   */
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * 处理菜单点击导航
   * @param path - 目标页面路径
   */
  const handleMenuClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);   // 关闭移动端菜单
  };

  // ============================================
  // 桌面端菜单项配置
  // ============================================
  const menuItems: MenuProps['items'] = [
    // 首页
    { key: '/', icon: <HomeOutlined />, label: '首页', onClick: () => handleMenuClick('/') },
    // 数据统计
    { key: '/dashboard', icon: <DashboardOutlined />, label: '数据统计', onClick: () => handleMenuClick('/dashboard') },
    // 设备档案
    { key: '/equipment', icon: <ToolOutlined />, label: '设备档案', onClick: () => handleMenuClick('/equipment') },
    // 维护计划
    { key: '/maintenance-plan', icon: <CalendarOutlined />, label: '维护计划', onClick: () => handleMenuClick('/maintenance-plan') },
    // 故障知识库
    { key: '/knowledge-base', icon: <BookOutlined />, label: '故障知识库', onClick: () => handleMenuClick('/knowledge-base') },
    // 维护心得
    { key: '/posts', icon: <FileTextOutlined />, label: '维护心得', onClick: () => handleMenuClick('/posts') },
    // 用户管理
    { key: '/users', icon: <UserOutlined />, label: '用户管理', onClick: () => handleMenuClick('/users') },
  ];

  // ============================================
  // 用户下拉菜单配置
  // ============================================
  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  // ============================================
  // 移动端底部导航项配置
  // ============================================
  const mobileNavItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/dashboard', icon: <DashboardOutlined />, label: '统计' },
    { key: '/equipment', icon: <ToolOutlined />, label: '设备' },
    { key: '/maintenance-plan', icon: <CalendarOutlined />, label: '计划' },
    { key: '/knowledge-base', icon: <BookOutlined />, label: '知识' },
  ];

  // ============================================
  // 渲染布局
  // ============================================
  return (
    <Layout className="min-h-screen" style={{ maxWidth: '100vw', overflow: 'hidden' }}>

      {/* ============================================
          桌面端侧边栏（仅在非移动端显示）
          ============================================ */}
      {!isMobile && (
        <Sider
          trigger={null}                    // 禁用默认触发器
          collapsible                        // 可收起
          collapsed={collapsed}              // 当前收起状态
          className="bg-blue-600 hidden md:block"  // 蓝色背景，中等屏幕以上显示
          width={200}                       // 展开宽度 200px
          collapsedWidth={80}               // 收起宽度 80px
        >
          {/* 侧边栏顶部 Logo 区域 */}
          <div className="h-16 flex items-center justify-center bg-blue-700">
            <h1 className="text-white text-xl font-bold">
              {/* 根据收起状态显示不同标题 */}
              {collapsed ? '机电' : '机电维护'}
            </h1>
          </div>
          {/* 侧边栏菜单 */}
          <Menu
            theme="dark"                    // 深色主题
            mode="inline"                   // 内联模式
            selectedKeys={[pathname]}       // 高亮当前页面
            items={menuItems}              // 菜单项
            className="bg-blue-600"        // 蓝色背景
          />
        </Sider>
      )}

      {/* ============================================
          移动端顶部导航栏（仅在移动端显示）
          固定在屏幕顶部
          ============================================ */}
      {isMobile && (
        <Header
          className="bg-blue-600 px-4 flex items-center justify-between shadow-md fixed top-0 left-0 right-0 z-50"
          style={{ height: 56 }}
        >
          {/* 左侧：菜单按钮和标题 */}
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined className="text-white text-lg" />}
              onClick={() => setMobileMenuOpen(true)}   // 打开侧边抽屉
            />
            <h1 className="text-white text-lg font-bold ml-2">机电维护</h1>
          </div>
          {/* 右侧：用户头像 */}
          <Space>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar icon={<UserOutlined />} size="small" className="cursor-pointer" />
            </Dropdown>
          </Space>
        </Header>
      )}

      {/* ============================================
          移动端侧边抽屉菜单
          从左侧滑出，显示完整导航菜单
          ============================================ */}
      <Drawer
        title={<span className="text-blue-600 font-bold">导航菜单</span>}
        placement="left"              // 从左侧滑出
        onClose={() => setMobileMenuOpen(false)}   // 点击关闭或遮罩关闭
        open={mobileMenuOpen}         // 打开状态
        size="large"                  // 大尺寸抽屉
        styles={{ body: { padding: 0 } }}  // 内容区无内边距
      >
        {/* 抽屉头部用户信息 */}
        <div className="bg-blue-600 p-4">
          <div className="flex items-center">
            <Avatar
              icon={<UserOutlined />}
              size="large"
              className="bg-white text-blue-600"
            />
            <div className="ml-3 text-white">
              <div className="font-bold">{user?.username || '用户'}</div>
              <div className="text-sm opacity-80">
                {user?.role === 'admin' ? '管理员' : '维护人员'}
              </div>
            </div>
          </div>
        </div>
        {/* 抽屉内导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="border-r-0"
        />
      </Drawer>

      {/* ============================================
          主内容区域
          ============================================ */}
      <Layout className={isMobile ? 'mt-14 mb-16' : ''}>
        {/* 桌面端顶部栏（仅在桌面端显示） */}
        {!isMobile && (
          <Header
            className="bg-white px-6 flex items-center justify-between shadow-sm"
            style={{ height: 64 }}
          >
            {/* 左侧：侧边栏折叠按钮 */}
            <div className="flex items-center">
              <div
                className="cursor-pointer text-xl"
                onClick={() => setCollapsed(!collapsed)}  // 切换侧边栏状态
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            </div>
            {/* 右侧：用户信息 */}
            <Space>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center cursor-pointer">
                  <Avatar icon={<UserOutlined />} className="mr-2" />
                  <span>{user?.username || '用户'}</span>
                </div>
              </Dropdown>
            </Space>
          </Header>
        )}

        {/* ============================================
            页面内容区域
            移动端：留出顶部和底部导航空间
            桌面端：正常边距和阴影
            ============================================ */}
        <Content className={isMobile ? 'p-4 bg-gray-100' : 'm-6 p-6 bg-white rounded-lg shadow'}>
          <div className={isMobile ? 'overflow-x-auto' : ''}>
            {children}
          </div>
        </Content>
      </Layout>

      {/* ============================================
          移动端底部导航栏
          固定在屏幕底部，提供快捷导航
          ============================================ */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around items-center h-14">
            {mobileNavItems.map(item => (
              <div
                key={item.key}
                className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  pathname === item.key ? 'text-blue-600' : 'text-gray-500'
                }`}
                onClick={() => handleMenuClick(item.key)}
              >
                <div className="text-xl">{item.icon}</div>
                <div className="text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
