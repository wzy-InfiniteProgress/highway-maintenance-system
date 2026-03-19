/**
 * =====================================================
 * 维护计划管理页面
 * =====================================================
 *
 * 功能说明：
 * - 展示和管理维护计划
 * - 支持按状态筛选
 * - 支持计划的增删改查操作
 * - 支持关联设备和负责人
 *
 * 页面结构：
 * - 页面标题和新增按钮
 * - 状态统计卡片（可点击筛选）
 * - 筛选栏（状态筛选）
 * - 维护计划列表表格
 * - 新增/编辑计划弹窗
 *
 * 数据来源：/api/maintenance-plan
 *
 * @date 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Select, Space, Modal, Form, message, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 计划状态映射配置
const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待执行' },
  in_progress: { color: 'blue', label: '执行中' },
  completed: { color: 'green', label: '已完成' }
};

// 计划状态选项
const statusOptions = [
  { value: 'pending', label: '待执行' },
  { value: 'in_progress', label: '执行中' },
  { value: 'completed', label: '已完成' }
];

// 计划类型中文映射
const scheduleTypeMap: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
  quarterly: '每季度',
  yearly: '每年'
};

// 计划类型选项
const scheduleTypeOptions = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'quarterly', label: '每季度' },
  { value: 'yearly', label: '每年' }
];

/**
 * 维护计划管理页面组件
 * @description 提供维护计划的增删改查、状态管理等功能
 */
export default function MaintenancePlanPage() {
  const [planList, setPlanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form] = Form.useForm();
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 组件挂载时获取计划列表、设备列表、用户列表
  useEffect(() => {
    fetchPlans();
    fetchEquipment();
    fetchUsers();
  }, [statusFilter]);

  /**
   * 获取维护计划列表
   * @description 从 API 获取维护计划列表，支持状态筛选
   */
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/maintenance-plan?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPlanList(data.data.list);
        setStatusCounts(data.data.statusCounts);
      } else {
        message.error('获取维护计划列表失败');
      }
    } catch (error) {
      console.error('Fetch plans error:', error);
      message.error('获取维护计划列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取设备列表
   * @description 用于关联设备下拉选择
   */
  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      const data = await response.json();
      if (data.success) {
        setEquipmentList(data.data.list);
      }
    } catch (error) {
      console.error('Fetch equipment error:', error);
    }
  };

  /**
   * 获取用户列表
   * @description 用于负责人下拉选择
   */
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUserList(data.data.users || []);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  /**
   * 打开新增/编辑弹窗
   * @param plan 可选的维护计划对象，用于编辑模式
   */
  const openModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      form.setFieldsValue({
        ...plan,
        nextMaintenanceDate: plan.nextMaintenanceDate
      });
    } else {
      setEditingPlan(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  /**
   * 关闭弹窗
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingPlan(null);
    form.resetFields();
  };

  /**
   * 提交表单
   * @description 创建或更新维护计划
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editingPlan
        ? `/api/maintenance-plan/${editingPlan.id}`
        : '/api/maintenance-plan';
      const method = editingPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (data.success) {
        message.success(editingPlan ? '维护计划更新成功' : '维护计划创建成功');
        closeModal();
        fetchPlans();
      } else {
        message.error(data.error?.message || '操作失败');
      }
    } catch (error) {
      console.error('Submit form error:', error);
    }
  };

  /**
   * 删除维护计划
   * @param id 计划ID
   */
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/maintenance-plan/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        message.success('维护计划删除成功');
        fetchPlans();
      } else {
        message.error(data.error?.message || '删除失败');
      }
    } catch (error) {
      console.error('Delete plan error:', error);
      message.error('删除失败');
    }
  };

  /**
   * 批量删除维护计划
   */
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的维护计划');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个维护计划吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          let successCount = 0;
          for (const id of selectedRowKeys) {
            const response = await fetch(`/api/maintenance-plan/${String(id)}`, { method: 'DELETE' });
            if (response.ok) successCount++;
          }
          message.success(`成功删除 ${successCount} 个维护计划`);
          setSelectedRowKeys([]);
          fetchPlans();
        } catch (error) {
          message.error('批量删除失败');
        }
      }
    });
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  };

  // 表格列定义
  const columns = [
    {
      title: '计划名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Space>
          <CalendarOutlined className="text-blue-500" />
          <span className="font-medium">{text}</span>
        </Space>
      )
    },
    {
      title: '关联设备',
      dataIndex: 'equipmentName',
      key: 'equipmentName'
    },
    {
      title: '计划类型',
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      render: (type: string) => scheduleTypeMap[type] || type
    },
    {
      title: '下次维护日期',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate'
    },
    {
      title: '负责人',
      dataIndex: 'assigneeName',
      key: 'assigneeName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.label || status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该维护计划吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
      <div>
        {/* 页面标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">维护计划管理</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增计划
          </Button>
        </div>

        {/* 状态统计卡片区域 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statusOptions.map(option => (
            <Card
              key={option.value}
              size="small"
              className={`cursor-pointer transition-all ${
                statusFilter === option.value ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setStatusFilter(
                statusFilter === option.value ? undefined : option.value
              )}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {statusCounts[option.value] || 0}
                </div>
                <div className="text-gray-500">{option.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* 筛选栏 */}
        <Card className="mb-6">
          <Space wrap>
            <Select
              placeholder="筛选状态"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Button onClick={() => {
              setStatusFilter(undefined);
              fetchPlans();
            }}>
              重置
            </Button>
          </Space>
        </Card>

        {/* 维护计划列表 */}
        <Card>
          {/* 批量操作栏 */}
          {selectedRowKeys.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded">
              <span className="text-blue-600">
                已选择 {selectedRowKeys.length} 项
              </span>
              <Space>
                <Button size="small" onClick={() => setSelectedRowKeys([])}>
                  取消选择
                </Button>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                  批量删除
                </Button>
              </Space>
            </div>
          )}
          <Table
            columns={columns}
            dataSource={planList}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条计划`
            }}
          />
        </Card>
      </div>

      {/* 新增/编辑维护计划弹窗 */}
      <Modal
        title={editingPlan ? '编辑维护计划' : '新增维护计划'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="计划名称"
            rules={[{ required: true, message: '请输入计划名称' }]}
          >
            <Input placeholder="请输入计划名称，如：ETC车道月度维护" />
          </Form.Item>

          <Form.Item
            name="equipmentId"
            label="关联设备"
            rules={[{ required: true, message: '请选择关联设备' }]}
          >
            <Select placeholder="请选择关联设备" showSearch>
              {equipmentList.map(e => (
                <Option key={e.id} value={e.id}>
                  {e.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="scheduleType"
              label="计划类型"
              rules={[{ required: true, message: '请选择计划类型' }]}
            >
              <Select placeholder="请选择计划类型">
                {scheduleTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="nextMaintenanceDate"
              label="下次维护日期"
              rules={[{ required: true, message: '请选择下次维护日期' }]}
            >
              <Input type="date" placeholder="请选择日期" />
            </Form.Item>
          </div>

          <Form.Item
            name="assigneeId"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人" showSearch>
              {userList.map(u => (
                <Option key={u.id} value={u.id}>
                  {u.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue="pending">
            <Select>
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入计划描述（选填）" />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}