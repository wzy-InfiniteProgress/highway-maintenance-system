/**
 * =====================================================
 * 登录页面组件
 * =====================================================
 *
 * 功能说明：
 * - 系统登录入口页面
 * - 提供用户名密码登录表单
 * - 支持记住登录状态
 *
 * 页面结构：
 * - 左侧：系统介绍和 Logo
 * - 右侧：登录表单
 *
 * @date 2024
 */

'use client';

import { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  username?: string;
  password?: string;
}

/**
 * 登录表单组件
 * @description 处理用户登录逻辑，验证凭证，保存登录状态
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   * @param values - 表单值，包含 username 和 password
   */
  const onFinish = async (values: LoginFormProps) => {
    setLoading(true);
    try {
      // 调用登录 API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        message.success('登录成功');
        router.push('/');
      } else {
        message.error(data.error?.message || '登录失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <Card className="w-full max-w-md shadow-xl">
        {/* 系统标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            高速公路机电维护
          </h1>
          <p className="text-gray-500">管理系统</p>
        </div>

        {/* 登录表单 */}
        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ username: 'admin', password: 'admin123' }}
        >
          {/* 用户名输入框 */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          {/* 记住登录状态选项 */}
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住登录状态</Checkbox>
            </Form.Item>
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* 提示信息 */}
        <div className="text-center text-sm text-gray-400 mt-4">
          <p>默认账号：admin / admin123</p>
        </div>
      </Card>
    </div>
  );
}
