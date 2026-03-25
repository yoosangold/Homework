import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

// 创建错题验证 Schema
const createWrongQuestionSchema = z.object({
  studentId: z.string().cuid('学生 ID 格式不正确'),
  knowledgePointId: z.string().cuid('知识点 ID 格式不正确'),
  questionContent: z.string().min(1, '题目内容不能为空'),
  studentAnswer: z.string().optional(),
  correctAnswer: z.string().min(1, '正确答案不能为空'),
  errorType: z.string().optional(),
  notes: z.string().optional(),
  masteryStatus: z.enum(['NEW', 'REVIEWING', 'MASTERED']).optional().default('NEW'),
});

// GET: 获取错题列表（支持按学生、科目、知识点、掌握状态筛选）
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
    const subject = searchParams.get('subject');
    const knowledgePointId = searchParams.get('knowledgePointId');
    const masteryStatus = searchParams.get('masteryStatus');
    const grade = searchParams.get('grade');

    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (knowledgePointId) {
      where.knowledgePointId = knowledgePointId;
    }

    // 如果按科目或年级筛选，需要通过知识点关联
    if (subject || grade) {
      where.knowledgePoint = {};
      if (subject) {
        where.knowledgePoint.subject = subject;
      }
      if (grade) {
        // 需要通过知识点关联到题目，再筛选年级（这里简化处理）
        // 实际应用中可能需要更复杂的查询
      }
    }

    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: wrongQuestions,
    });
  } catch (error) {
    console.error('获取错题列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取错题列表失败' },
      { status: 500 }
    );
  }
}

// POST: 创建错题记录
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
    const validation = createWrongQuestionSchema.safeParse(body);

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

    const {
      studentId,
      knowledgePointId,
      questionContent,
      studentAnswer,
      correctAnswer,
      errorType,
      notes,
      masteryStatus,
    } = validation.data;

    // 检查学生是否存在
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: '学生不存在' },
        { status: 404 }
      );
    }

    // 检查知识点是否存在
    const knowledgePoint = await prisma.knowledgePoint.findUnique({
      where: { id: knowledgePointId },
    });

    if (!knowledgePoint) {
      return NextResponse.json(
        { success: false, error: '知识点不存在' },
        { status: 404 }
      );
    }

    // 创建错题记录
    const wrongQuestion = await prisma.wrongQuestion.create({
      data: {
        studentId,
        knowledgePointId,
        questionContent,
        studentAnswer: studentAnswer || null,
        correctAnswer,
        errorType: errorType || null,
        notes: notes || null,
      },
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
      data: wrongQuestion,
      message: '错题记录创建成功',
    });
  } catch (error) {
    console.error('创建错题记录失败:', error);
    return NextResponse.json(
      { success: false, error: '创建错题记录失败' },
      { status: 500 }
    );
  }
}
