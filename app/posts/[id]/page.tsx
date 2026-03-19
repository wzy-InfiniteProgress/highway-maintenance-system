/**
 * =====================================================
 * 维护心得详情页面
 * =====================================================
 *
 * 功能说明：
 * - 展示心得文章的详细内容
 * - 支持富文本 HTML 渲染
 * - 支持编辑和删除操作（仅作者和管理员）
 * - 自动增加浏览次数
 *
 * 页面结构：
 * - 返回按钮
 * - 文章详情卡片（标题、作者、日期、浏览量、分类、标签）
 * - 富文本内容区域
 * - 编辑/删除操作按钮（权限控制）
 *
 * 数据来源：/api/posts/[id]
 *
 * @date 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Tag, message, Space, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

/**
 * 维护心得详情页面组件
 * @description 展示心得文章详情，支持编辑和删除
 */
export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 组件挂载时获取文章详情和当前用户信息
  useEffect(() => {
    fetchPost();
    fetchCurrentUser();
  }, [params.id]);

  /**
   * 获取文章详情
   */
  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data.post);
      } else {
        message.error(data.error?.message || '获取帖子详情失败');
        router.push('/posts');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('Fetch post error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取当前登录用户信息
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data.user);
      }
    } catch (error) {
      console.error('Fetch current user error:', error);
    }
  };

  /**
   * 跳转到编辑页面
   */
  const handleEdit = () => {
    router.push(`/posts/${params.id}/edit`);
  };

  /**
   * 删除文章
   */
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇帖子吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/posts/${params.id}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (data.success) {
            message.success('删除成功');
            router.push('/posts');
          } else {
            message.error(data.error?.message || '删除失败');
          }
        } catch (error) {
          message.error('网络错误，请稍后重试');
          console.error('Delete post error:', error);
        }
      },
    });
  };

  // 判断当前用户是否有编辑/删除权限
  const canEdit = currentUser && (currentUser.id === post?.authorId || currentUser.role === 'admin');
  const canDelete = currentUser && (currentUser.id === post?.authorId || currentUser.role === 'admin');

  /**
   * 解析标签 JSON 字符串
   */
  const getTags = (tagsString: string) => {
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </MainLayout>
    );
  }

  // 文章不存在状态
  if (!post) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">帖子不存在</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回列表
          </Button>
        </div>

        <Card>
          {/* 文章标题和元信息 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <Space size="large" className="text-gray-500">
              <span className="flex items-center">
                <UserOutlined className="mr-1" />
                {post.authorName}
              </span>
              <span className="flex items-center">
                <CalendarOutlined className="mr-1" />
                {new Date(post.createdAt).toLocaleString('zh-CN')}
              </span>
              <span className="flex items-center">
                <EyeOutlined className="mr-1" />
                {post.views}
              </span>
            </Space>
          </div>

          {/* 分类和标签 */}
          <div className="mb-6">
            <Tag color="blue" className="mb-2">
              {post.category}
            </Tag>
            <div className="flex flex-wrap gap-2">
              {getTags(post.tags).map((tag: string, index: number) => (
                <Tag key={index} color="green">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>

          {/* 富文本内容区域 */}
          <div className="prose max-w-none mb-6">
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ') }}
            />
          </div>

          {/* 富文本内容样式 */}
          <style jsx global>{`
            .post-content a {
              color: #1890ff;
              text-decoration: underline;
            }
            .post-content a:hover {
              color: #40a9ff;
            }
            .post-content img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 1em 0;
            }
            .post-content h1 {
              font-size: 1.875rem;
              font-weight: bold;
              margin: 1em 0 0.5em;
            }
            .post-content h2 {
              font-size: 1.5rem;
              font-weight: bold;
              margin: 1em 0 0.5em;
            }
            .post-content h3 {
              font-size: 1.25rem;
              font-weight: bold;
              margin: 1em 0 0.5em;
            }
            .post-content ul, .post-content ol {
              padding-left: 1.5em;
              margin: 0.5em 0;
            }
            .post-content ul {
              list-style-type: disc;
            }
            .post-content ol {
              list-style-type: decimal;
            }
            .post-content blockquote {
              border-left: 3px solid #d9d9d9;
              padding-left: 1em;
              margin: 1em 0;
              color: #666;
            }
            .post-content pre {
              background: #f5f5f5;
              padding: 1em;
              border-radius: 4px;
              overflow-x: auto;
            }
            .post-content code {
              background: #f5f5f5;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: monospace;
            }
          `}</style>

          {/* 操作按钮区域（仅作者和管理员可见） */}
          {(canEdit || canDelete) && (
            <div className="border-t pt-6">
              <Space>
                {canEdit && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    编辑
                  </Button>
                )}
                {canDelete && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  >
                    删除
                  </Button>
                )}
              </Space>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}