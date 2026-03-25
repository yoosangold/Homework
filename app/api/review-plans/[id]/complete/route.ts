import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { calculateNextReview } from '@/lib/review-schedule';

// POST: 标记复习计划为完成
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id: reviewPlanId } = params;
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: '缺少学生 ID 参数' },
        { status: 400 }
      );
    }

    // 获取复习计划
    const reviewPlan = await prisma.reviewPlan.findUnique({
      where: { id: reviewPlanId },
      include: {
        wrongQuestion: true,
      },
    });

    if (!reviewPlan) {
      return NextResponse.json(
        { success: false, error: '复习计划不存在' },
        { status: 404 }
      );
    }

    // 验证是否属于该学生
    if (reviewPlan.studentId !== studentId) {
      return NextResponse.json(
        { success: false, error: '无权操作此复习计划' },
        { status: 403 }
      );
    }

    // 更新复习计划
    const newReviewCount = reviewPlan.reviewCount + 1;
    const nextReviewAt = calculateNextReview(new Date(), newReviewCount);

    const updatedPlan = await prisma.reviewPlan.update({
      where: { id: reviewPlanId },
      data: {
        reviewCount: newReviewCount,
        lastReviewedAt: new Date(),
        nextReviewAt,
        isCompleted: true,
        completedAt: new Date(),
        masteryLevel: Math.min(100, newReviewCount * 12.5),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: '复习完成，下次复习时间已更新',
    });
  } catch (error) {
    console.error('标记复习完成失败:', error);
    return NextResponse.json(
      { success: false, error: '标记复习完成失败' },
      { status: 500 }
    );
  }
}
