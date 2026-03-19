/**
 * =====================================================
 * 富文本编辑器组件
 * =====================================================
 *
 * 功能说明：
 * - 基于 TipTap 实现的富文本编辑器
 * - 支持加粗、斜体、删除线等文本格式
 * - 支持标题（H1、H2、H3）
 * - 支持有序列表、无序列表、引用块
 * - 支持插入链接和图片
 * - 支持拖拽和粘贴图片
 * - 支持撤销/重做操作
 *
 * 页面结构：
 * - 工具栏（格式按钮、插入按钮、操作按钮）
 * - 编辑区域
 * - 提示信息
 * - 插入链接弹窗
 * - 插入图片弹窗
 *
 * 使用方式：
 * <RichTextEditor
 *   content={htmlContent}
 *   onChange={setContent}
 *   placeholder="请输入内容..."
 * />
 *
 * @date 2024
 */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useState, useCallback } from 'react';
import { Space, Button, Tooltip, Modal, Input, message, Alert } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  UndoOutlined,
  RedoOutlined,
  MinusOutlined,
} from '@ant-design/icons';

/**
 * 富文本编辑器属性接口
 */
interface RichTextEditorProps {
  /** 富文本 HTML 内容 */
  content: string;
  /** 内容变化回调函数 */
  onChange: (content: string) => void;
  /** 占位提示文本 */
  placeholder?: string;
}

/**
 * 富文本编辑器组件
 * @description 基于 TipTap 的富文本编辑器，支持丰富的文本格式和媒体插入
 */
export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // 初始化 TipTap 编辑器
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[200px] p-4',
      },
      // 处理拖拽图片
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length && editor) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              editor.chain().focus().setImage({ src: base64 }).run();
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      // 处理粘贴图片
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items && editor) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const base64 = e.target?.result as string;
                  editor.chain().focus().setImage({ src: base64 }).run();
                };
                reader.readAsDataURL(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  // 同步外部内容变化
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // 渲染前检查
  if (!editor) {
    return null;
  }

  /**
   * 插入链接处理
   */
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      message.error('请输入链接地址');
      return;
    }

    // 自动添加 https:// 前缀
    let fullUrl = linkUrl.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('mailto:')) {
      fullUrl = 'https://' + fullUrl;
    }

    const hasSelection = !editor.state.selection.empty;

    if (hasSelection) {
      // 为选中文本添加链接
      editor.chain().focus().setLink({ href: fullUrl }).run();
    } else {
      // 插入新的链接
      if (linkText.trim()) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${fullUrl}">${linkText}</a>`)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${fullUrl}">${linkUrl}</a>`)
          .run();
      }
    }

    setLinkText('');
    setLinkUrl('');
    setLinkModalVisible(false);
    message.success('链接已插入');
  };

  /**
   * 插入图片处理
   */
  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      message.error('请输入图片地址');
      return;
    }
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setImageModalVisible(false);
    message.success('图片已插入');
  };

  /**
   * 打开链接弹窗
   * @description 获取选中文本并填充到弹窗
   */
  const openLinkModal = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    setLinkText(selectedText);

    const { href } = editor.getAttributes('link');
    setLinkUrl(href || '');

    setLinkModalVisible(true);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <Space wrap>
          {/* 加粗按钮 */}
          <Tooltip title="加粗 (Ctrl+B)">
            <Button
              size="small"
              icon={<BoldOutlined />}
              type={editor.isActive('bold') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>
          {/* 斜体按钮 */}
          <Tooltip title="斜体 (Ctrl+I)">
            <Button
              size="small"
              icon={<ItalicOutlined />}
              type={editor.isActive('italic') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>
          {/* 删除线按钮 */}
          <Tooltip title="删除线">
            <Button
              size="small"
              icon={<StrikethroughOutlined />}
              type={editor.isActive('strike') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
          </Tooltip>
          {/* 标题1按钮 */}
          <Tooltip title="标题1">
            <Button
              size="small"
              type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              H1
            </Button>
          </Tooltip>
          {/* 标题2按钮 */}
          <Tooltip title="标题2">
            <Button
              size="small"
              type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </Button>
          </Tooltip>
          {/* 标题3按钮 */}
          <Tooltip title="标题3">
            <Button
              size="small"
              type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </Button>
          </Tooltip>
        </Space>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Space wrap>
          {/* 有序列表按钮 */}
          <Tooltip title="有序列表">
            <Button
              size="small"
              icon={<OrderedListOutlined />}
              type={editor.isActive('orderedList') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </Tooltip>
          {/* 无序列表按钮 */}
          <Tooltip title="无序列表">
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              type={editor.isActive('bulletList') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </Tooltip>
          {/* 引用块按钮 */}
          <Tooltip title="引用块">
            <Button
              size="small"
              icon={<MinusOutlined />}
              type={editor.isActive('blockquote') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
          </Tooltip>
        </Space>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Space wrap>
          {/* 插入链接按钮 */}
          <Tooltip title="插入链接（选中文字后点击）">
            <Button
              size="small"
              icon={<LinkOutlined />}
              type={editor.isActive('link') ? 'primary' : 'default'}
              onClick={openLinkModal}
            />
          </Tooltip>
          {/* 插入图片按钮 */}
          <Tooltip title="插入图片">
            <Button
              size="small"
              icon={<PictureOutlined />}
              onClick={() => {
                setImageUrl('');
                setImageModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Space wrap>
          {/* 撤销按钮 */}
          <Tooltip title="撤销 (Ctrl+Z)">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            />
          </Tooltip>
          {/* 重做按钮 */}
          <Tooltip title="重做 (Ctrl+Y)">
            <Button
              size="small"
              icon={<RedoOutlined />}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} />

      {/* 底部提示信息 */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
        💡 提示：可以直接粘贴图片（Ctrl+V），或拖拽图片到编辑器中
      </div>

      {/* 编辑器内容样式 */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 200px;
          padding: 16px;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #d9d9d9;
          padding-left: 1em;
          margin: 1em 0;
          color: #666;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 0.5em 0;
          border-radius: 4px;
          cursor: pointer;
        }
        .ProseMirror img.editor-image {
          max-width: 100%;
        }
        .ProseMirror a {
          color: #1890ff;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: #40a9ff;
        }
        .ProseMirror code {
          background: #f5f5f5;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        .ProseMirror pre {
          background: #f5f5f5;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        .ProseMirror.ProseMirror-focused {
          outline: none;
        }
      `}</style>

      {/* 插入链接弹窗 */}
      <Modal
        title="插入链接"
        open={linkModalVisible}
        onOk={handleInsertLink}
        onCancel={() => {
          setLinkModalVisible(false);
          setLinkText('');
          setLinkUrl('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">链接文字</label>
            <Input
              placeholder="输入显示的文字（留空则使用网址）"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">链接地址</label>
            <Input
              placeholder="输入网址，如: https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onPressEnter={handleInsertLink}
            />
          </div>
        </div>
      </Modal>

      {/* 插入图片弹窗 */}
      <Modal
        title="插入图片"
        open={imageModalVisible}
        onOk={handleAddImage}
        onCancel={() => {
          setImageModalVisible(false);
          setImageUrl('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <div className="py-4">
          <Input
            placeholder="输入图片地址，如: https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onPressEnter={handleAddImage}
          />
          <Alert
            message="💡 提示"
            description="也可以直接粘贴图片（Ctrl+V）或拖拽图片到编辑器中"
            type="info"
            showIcon
            className="mt-3"
          />
        </div>
      </Modal>
    </div>
  );
}