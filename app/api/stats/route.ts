/**
 * =====================================================
 * 统计模块 - 仪表板统计数据 API
 * =====================================================
 *
 * 功能说明：
 * - 提供仪表板展示所需的所有统计数据
 * - 包括用户、设备、维护计划、故障、知识库等统计
 * - 计算各项完成率指标
 *
 * 请求方法：GET
 * 请求路径：/api/stats
 *
 * 返回数据：
 * - users: 用户统计（总数、活跃数、禁用数）
 * - posts: 维护心得统计（总数、浏览量、分类统计）
 * - equipment: 设备统计（总数、状态分布）
 * - maintenance: 维护计划统计（总数、状态分布、待执行计划）
 * - faults: 故障记录统计（总数、状态分布）
 * - knowledge: 知识库统计（总数）
 * - completionRates: 完成率统计
 *
 * @date 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db';

/**
 * GET /api/stats
 * 获取仪表板统计数据
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 用户统计
    // ============================================
    const userCount = dbUtils.user.count();                      // 用户总数
    const activeUsers = dbUtils.user.findMany().filter(u => u.isActive === 1).length;  // 活跃用户数

    // ============================================
    // 维护心得统计
    // ============================================
    const postCount = dbUtils.post.count();                      // 心得总数
    const postViews = dbUtils.post.getTotalViews();             // 总浏览量
    const postCategoryStats = dbUtils.post.getCategoryStats(); // 分类统计
    const recentPosts = dbUtils.post.getRecentPosts(5);         // 最新5条心得

    // ============================================
    // 设备统计
    // ============================================
    const equipmentCount = dbUtils.equipment.count();          // 设备总数
    const equipmentStats = dbUtils.equipment.getStatusStats(); // 设备状态分布

    // ============================================
    // 维护计划统计
    // ============================================
    const maintenanceCount = dbUtils.maintenancePlan.count();  // 计划总数
    const maintenanceStats = dbUtils.maintenancePlan.getStatusStats();  // 计划状态分布
    const upcomingMaintenances = dbUtils.maintenancePlan.getUpcoming(5);  // 待执行计划

    // ============================================
    // 故障记录统计
    // ============================================
    const faultCount = dbUtils.faultRecord.count();            // 故障总数
    const faultStats = dbUtils.faultRecord.getStatusStats();  // 故障状态分布
    const recentFaults = dbUtils.faultRecord.getRecent(5);   // 最新5条故障

    // ============================================
    // 知识库统计
    // ============================================
    const knowledgeCount = dbUtils.knowledgeBase.count();      // 知识库总数

    // ============================================
    // 构建返回数据
    // ============================================
    return NextResponse.json({
      success: true,
      data: {
        // 用户统计
        users: {
          total: userCount,
          active: activeUsers,
          inactive: userCount - activeUsers
        },

        // 维护心得统计
        posts: {
          total: postCount,
          totalViews: postViews,
          categoryStats: postCategoryStats,
          recentPosts: recentPosts.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            views: p.views,
            createdAt: p.createdAt
          }))
        },

        // 设备统计
        equipment: {
          total: equipmentCount,
          // 将状态数组转换为对象 { active: 10, maintenance: 5, ... }
          statusStats: equipmentStats.reduce((acc, stat) => {
            acc[stat.status] = stat.count;
            return acc;
          }, {} as Record<string, number>)
        },

        // 维护计划统计
        maintenance: {
          total: maintenanceCount,
          statusStats: maintenanceStats.reduce((acc, stat) => {
            acc[stat.status] = stat.count;
            return acc;
          }, {} as Record<string, number>),
          upcoming: upcomingMaintenances.map(m => ({
            id: m.id,
            title: m.title,
            scheduleType: m.scheduleType,
            nextMaintenanceDate: m.nextMaintenanceDate,
            status: m.status
          }))
        },

        // 故障记录统计
        faults: {
          total: faultCount,
          statusStats: faultStats.reduce((acc, stat) => {
            acc[stat.status] = stat.count;
            return acc;
          }, {} as Record<string, number>),
          recentFaults: recentFaults.map(f => ({
            id: f.id,
            title: f.title,
            equipmentId: f.equipmentId,
            faultDate: f.faultDate,
            status: f.status
          }))
        },

        // 知识库统计
        knowledge: {
          total: knowledgeCount
        },

        // 完成率统计
        completionRates: {
          // 维护计划完成率 = 已完成数 / 总数 * 100
          maintenance: maintenanceCount > 0
            ? Math.round((maintenanceStats.find(s => s.status === 'completed')?.count || 0) / maintenanceCount * 100)
            : 0,
          // 故障解决率 = 已解决数 / 总数 * 100
          faults: faultCount > 0
            ? Math.round((faultStats.find(s => s.status === 'resolved')?.count || 0) / faultCount * 100)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
