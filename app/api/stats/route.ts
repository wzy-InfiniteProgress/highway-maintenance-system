/**
 * =====================================================
 * 统计模块 - 仪表板统计数据 API
 * =====================================================
 *
 * 功能说明：
 * - 提供仪表板展示所需的所有统计数据
 * - 包括用户、设备，维护计划、故障、知识库等统计
 * - 计算各项完成率指标
 *
 * 请求方法：GET
 * 请求路径：/api/stats
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
    const userCount = await dbUtils.user.count();
    const allUsers = await dbUtils.user.findMany();
    const activeUsers = allUsers.filter(u => u.is_active).length;

    // ============================================
    // 维护心得统计
    // ============================================
    const postCount = await dbUtils.post.count();
    const postViews = await dbUtils.post.getTotalViews();
    const recentPosts = await dbUtils.post.getRecentPosts(5);

    // ============================================
    // 设备统计
    // ============================================
    const equipmentCount = await dbUtils.equipment.count();
    const equipmentStats = await dbUtils.equipment.getStatusStats();

    // ============================================
    // 维护计划统计
    // ============================================
    const maintenanceCount = await dbUtils.maintenancePlan.count();
    const maintenanceStats = await dbUtils.maintenancePlan.getStatusStats();
    const upcomingMaintenances = await dbUtils.maintenancePlan.getUpcoming(5);

    // ============================================
    // 故障记录统计
    // ============================================
    const faultCount = await dbUtils.faultRecord.count();
    const faultStats = await dbUtils.faultRecord.getStatusStats();
    const recentFaults = await dbUtils.faultRecord.getRecent(5);

    // ============================================
    // 知识库统计
    // ============================================
    const knowledgeCount = await dbUtils.knowledgeBase.count();

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
          recentPosts: recentPosts.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            views: p.views,
            createdAt: p.created_at
          }))
        },

        // 设备统计
        equipment: {
          total: equipmentCount,
          statusStats: equipmentStats
        },

        // 维护计划统计
        maintenance: {
          total: maintenanceCount,
          statusStats: maintenanceStats,
          upcoming: upcomingMaintenances.map(m => ({
            id: m.id,
            title: m.title,
            scheduleType: m.schedule_type,
            nextMaintenanceDate: m.next_maintenance_date,
            status: m.status
          }))
        },

        // 故障记录统计
        faults: {
          total: faultCount,
          statusStats: faultStats,
          recentFaults: recentFaults.map(f => ({
            id: f.id,
            title: f.title,
            equipmentId: f.equipment_id,
            faultDate: f.fault_date,
            status: f.status
          }))
        },

        // 知识库统计
        knowledge: {
          total: knowledgeCount
        },

        // 完成率统计
        completionRates: {
          maintenance: maintenanceCount > 0
            ? Math.round((maintenanceStats['completed'] || 0) / maintenanceCount * 100)
            : 0,
          faults: faultCount > 0
            ? Math.round((faultStats['resolved'] || 0) / faultCount * 100)
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