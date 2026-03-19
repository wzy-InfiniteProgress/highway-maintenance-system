/**
 * =====================================================
 * 创建维护心得页面
 * =====================================================
 *
 * 功能说明：
 * - 提供创建新的维护心得文章
 * - 支持富文本编辑器编写内容
 * - 支持选择分类和添加标签
 * - 支持设置文章公开/私有属性
 *
 * 页面结构：
 * - 返回按钮
 * - 创建心得表单卡片
 *   - 标题输入
 *   - 分类选择
 *   - 富文本内容编辑器
 *   - 标签管理
 *   - 公开/私有开关
 *   - 提交按钮
 *
 * 数据去向：POST /api/posts
 *
 * @date 2024
 */

'use client';

import { useState } from 'react';
import { Form, Input, Select, Switch, Button, message, Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import RichTextEditor from '@/components/RichTextEditor';

const { Option } = Select;

/**
 * 创建维护心得页面组件
 * @description 提供创建新的维护心得文章表单
 */
export default function CreatePostPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');

  /**
   * 表单提交处理
   * @param values 表单值对象
   */
  const onFinish = async (values: any) => {
    // 验证内容是否为空
    if (!content || content === '<p></p>') {
      message.error('请输入内容');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          content,
          tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('创建成功');
        router.push('/posts');
      } else {
        message.error(data.error?.message || '创建失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('Create post error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 添加标签
   */
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  /**
   * 移除标签
   * @param tagToRemove 要移除的标签
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <MainLayout>
      <div>
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>
        </div>

        <Card title="创建维护心得">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* 标题输入 */}
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="请输入标题" size="large" />
            </Form.Item>

            {/* 分类选择 */}
            <Form.Item
              label="分类"
              name="category"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类" size="large">
                <Option value="设备维护">设备维护</Option>
                <Option value="故障排除">故障排除</Option>
                <Option value="预防性维护">预防性维护</Option>
                <Option value="技术改进">技术改进</Option>
                <Option value="安全规范">安全规范</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            {/* 富文本内容编辑器 */}
            <Form.Item
              label="内容"
              rules={[{ required: true, message: '请输入内容' }]}
            >
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="请输入维护心得内容..."
              />
            </Form.Item>

            {/* 标签管理 */}
            <Form.Item label="标签">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onPressEnter={handleAddTag}
                    placeholder="输入标签后按回车添加"
                  />
                  <Button onClick={handleAddTag}>添加</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Form.Item>

            {/* 公开/私有开关 */}
            <Form.Item
              label="公开"
              name="isPublic"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch checkedChildren="公开" unCheckedChildren="私有" />
            </Form.Item>

            {/* 提交按钮 */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full"
              >
                创建
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}