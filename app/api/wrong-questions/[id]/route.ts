import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import { z } from 'zod';

// 更新错题验证 Schema
const updateWrongQuestionSchema = z.object({
  studentAnswer: z.string().optional(),
  correctAnswer: z.string().optional(),
  errorType: z.string().optional(),
  notes: z.string().optional(),
  masteryStatus: z.enum(['NEW', 'REVIEWING', 'MASTERED']).optional(),
});

// GET: 获取错题详情
export async function GET(
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

    const { id } = params;

    const wrongQuestion = await prisma.wrongQuestion.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        knowledgePoint: {
          select: {
            id: true,
            name: true,
            code: true,
            subject: true,
            description: true,
            parent: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!wrongQuestion) {
      return NextResponse.json(
        { success: false, error: '错题记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: wrongQuestion,
    });
  } catch (error) {
    console.error('获取错题详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取错题详情失败' },
      { status: 500 }
    );
  }
}

// PUT: 更新错题（修改掌握状态等）
export async function PUT(
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

    const { id } = params;
    const body = await request.json();
    const validation = updateWrongQuestionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const updateData: any = { ...validation.data };

    // 检查错题是否存在
    const existingQuestion = await prisma.wrongQuestion.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, error: '错题记录不存在' },
        { status: 404 }
      );
    }

    // 更新错题记录
    const updatedQuestion = await prisma.wrongQuestion.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        knowledgePoint: {
          select: {
            id: true,
            name: true,
            code: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
      message: '错题记录更新成功',
    });
  } catch (error) {
    console.error('更新错题记录失败:', error);
    return NextResponse.json(
      { success: false, error: '更新错题记录失败' },
      { status: 500 }
    );
  }
}

// DELETE: 删除错题
export async function DELETE(
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

    const { id } = params;

    // 检查错题是否存在
    const existingQuestion = await prisma.wrongQuestion.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { success: false, error: '错题记录不存在' },
        { status: 404 }
      );
    }

    // 删除错题记录
    await prisma.wrongQuestion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '错题记录已删除',
    });
  } catch (error) {
    console.error('删除错题记录失败:', error);
    return NextResponse.json(
      { success: false, error: '删除错题记录失败' },
      { status: 500 }
    );
  }
}
