export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  isPublic: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostCreate {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface PostUpdate {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface PostListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  search?: string;
  authorId?: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
}