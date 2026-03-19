/**
 * =====================================================
 * 登录表单组件
 * =====================================================
 *
 * 功能说明：
 * - 提供用户登录表单
 * - 验证用户凭证
 * - 登录成功后跳转到首页
 *
 * 页面结构：
 * - 系统标题区域
 * - 用户名输入框
 * - 密码输入框
 * - 登录按钮
 * - 测试账户提示信息
 *
 * 数据去向：POST /api/auth/login
 *
 * @date 2024
 */

'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { LoginRequest } from '@/types';

/**
 * 登录表单组件
 * @description 处理用户登录逻辑，验证凭证成功后跳转到首页
 */
export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   * @param values 表单值，包含 username 和 password
   */
  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      // 调用登录 API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Card
        title={
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600">高速公路机电维护管理系统</h1>
            <p className="text-gray-500 mt-2">请登录您的账户</p>
          </div>
        }
        className="w-full max-w-md shadow-lg"
      >
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          {/* 用户名输入框 */}
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="请输入密码"
            />
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* 测试账户提示信息 */}
        <div className="text-center text-gray-500 text-sm">
          <p>测试账户：</p>
          <p>管理员: admin / admin123</p>
          <p>维护人员: maintainer / maintainer123</p>
          <p>查看者: viewer / viewer123</p>
        </div>
      </Card>
    </div>
  );
}