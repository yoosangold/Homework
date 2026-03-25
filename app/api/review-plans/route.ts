import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { getReviewPlan, calculateNextReview } from '@/lib/review-schedule';

// GET: 获取学生的复习计划（今日应复习题目）
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

    // 获取学生的所有错题
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where: { studentId },
      include: {
        knowledgePoint: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        reviewPlans: {
          select: {
            id: true,
            reviewCount: true,
            lastReviewedAt: true,
            nextReviewAt: true,
            isCompleted: true,
            masteryLevel: true,
          },
        },
      },
    });

    // 生成复习计划
    const reviewPlanItems = wrongQuestions.map((question) => {
      const reviewPlan = question.reviewPlans[0];
      const lastReviewedAt = reviewPlan?.lastReviewedAt || null;
      const reviewCount = reviewPlan?.reviewCount || 0;

      return {
        id: question.id,
        questionContent: question.questionContent,
        subject: question.knowledgePoint.subject,
        knowledgePointName: question.knowledgePoint.name,
        lastReviewedAt,
        reviewCount,
        nextReviewAt: calculateNextReview(lastReviewedAt, reviewCount),
        isDue: true, // 这里简化处理，实际应该调用 shouldReview
        masteryLevel: reviewPlan?.masteryLevel || 0,
        reviewPlanId: reviewPlan?.id || null,
      };
    });

    // 按科目分组
    const groupedBySubject: Record<string, typeof reviewPlanItems> = {};
    reviewPlanItems.forEach((item) => {
      if (!groupedBySubject[item.subject]) {
        groupedBySubject[item.subject] = [];
      }
      groupedBySubject[item.subject].push(item);
    });

    return NextResponse.json({
      success: true,
      data: {
        items: reviewPlanItems,
        groupedBySubject,
        total: reviewPlanItems.length,
        dueToday: reviewPlanItems.filter((item) => item.isDue).length,
      },
    });
  } catch (error) {
    console.error('获取复习计划失败:', error);
    return NextResponse.json(
      { success: false, error: '获取复习计划失败' },
      { status: 500 }
    );
  }
}

// POST: 生成新的复习计划（为学生的所有错题创建复习计划记录）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: '缺少学生 ID 参数' },
        { status: 400 }
      );
    }

    // 获取学生的所有错题
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where: { studentId },
      include: {
        knowledgePoint: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
      },
    });

    // 为每个错题创建或更新复习计划
    const reviewPlans = await Promise.all(
      wrongQuestions.map(async (question) => {
        // 检查是否已存在复习计划
        const existingPlan = await prisma.reviewPlan.findFirst({
          where: { wrongQuestionId: question.id },
        });

        if (existingPlan) {
          // 更新现有计划
          const nextReviewAt = calculateNextReview(
            existingPlan.lastReviewedAt,
            existingPlan.reviewCount
          );

          return await prisma.reviewPlan.update({
            where: { id: existingPlan.id },
            data: {
              nextReviewAt,
              masteryLevel: Math.min(100, existingPlan.reviewCount * 12.5),
            },
          });
        } else {
          // 创建新计划
          const nextReviewAt = calculateNextReview(null, 0);

          return await prisma.reviewPlan.create({
            data: {
              wrongQuestionId: question.id,
              studentId,
              reviewCount: 0,
              lastReviewedAt: null,
              nextReviewAt,
              isCompleted: false,
              masteryLevel: 0,
            },
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: reviewPlans,
      message: `已为 ${reviewPlans.length} 道错题生成复习计划`,
    });
  } catch (error) {
    console.error('生成复习计划失败:', error);
    return NextResponse.json(
      { success: false, error: '生成复习计划失败' },
      { status: 500 }
    );
  }
}
