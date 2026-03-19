/**
 * =====================================================
 * 维护心得列表页面
 * =====================================================
 *
 * 功能说明：
 * - 展示所有维护心得文章列表
 * - 支持按分类筛选和关键词搜索
 * - 支持分页浏览
 * - 支持创建新的心得文章
 *
 * 页面结构：
 * - 页面标题和创建按钮
 * - 筛选栏（搜索、分类筛选）
 * - 心得卡片列表（网格布局）
 * - 分页控件
 *
 * 数据来源：/api/posts
 *
 * @date 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Tag, Pagination, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

const { Search } = Input;
const { Option } = Select;

/**
 * 维护心得列表页面组件
 * @description 展示维护心得文章列表，支持搜索、筛选和分页
 */
export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [category, setCategory] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // 组件挂载时和分页/筛选变化时获取心得列表
  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [page, pageSize, category]);

  /**
   * 获取心得列表
   * @description 从 API 获取心得列表，支持分页、分类筛选和搜索
   */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (category) params.append('category', category);
      if (searchText) params.append('search', searchText);

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data.posts);
        setTotal(data.data.total);
      } else {
        message.error(data.error?.message || '获取帖子列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取分类列表
   */
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/posts/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  /**
   * 搜索处理
   * @description 重置页码并重新获取列表
   */
  const handleSearch = () => {
    setPage(1);
    fetchPosts();
  };

  /**
   * 分类筛选变化处理
   * @param value 选中的分类值
   */
  const handleCategoryChange = (value: string | undefined) => {
    setCategory(value);
    setPage(1);
  };

  /**
   * 分页变化处理
   * @param newPage 新页码
   * @param newPageSize 每页条数
   */
  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  /**
   * 解析标签 JSON 字符串
   * @param tagsString JSON 格式的标签字符串
   * @returns 标签数组
   */
  const getTags = (tagsString: string) => {
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  /**
   * 移除 HTML 标签获取纯文本
   * @param html HTML 字符串
   * @returns 纯文本内容
   */
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <MainLayout>
      <div>
        {/* 页面标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">维护心得</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/posts/new')}
          >
            创建心得
          </Button>
        </div>

        {/* 筛选栏 */}
        <Card className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索标题或内容"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="选择分类"
                value={category}
                onChange={handleCategoryChange}
                allowClear
                className="w-full"
              >
                <Option value="设备维护">设备维护</Option>
                <Option value="故障排除">故障排除</Option>
                <Option value="预防性维护">预防性维护</Option>
                <Option value="技术改进">技术改进</Option>
                <Option value="安全规范">安全规范</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* 加载状态或心得列表 */}
        {loading ? (
          <Card loading className="mb-6" />
        ) : (
          <Row gutter={[16, 16]}>
            {posts.map((post) => (
            <Col xs={24} sm={12} lg={8} key={post.id}>
              <Card
                hoverable
                className="h-full"
                onClick={() => router.push(`/posts/${post.id}`)}
              >
                {/* 标题 */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {post.title}
                </h3>
                {/* 内容摘要 */}
                <p className="text-gray-500 mb-4 line-clamp-3">
                  {stripHtml(post.content)}
                </p>
                {/* 标签 */}
                <div className="mb-3">
                  <Tag color="blue">{post.category}</Tag>
                  {getTags(post.tags).map((tag: string, index: number) => (
                    <Tag key={index} color="green">
                      {tag}
                    </Tag>
                  ))}
                </div>
                {/* 统计信息 */}
                <div className="flex justify-between text-sm text-gray-400">
                  <span>浏览: {post.views}</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </Card>
            </Col>
          ))}
          </Row>
        )}

        {/* 分页控件 */}
        <div className="mt-6 flex justify-center">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
          />
        </div>
      </div>
    </MainLayout>
  );
}