/**
 * =====================================================
 * JWT 工具模块 - Token 生成与验证
 * =====================================================
 *
 * 功能说明：
 * - 生成 JWT Token
 * - 验证 JWT Token
 * - 获取 Token 载荷信息
 *
 * 安全说明：
 * - 使用 HS256 算法签名
 * - Token 有效期 7 天
 *
 * @date 2024
 */

import jwt from 'jsonwebtoken';

// JWT 密钥：从环境变量读取，生产环境请使用强密钥
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * JWT 载荷接口
 * 包含用户 ID、用户名、角色信息
 */
export interface JWTPayload {
  userId: string;    // 用户ID
  username: string;  // 用户名
  role: string;      // 角色：admin-管理员, user-普通用户
}

/**
 * 生成 JWT Token
 * @param payload - 用户信息载荷
 * @returns 签名的 JWT Token 字符串
 *
 * @example
 * const token = generateToken({ userId: '123', username: 'admin', role: 'admin' });
 */
export function generateToken(payload: JWTPayload): string {
  // sign 方法签名 Token，expiresIn 设置过期时间
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 验证 JWT Token
 * @param token - 待验证的 JWT Token
 * @returns 解析成功返回载荷对象，失败返回 null
 *
 * @example
 * const payload = verifyToken('eyJhbGciOiJIUzI1NiJ9...');
 * if (payload) {
 *   console.log(payload.username);
 * }
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    // verify 方法验证并解析 Token
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    // Token 无效或过期时捕获异常
    return null;
  }
}
