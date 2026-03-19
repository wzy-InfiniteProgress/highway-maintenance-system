/**
 * =====================================================
 * 用户管理页面
 * =====================================================
 *
 * 功能说明：
 * - 展示系统所有用户列表
 * - 支持用户的增删改查操作
 * - 支持用户角色管理（管理员、维护人员、查看者）
 * - 支持用户状态管理（激活/禁用）
 *
 * 页面结构：
 * - 页面标题和创建用户按钮
 * - 用户列表表格
 * - 创建/编辑用户弹窗
 *
 * 数据来源：/api/users
 *
 * @date 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Space, Tag, Switch, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

const { Option } = Select;
const { TextArea } = Input;

// 角色映射配置
const roleMap: Record<string, { text: string; color: string }> = {
  admin: { text: '管理员', color: 'red' },
  maintainer: { text: '维护人员', color: 'blue' },
  viewer: { text: '查看者', color: 'green' },
};

/**
 * 用户管理页面组件
 * @description 提供用户的增删改查、角色和状态管理等功能
 */
export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formInstance] = Form.useForm();

  // 组件挂载时获取用户列表
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * 获取用户列表
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
      } else {
        message.error(data.error?.message || '获取用户列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开发送创建用户弹窗
   */
  const handleCreate = () => {
    setEditingUser(null);
    formInstance.resetFields();
    setIsModalOpen(true);
  };

  /**
   * 打开编辑用户弹窗
   * @param user 要编辑的用户对象
   */
  const handleEdit = (user: any) => {
    setEditingUser(user);
    formInstance.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  /**
   * 删除用户
   * @param user 要删除的用户对象
   */
  const handleDelete = (user: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户"${user.username}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (data.success) {
            message.success('删除成功');
            fetchUsers();
          } else {
            message.error(data.error?.message || '删除失败');
          }
        } catch (error) {
          message.error('网络错误，请稍后重试');
          console.error('Delete user error:', error);
        }
      },
    });
  };

  /**
   * 弹窗确认处理
   * @description 处理创建或更新用户
   */
  const handleModalOk = async () => {
    try {
      const values = await formInstance.validateFields();

      if (editingUser) {
        // 更新已有用户
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (data.success) {
          message.success('更新成功');
          setIsModalOpen(false);
          fetchUsers();
        } else {
          message.error(data.error?.message || '更新失败');
        }
      } else {
        // 创建新用户
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password || 'password123',
            role: values.role,
            department: values.department,
          }),
        });

        const data = await response.json();

        if (data.success) {
          message.success('创建成功');
          setIsModalOpen(false);
          fetchUsers();
        } else {
          message.error(data.error?.message || '创建失败');
        }
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('Save user error:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const { text, color } = roleMap[role] || { text: role, color: 'default' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (department: string | null) => department || '-',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '激活' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div>
        {/* 页面标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">用户管理</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建用户
          </Button>
        </div>

        {/* 用户列表表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />

        {/* 创建/编辑用户弹窗 */}
        <Modal
          title={editingUser ? '编辑用户' : '创建用户'}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={() => setIsModalOpen(false)}
          width={600}
        >
          <Form form={formInstance} layout="vertical">
            {/* 用户名输入 */}
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" disabled={!!editingUser} />
            </Form.Item>

            {/* 邮箱输入 */}
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            {/* 密码输入（仅创建时显示） */}
            {!editingUser && (
              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            )}

            {/* 角色选择 */}
            <Form.Item
              label="角色"
              name="role"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择角色">
                <Option value="admin">管理员</Option>
                <Option value="maintainer">维护人员</Option>
                <Option value="viewer">查看者</Option>
              </Select>
            </Form.Item>

            {/* 部门输入 */}
            <Form.Item label="部门" name="department">
              <Input placeholder="请输入部门（可选）" />
            </Form.Item>

            {/* 状态开关 */}
            <Form.Item
              label="状态"
              name="isActive"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="激活" unCheckedChildren="禁用" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}