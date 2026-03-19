/**
 * =====================================================
 * 故障知识库管理页面
 * =====================================================
 *
 * 功能说明：
 * - 展示和管理故障知识库条目
 * - 支持按分类筛选和关键词搜索
 * - 支持富文本编辑（故障现象、原因、解决方案）
 * - 支持知识的增删改查和批量操作
 *
 * 页面结构：
 * - 页面标题和新增按钮
 * - 筛选栏（搜索、分类筛选）
 * - 知识库列表表格
 * - 新增/编辑知识库弹窗（带富文本编辑器）
 * - 知识库详情弹窗
 *
 * 数据来源：/api/knowledge-base
 *
 * @date 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Select, Space, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, BookOutlined, EyeOutlined } from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';
import RichTextEditor from '@/components/RichTextEditor';

const { Option } = Select;

// 知识库分类选项
const categoryOptions = [
  '故障排除',
  '预防性维护',
  '操作规程',
  '技术文档',
  '经验分享'
];

/**
 * 故障知识库管理页面组件
 * @description 提供故障知识库的增删改查、分类管理等功能
 */
export default function KnowledgeBasePage() {
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<any>(null);
  const [viewingKnowledge, setViewingKnowledge] = useState<any>(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<string[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [symptoms, setSymptoms] = useState('');
  const [causes, setCauses] = useState('');
  const [solutions, setSolutions] = useState('');

  // 组件挂载时获取知识库列表和用户列表
  useEffect(() => {
    fetchKnowledge();
    fetchUsers();
  }, [categoryFilter]);

  /**
   * 获取知识库列表
   * @description 从 API 获取知识库列表，支持分类筛选和搜索
   */
  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (searchText) params.append('search', searchText);

      const response = await fetch(`/api/knowledge-base?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setKnowledgeList(data.data.list);
        setCategories(data.data.categories);
      } else {
        message.error('获取知识库列表失败');
      }
    } catch (error) {
      console.error('Fetch knowledge error:', error);
      message.error('获取知识库列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取用户列表
   * @description 用于选择作者
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
   * 搜索处理
   */
  const handleSearch = () => {
    fetchKnowledge();
  };

  /**
   * 查看知识库详情
   * @param knowledge 知识库条目
   */
  const viewDetail = (knowledge: any) => {
    setViewingKnowledge(knowledge);
    setDetailModalVisible(true);
  };

  /**
   * 打开新增/编辑弹窗
   * @param knowledge 可选的知识库对象，用于编辑模式
   */
  const openModal = (knowledge?: any) => {
    if (knowledge) {
      setEditingKnowledge(knowledge);
      form.setFieldsValue({
        title: knowledge.title,
        category: knowledge.category,
        authorId: knowledge.authorId,
        tags: knowledge.tagsArray || []
      });
      setSymptoms(knowledge.symptoms || '');
      setCauses(knowledge.causes || '');
      setSolutions(knowledge.solutions || '');
    } else {
      setEditingKnowledge(null);
      form.resetFields();
      setSymptoms('');
      setCauses('');
      setSolutions('');
    }
    setModalVisible(true);
  };

  /**
   * 关闭弹窗
   */
  const closeModal = () => {
    setModalVisible(false);
    setEditingKnowledge(null);
    form.resetFields();
    setSymptoms('');
    setCauses('');
    setSolutions('');
  };

  /**
   * 提交表单
   * @description 创建或更新知识库条目
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const body: any = {
        ...values,
        symptoms,
        causes,
        solutions
      };

      const url = editingKnowledge
        ? `/api/knowledge-base/${editingKnowledge.id}`
        : '/api/knowledge-base';
      const method = editingKnowledge ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        message.success(editingKnowledge ? '知识库更新成功' : '知识库创建成功');
        closeModal();
        fetchKnowledge();
      } else {
        message.error(data.error?.message || '操作失败');
      }
    } catch (error) {
      console.error('Submit form error:', error);
    }
  };

  /**
   * 删除知识库条目
   * @param id 知识库ID
   */
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge-base/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        message.success('知识库删除成功');
        fetchKnowledge();
      } else {
        message.error(data.error?.message || '删除失败');
      }
    } catch (error) {
      console.error('Delete knowledge error:', error);
      message.error('删除失败');
    }
  };

  /**
   * 批量删除知识库条目
   */
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的知识库条目');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个知识库条目吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          let successCount = 0;
          for (const id of selectedRowKeys) {
            const response = await fetch(`/api/knowledge-base/${String(id)}`, { method: 'DELETE' });
            if (response.ok) successCount++;
          }
          message.success(`成功删除 ${successCount} 个知识库条目`);
          setSelectedRowKeys([]);
          fetchKnowledge();
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: true,
      render: (text: string) => (
        <Space>
          <BookOutlined className="text-purple-500" />
          <span className="font-medium">{text}</span>
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: '作者',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 100
    },
    {
      title: '标签',
      dataIndex: 'tagsArray',
      key: 'tagsArray',
      width: 150,
      render: (tags: string[]) => (
        <>
          {tags?.slice(0, 2).map((tag, index) => (
            <Tag key={index} color="green">{tag}</Tag>
          ))}
          {tags?.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => viewDetail(record)} />
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
          <h1 className="text-2xl font-bold">故障知识库</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增知识
          </Button>
        </div>

        {/* 筛选栏 */}
        <Card className="mb-6">
          <Space wrap>
            <Input
              placeholder="搜索标题、内容、标签..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
            />
            <Select
              placeholder="筛选分类"
              allowClear
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
            >
              {categoryOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={() => {
              setSearchText('');
              setCategoryFilter(undefined);
              fetchKnowledge();
            }}>
              重置
            </Button>
          </Space>
        </Card>

        {/* 知识库列表 */}
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
            dataSource={knowledgeList}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条知识`
            }}
          />
        </Card>
      </div>

      {/* 新增/编辑知识库弹窗 */}
      <Modal
        title={editingKnowledge ? '编辑知识库' : '新增知识库'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        width={900}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入知识库标题" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                {categoryOptions.map(option => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="authorId"
              label="作者"
              rules={[{ required: true, message: '请选择作者' }]}
            >
              <Select placeholder="请选择作者" showSearch>
                {userList.map(u => (
                  <Option key={u.id} value={u.id}>
                    {u.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* 故障现象富文本编辑器 */}
          <Form.Item label="故障现象">
            <RichTextEditor
              content={symptoms}
              onChange={setSymptoms}
              placeholder="请描述故障现象（选填）"
            />
          </Form.Item>

          {/* 故障原因富文本编辑器 */}
          <Form.Item label="故障原因">
            <RichTextEditor
              content={causes}
              onChange={setCauses}
              placeholder="请描述故障原因（选填）"
            />
          </Form.Item>

          {/* 解决方案富文本编辑器 */}
          <Form.Item label="解决方案">
            <RichTextEditor
              content={solutions}
              onChange={setSolutions}
              placeholder="请描述解决方案（选填）"
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="输入标签后按回车添加" style={{ width: '100%' }}>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 知识库详情弹窗 */}
      <Modal
        title="知识库详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
            setDetailModalVisible(false);
            openModal(viewingKnowledge);
          }}>
            编辑
          </Button>
        ]}
        width={800}
      >
        {viewingKnowledge && (
          <div className="py-4">
            {/* 标题 */}
            <h2 className="text-xl font-bold mb-4">{viewingKnowledge.title}</h2>

            {/* 标签区域 */}
            <div className="mb-4">
              <Space wrap>
                <Tag color="blue">{viewingKnowledge.category}</Tag>
                <Tag color="green">作者：{viewingKnowledge.authorName}</Tag>
                {viewingKnowledge.tagsArray?.map((tag: string, index: number) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </Space>
            </div>

            {/* 故障现象 */}
            {viewingKnowledge.symptoms && viewingKnowledge.symptoms !== '<p></p>' && (
              <div className="mb-4">
                <h3 className="font-bold text-orange-600 mb-2">故障现象</h3>
                <div
                  className="knowledge-content"
                  dangerouslySetInnerHTML={{ __html: viewingKnowledge.symptoms }}
                />
              </div>
            )}

            {/* 故障原因 */}
            {viewingKnowledge.causes && viewingKnowledge.causes !== '<p></p>' && (
              <div className="mb-4">
                <h3 className="font-bold text-red-600 mb-2">故障原因</h3>
                <div
                  className="knowledge-content"
                  dangerouslySetInnerHTML={{ __html: viewingKnowledge.causes }}
                />
              </div>
            )}

            {/* 解决方案 */}
            {viewingKnowledge.solutions && viewingKnowledge.solutions !== '<p></p>' && (
              <div className="mb-4">
                <h3 className="font-bold text-green-600 mb-2">解决方案</h3>
                <div
                  className="knowledge-content"
                  dangerouslySetInnerHTML={{ __html: viewingKnowledge.solutions }}
                />
              </div>
            )}
          </div>
        )}

        {/* 富文本内容样式 */}
        <style jsx global>{`
          .knowledge-content a {
            color: #1890ff;
            text-decoration: underline;
          }
          .knowledge-content a:hover {
            color: #40a9ff;
          }
          .knowledge-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 0.5em 0;
          }
          .knowledge-content h1 {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0.5em 0;
          }
          .knowledge-content h2 {
            font-size: 1.25rem;
            font-weight: bold;
            margin: 0.5em 0;
          }
          .knowledge-content h3 {
            font-size: 1.1rem;
            font-weight: bold;
            margin: 0.5em 0;
          }
          .knowledge-content ul, .knowledge-content ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          .knowledge-content ul {
            list-style-type: disc;
          }
          .knowledge-content ol {
            list-style-type: decimal;
          }
          .knowledge-content blockquote {
            border-left: 3px solid #d9d9d9;
            padding-left: 1em;
            margin: 0.5em 0;
            color: #666;
          }
          .knowledge-content pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
          }
          .knowledge-content code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
          }
        `}</style>
      </Modal>
    </MainLayout>
  );
}