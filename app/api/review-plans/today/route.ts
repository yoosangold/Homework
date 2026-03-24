import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { shouldReview } from '@/lib/review-schedule';

// GET: 获取今日复习计划汇总
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: '缺少学生 ID 参数' },
        { status: 400 }
      );
    }

    const now = new Date();

    // 获取今日应复习的题目（包括已完成的）
    const reviewPlans = await prisma.reviewPlan.findMany({
      where: { studentId },
      include: {
        wrongQuestion: {
          include: {
            knowledgePoint: {
              select: {
                id: true,
                name: true,
                subject: true,
              },
            },
          },
        },
      },
    });

    // 过滤出今日应复习的题目
    const dueToday = reviewPlans.filter((plan) => {
      // 如果已完成但还没到下次复习时间，不算今日应复习
      if (plan.isCompleted && plan.nextReviewAt && plan.nextReviewAt > now) {
        return false;
      }
      // 检查是否需要复习
      return shouldReview(plan.lastReviewedAt, plan.reviewCount, now);
    });

    // 统计完成进度
    const totalDue = dueToday.length;
    const completedToday = dueToday.filter(
      (plan) =>
        plan.isCompleted &&
        plan.completedAt &&
        new Date(plan.completedAt).toDateString() === now.toDateString()
    ).length;

    // 按科目分组统计
    const statsBySubject: Record<
      string,
      { total: number; completed: number; subject: string }
    > = {};

    dueToday.forEach((plan) => {
      const subject = plan.wrongQuestion.knowledgePoint.subject;
      if (!statsBySubject[subject]) {
        statsBySubject[subject] = { total: 0, completed: 0, subject };
      }
      statsBySubject[subject].total++;
      if (
        plan.isCompleted &&
        plan.completedAt &&
        new Date(plan.completedAt).toDateString() === now.toDateString()
      ) {
        statsBySubject[subject].completed++;
      }
    });

    // 按科目分组显示题目
    const groupedBySubject: Record<
      string,
      Array<{
        id: string;
        questionContent: string;
        knowledgePointName: string;
        reviewCount: number;
        masteryLevel: number;
        isCompleted: boolean;
        completedAt: Date | null;
        nextReviewAt: Date | null;
      }>
    > = {};

    dueToday.forEach((plan) => {
      const subject = plan.wrongQuestion.knowledgePoint.subject;
      if (!groupedBySubject[subject]) {
        groupedBySubject[subject] = [];
      }
      groupedBySubject[subject].push({
        id: plan.wrongQuestion.id,
        questionContent: plan.wrongQuestion.questionContent,
        knowledgePointName: plan.wrongQuestion.knowledgePoint.name,
        reviewCount: plan.reviewCount,
        masteryLevel: plan.masteryLevel,
        isCompleted: plan.isCompleted,
        completedAt: plan.completedAt,
        nextReviewAt: plan.nextReviewAt,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        date: now.toISOString().split('T')[0],
        totalDue,
        completedToday,
        progress: totalDue > 0 ? Math.round((completedToday / totalDue) * 100) : 0,
        statsBySubject,
        groupedBySubject,
        items: dueToday.map((plan) => ({
          id: plan.wrongQuestion.id,
          questionContent: plan.wrongQuestion.questionContent,
          subject: plan.wrongQuestion.knowledgePoint.subject,
          knowledgePointName: plan.wrongQuestion.knowledgePoint.name,
          reviewCount: plan.reviewCount,
          masteryLevel: plan.masteryLevel,
          isCompleted: plan.isCompleted,
          completedAt: plan.completedAt,
          nextReviewAt: plan.nextReviewAt,
          reviewPlanId: plan.id,
        })),
      },
    });
  } catch (error) {
    console.error('获取今日复习计划失败:', error);
    return NextResponse.json(
      { success: false, error: '获取今日复习计划失败' },
      { status: 500 }
    );
  }
}
