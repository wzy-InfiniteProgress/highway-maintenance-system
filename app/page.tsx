'use client';

import { Card, Row, Col, Statistic } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  EyeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';

export default function HomePage() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">欢迎使用高速公路机电维护管理系统</h1>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="维护心得"
                value={3}
                prefix={<FileTextOutlined />}
                styles={{ content: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="用户数量"
                value={3}
                prefix={<UserOutlined />}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总浏览量"
                value={368}
                prefix={<EyeOutlined />}
                styles={{ content: { color: '#faad14' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="活跃用户"
                value={2}
                prefix={<TeamOutlined />}
                styles={{ content: { color: '#f5222d' } }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="mt-6" title="快速操作">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/posts"
              className="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <FileTextOutlined className="text-2xl text-blue-500 mr-3" />
                <div>
                  <h3 className="font-semibold">查看维护心得</h3>
                  <p className="text-gray-500 text-sm">浏览和搜索维护经验</p>
                </div>
              </div>
            </a>
            <a
              href="/posts/new"
              className="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <FileTextOutlined className="text-2xl text-green-500 mr-3" />
                <div>
                  <h3 className="font-semibold">创建维护心得</h3>
                  <p className="text-gray-500 text-sm">分享您的维护经验</p>
                </div>
              </div>
            </a>
            <a
              href="/users"
              className="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <UserOutlined className="text-2xl text-orange-500 mr-3" />
                <div>
                  <h3 className="font-semibold">用户管理</h3>
                  <p className="text-gray-500 text-sm">管理系统用户</p>
                </div>
              </div>
            </a>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}