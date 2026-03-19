/**
 * =====================================================
 * 设备档案管理页面
 * =====================================================
 *
 * 功能说明：
 * - 展示和管理所有设备档案信息
 * - 支持设备的增删改查操作
 * - 支持设备状态筛选和搜索
 * - 支持设备数据导入导出
 *
 * 页面结构：
 * - 页面标题和操作按钮（导出、导入、新增）
 * - 状态统计卡片（可点击筛选）
 * - 筛选栏（搜索、状态筛选）
 * - 设备列表表格
 * - 新增/编辑设备弹窗
 * - 导入设备弹窗
 *
 * 数据来源：/api/equipment
 *
 * @date 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Select, Space, Modal, Form, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ToolOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';

const { Option } = Select;
const { Dragger } = Upload;

// 设备状态映射配置
const statusMap: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '正常' },
  maintenance: { color: 'orange', label: '维护中' },
  fault: { color: 'red', label: '故障' },
  retired: { color: 'gray', label: '已报废' }
};

// 设备状态选项
const statusOptions = [
  { value: 'active', label: '正常' },
  { value: 'maintenance', label: '维护中' },
  { value: 'fault', label: '故障' },
  { value: 'retired', label: '已报废' }
];

// 部门选项
const departmentOptions = [
  '收费系统', '监控系统', '通信系统', '照明系统',
  '气象监测', '信息发布', '超限检测'
];

/**
 * 设备档案管理页面组件
 * @description 提供设备档案的增删改查、导入导出等功能
 */
export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [form] = Form.useForm();
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 状态筛选变化时重新加载设备列表
  useEffect(() => {
    fetchEquipment();
  }, [statusFilter]);

  /**
   * 获取设备列表
   * @description 从 API 获取设备列表，支持状态筛选和搜索
   */
  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchText) params.append('search', searchText);

      const response = await fetch(`/api/equipment?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEquipmentList(data.data.list);
        setStatusCounts(data.data.statusCounts);
      } else {
        message.error('获取设备列表失败');
      }
    } catch (error) {
      console.error('Fetch equipment error:', error);
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 搜索处理
   * @description 根据搜索条件重新获取设备列表
   */
  const handleSearch = () => {
    fetchEquipment();
  };

  /**
   * 导出设备数据
   * @description 将设备列表导出为 CSV 文件
   */
  const handleExport = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    const url = `/api/equipment/export${params.toString() ? '?' + params.toString() : ''}`;

    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `设备列表_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        message.success('导出成功');
      })
      .catch(() => {
        message.error('导出失败');
      });
  };

  /**
   * 打开新增/编辑弹窗
   * @param equipment 可选的设备对象，用于编辑模式
   */
  const openModal = (equipment?: any) => {
    if (equipment) {
      setEditingEquipment(equipment);
      form.setFieldsValue(equipment);
    } else {
      setEditingEquipment(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  /**
   * 关闭弹窗
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingEquipment(null);
    form.resetFields();
  };

  /**
   * 提交表单
   * @description 创建或更新设备信息
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editingEquipment
        ? `/api/equipment/${editingEquipment.id}`
        : '/api/equipment';
      const method = editingEquipment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (data.success) {
        message.success(editingEquipment ? '设备更新成功' : '设备创建成功');
        closeModal();
        fetchEquipment();
      } else {
        message.error(data.error?.message || '操作失败');
      }
    } catch (error) {
      console.error('Submit form error:', error);
    }
  };

  /**
   * 删除设备
   * @param id 设备ID
   */
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        message.success('设备删除成功');
        fetchEquipment();
      } else {
        message.error(data.error?.message || '删除失败');
      }
    } catch (error) {
      console.error('Delete equipment error:', error);
      message.error('删除失败');
    }
  };

  /**
   * 批量删除设备
   */
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的设备');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个设备吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          let successCount = 0;
          let failCount = 0;

          for (const id of selectedRowKeys) {
            const response = await fetch(`/api/equipment/${String(id)}`, { method: 'DELETE' });
            if (response.ok) {
              successCount++;
            } else {
              failCount++;
            }
          }

          if (failCount === 0) {
            message.success(`成功删除 ${successCount} 个设备`);
          } else {
            message.warning(`成功删除 ${successCount} 个，失败 ${failCount} 个`);
          }

          setSelectedRowKeys([]);
          fetchEquipment();
        } catch (error) {
          console.error('Batch delete error:', error);
          message.error('批量删除失败');
        }
      }
    });
  };

  /**
   * 导入设备
   * @description 解析 CSV 文件并批量创建设备
   * @param file 上传的 CSV 文件
   */
  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        message.error('CSV文件内容为空或格式不正确');
        return false;
      }

      // 中文状态到英文状态的映射
      const statusMapImport: Record<string, string> = {
        '正常': 'active',
        '维护中': 'maintenance',
        '故障': 'fault',
        '已报废': 'retired'
      };

      // 解析 CSV 数据（跳过表头）
      const equipmentDataList: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
        if (values.length >= 6 && values[0]) {
          // 将中文状态转换为英文状态
          const rawStatus = values[6] || 'active';
          const status = statusMapImport[rawStatus] || rawStatus;

          equipmentDataList.push({
            name: values[0],
            model: values[1],
            manufacturer: values[2],
            installDate: values[3],
            location: values[4],
            department: values[5],
            status: status,
            ip: values[7] || null
          });
        }
      }

      if (equipmentDataList.length === 0) {
        message.error('没有找到有效的设备数据');
        return false;
      }

      // 调用导入 API
      const response = await fetch('/api/equipment/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentList: equipmentDataList })
      });

      const data = await response.json();

      if (data.success) {
        message.success(data.message);
        setImportModalVisible(false);
        fetchEquipment();
      } else {
        message.error(data.error?.message || '导入失败');
      }
    } catch (error) {
      console.error('Import equipment error:', error);
      message.error('导入失败');
    }

    return false;
  };

  /**
   * 下载导入模板
   */
  const downloadTemplate = () => {
    const template = '设备名称,型号,制造商,安装日期,安装位置,所属部门,状态,IP地址\nETC车道控制器,ETC-2020,华为,2020-05-15,收费站A,收费系统,正常,192.168.1.100';
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '设备导入模板.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  };

  // 表格列定义
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      ellipsis: true,
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      )
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 80,
      ellipsis: true
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 80,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.label || status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="确定删除?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
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
          <h1 className="text-2xl font-bold">设备档案管理</h1>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={equipmentList.length === 0}
            >
              导出表格
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
              导入表格
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增设备
            </Button>
          </Space>
        </div>

        {/* 状态统计卡片区域 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

        {/* 筛选栏区域 */}
        <Card className="mb-6">
          <Space wrap>
            <Input
              placeholder="搜索设备名称、型号、位置..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
            />
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
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={() => {
              setSearchText('');
              setStatusFilter(undefined);
              fetchEquipment();
            }}>
              重置
            </Button>
          </Space>
        </Card>

        {/* 设备列表区域 */}
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
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                >
                  批量删除
                </Button>
              </Space>
            </div>
          )}
          <Table
            columns={columns}
            dataSource={equipmentList}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条设备`
            }}
          />
        </Card>
      </div>

      {/* 新增/编辑设备弹窗 */}
      <Modal
        title={editingEquipment ? '编辑设备' : '新增设备'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="model"
              label="型号"
              rules={[{ required: true, message: '请输入型号' }]}
            >
              <Input placeholder="请输入型号" />
            </Form.Item>

            <Form.Item
              name="manufacturer"
              label="制造商"
              rules={[{ required: true, message: '请输入制造商' }]}
            >
              <Input placeholder="请输入制造商" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="installDate"
              label="安装日期"
              rules={[{ required: true, message: '请选择安装日期' }]}
            >
              <Input type="date" placeholder="请选择安装日期" />
            </Form.Item>

            <Form.Item
              name="ip"
              label="IP地址"
            >
              <Input placeholder="请输入IP地址（选填）" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="status"
              label="状态"
              initialValue="active"
            >
              <Select>
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="department"
              label="所属部门"
              rules={[{ required: true, message: '请选择所属部门' }]}
            >
              <Select placeholder="请选择所属部门">
                {departmentOptions.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="location"
            label="安装位置"
            rules={[{ required: true, message: '请输入安装位置' }]}
          >
            <Input placeholder="请输入安装位置，如：K100+500" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入设备弹窗 */}
      <Modal
        title="导入设备数据"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="py-4">
          <div className="mb-4">
            <Button onClick={downloadTemplate} icon={<DownloadOutlined />}>
              下载导入模板
            </Button>
          </div>

          <Dragger
            accept=".csv"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <p className="text-lg mb-2">
              <UploadOutlined />
            </p>
            <p className="text-gray-600">点击或拖拽CSV文件到此处上传</p>
            <p className="text-gray-400 text-sm">请使用提供的模板格式进行导入</p>
          </Dragger>

          <div className="mt-4 text-sm text-gray-500">
            <p>导入说明：</p>
            <ul className="list-disc list-inside">
              <li>请先下载导入模板，按照模板格式填写数据</li>
              <li>必填字段：设备名称、型号、制造商、安装日期、安装位置、所属部门</li>
              <li>状态字段：正常、维护中、故障、已报废（使用中文）</li>
              <li>IP地址为选填</li>
            </ul>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}