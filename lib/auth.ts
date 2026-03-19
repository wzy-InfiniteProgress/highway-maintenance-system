/**
 * =====================================================
 * 认证工具模块 - 密码加密与验证
 * =====================================================
 *
 * 功能说明：
 * - 使用 bcryptjs 进行密码哈希加密
 * - 支持密码验证
 *
 * 安全说明：
 * - 使用 Salt Rounds = 10，平衡安全性和性能
 * - bcrypt 是专为密码设计的哈希算法
 *
 * @date 2024
 */

import bcrypt from 'bcryptjs';

// Salt 轮数：值越高越安全，但计算时间越长
// 10 轮是业界推荐的安全默认值
const SALT_ROUNDS = 10;

/**
 * 对密码进行哈希加密
 * @param password 明文密码
 * @returns 加密后的哈希字符串
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码是否正确
 * @param password 用户输入的明文密码
 * @param hashedPassword 数据库中存储的哈希密码
 * @returns 密码是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
