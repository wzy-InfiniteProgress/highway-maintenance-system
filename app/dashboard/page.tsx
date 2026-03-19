/**
 * =====================================================
 * 数据统计仪表板页面
 * =====================================================
 *
 * 功能说明：
 * - 展示系统各类数据的统计信息
 * - 提供可视化的图表展示
 * - 显示待办事项和待处理故障
 *
 * 页面结构：
 * - 关键指标卡片（用户总数、心得数、设备数、故障数）
 * - 完成率统计（维护计划完成率、故障解决率）
 * - 图表统计（设备状态分布、维护计划状态、故障处理状态）
 * - 待办事项（待执行维护计划、待处理故障）
 * - 知识库统计
 *
 * 数据来源：/api/stats
 *
 * @date 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  ToolOutlined,
  WarningOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/**
 * 数据统计仪表板页面组件
 * @description 展示系统各类数据的统计信息，包括用户、设备、维护计划、故障等数据
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 组件挂载时获取统计数据
  useEffect(() => {
    fetchStats();
  }, []);

  /**
   * 获取统计数据
   * @description 从 /api/stats 获取系统各类统计信息
   */
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </MainLayout>
    );
  }

  // 数据加载失败状态
  if (!stats) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载失败</div>
        </div>
      </MainLayout>
    );
  }

  // 将设备状态数据转换为图表格式
  const equipmentChartData: { name: string; value: number }[] = Object.entries(stats.equipment.statusStats || {}).map(([name, value]) => ({
    name: name === 'active' ? '正常' : name === 'maintenance' ? '维护中' : name,
    value: value as number,
  }));

  // 将维护计划状态数据转换为图表格式
  const maintenanceChartData: { name: string; value: number }[] = Object.entries(stats.maintenance.statusStats || {}).map(([name, value]) => ({
    name: name === 'pending' ? '待执行' : name === 'in_progress' ? '执行中' : name === 'completed' ? '已完成' : name,
    value: value as number,
  }));

  // 将故障状态数据转换为图表格式
  const faultChartData: { name: string; value: number }[] = Object.entries(stats.faults.statusStats || {}).map(([name, value]) => ({
    name: name === 'pending' ? '待处理' : name === 'resolved' ? '已解决' : name,
    value: value as number,
  }));

  // 图表颜色配置
  const COLORS = ['#52c41a', '#1890ff', '#faad14', '#f5222d'];

  return (
    <MainLayout>
      <div>
        {/* 页面标题 */}
        <h1 className="text-2xl font-bold mb-6">数据统计仪表板</h1>

        {/* 关键指标卡片区域 */}
        <Row gutter={[16, 16]} className="mb-6">
          {/* 用户总数卡片 */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="用户总数"
                value={stats.users.total}
                prefix={<UserOutlined />}
                styles={{ content: { color: '#1890ff' } }}
              />
              <div className="mt-2 text-sm text-gray-500">
                活跃用户: {stats.users.active} / {stats.users.inactive} 禁用
              </div>
            </Card>
          </Col>

          {/* 维护心得卡片 */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="维护心得"
                value={stats.posts.total}
                prefix={<FileTextOutlined />}
                styles={{ content: { color: '#52c41a' } }}
              />
              <div className="mt-2 text-sm text-gray-500">
                总浏览量: {stats.posts.totalViews}
              </div>
            </Card>
          </Col>

          {/* 设备总数卡片 */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="设备总数"
                value={stats.equipment.total}
                prefix={<ToolOutlined />}
                styles={{ content: { color: '#faad14' } }}
              />
              <div className="mt-2 text-sm text-gray-500">
                正常: {stats.equipment.statusStats?.active || 0} / 维护中: {stats.equipment.statusStats?.maintenance || 0}
              </div>
            </Card>
          </Col>

          {/* 故障记录卡片 */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="故障记录"
                value={stats.faults.total}
                prefix={<WarningOutlined />}
                styles={{ content: { color: '#f5222d' } }}
              />
              <div className="mt-2 text-sm text-gray-500">
                已解决: {stats.faults.statusStats?.resolved || 0} / 待处理: {stats.faults.statusStats?.pending || 0}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 完成率统计区域 */}
        <Row gutter={[16, 16]} className="mb-6">
          {/* 维护计划完成率 */}
          <Col xs={24} lg={12}>
            <Card title="维护计划完成率">
              <Progress
                percent={stats.completionRates.maintenance}
                strokeColor="#52c41a"
                size={{ height: 20 }}
              />
              <div className="mt-2 text-sm text-gray-500">
                已完成 {stats.maintenance.statusStats?.completed || 0} 个维护计划
              </div>
            </Card>
          </Col>

          {/* 故障解决率 */}
          <Col xs={24} lg={12}>
            <Card title="故障解决率">
              <Progress
                percent={stats.completionRates.faults}
                strokeColor="#1890ff"
                size={{ height: 20 }}
              />
              <div className="mt-2 text-sm text-gray-500">
                已解决 {stats.faults.statusStats?.resolved || 0} 个故障记录
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图表统计区域 */}
        <Row gutter={[16, 16]} className="mb-6">
          {/* 设备状态分布饼图 */}
          <Col xs={24} lg={8}>
            <Card title="设备状态分布">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={equipmentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {equipmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* 图例 */}
              <div className="text-center">
                {equipmentChartData.map((entry, index) => (
                  <Tag key={index} color={COLORS[index % COLORS.length]}>
                    {entry.name}: {entry.value}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>

          {/* 维护计划状态柱状图 */}
          <Col xs={24} lg={8}>
            <Card title="维护计划状态">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={maintenanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 故障处理状态柱状图 */}
          <Col xs={24} lg={8}>
            <Card title="故障处理状态">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={faultChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f5222d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 待办事项区域 */}
        <Row gutter={[16, 16]}>
          {/* 待执行维护计划列表 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <ClockCircleOutlined className="mr-2" />
                  待执行维护计划
                </span>
              }
            >
              {stats.maintenance.upcoming.length === 0 ? (
                <div className="text-gray-500 text-center py-8">暂无待执行的维护计划</div>
              ) : (
                <Table
                  dataSource={stats.maintenance.upcoming}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  columns={[
                    { title: '计划名称', dataIndex: 'title', key: 'title', width: 150 },
                    { title: '计划类型', dataIndex: 'scheduleType', key: 'scheduleType', width: 100,
                      render: (type: string) => (
                        <Tag color="blue">
                          {type === 'daily' ? '每日' : type === 'weekly' ? '每周' : type === 'monthly' ? '每月' : type === 'yearly' ? '每年' : type}
                        </Tag>
                      )
                    },
                    { title: '下次维护日期', dataIndex: 'nextMaintenanceDate', key: 'nextMaintenanceDate', width: 120 },
                    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
                      render: (status: string) => (
                        <Tag color={status === 'pending' ? 'orange' : status === 'in_progress' ? 'blue' : 'green'}>
                          {status === 'pending' ? '待执行' : status === 'in_progress' ? '执行中' : '已完成'}
                        </Tag>
                      )
                    },
                  ]}
                />
              )}
            </Card>
          </Col>

          {/* 待处理故障列表 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <ExclamationCircleOutlined className="mr-2" />
                  待处理故障
                </span>
              }
            >
              {stats.faults.recentFaults.filter((f: any) => f.status === 'pending').length === 0 ? (
                <div className="text-gray-500 text-center py-8">暂无待处理的故障</div>
              ) : (
                <Table
                  dataSource={stats.faults.recentFaults.filter((f: any) => f.status === 'pending')}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  columns={[
                    { title: '故障标题', dataIndex: 'title', key: 'title', width: 150 },
                    { title: '故障日期', dataIndex: 'faultDate', key: 'faultDate', width: 100 },
                    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
                      render: (status: string) => (
                        <Tag color="orange">待处理</Tag>
                      )
                    },
                  ]}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* 知识库统计区域 */}
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24}>
            <Card>
              <Statistic
                title="故障知识库"
                value={stats.knowledge.total}
                prefix={<BookOutlined />}
                styles={{ content: { color: '#722ed1' } }}
              />
              <div className="mt-2 text-sm text-gray-500">
                累计 {stats.knowledge.total} 条故障处理经验
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}