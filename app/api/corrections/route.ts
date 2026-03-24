import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

// 验证提交批改的 Schema
const createCorrectionSchema = z.object({
  assignmentId: z.string().min(1, '作业 ID 不能为空'),
  studentId: z.string().min(1, '学生 ID 不能为空'),
  score: z.number().min(0).max(100).optional(),
  grade: z.string().optional(), // A, B, C, D, F
  feedback: z.string().optional(),
  isWrong: z.boolean().optional(), // 是否标记为错题
  knowledgePointIds: z.array(z.string()).optional(), // 关联的知识点 ID
  questionContent: z.string().optional(), // 如果是错题，记录题目内容
  studentAnswer: z.string().optional(), // 学生答案
  correctAnswer: z.string().optional(), // 正确答案
  errorType: z.string().optional(), // 错误类型
})

// POST: 提交批改
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = createCorrectionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const {
      assignmentId,
      studentId,
      score,
      grade,
      feedback,
      isWrong,
      knowledgePointIds,
      questionContent,
      studentAnswer,
      correctAnswer,
      errorType,
    } = validation.data

    // 检查作业是否存在
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '作业不存在' },
        { status: 404 }
      )
    }

    // 创建或更新批改记录
    let correction = await prisma.correction.findFirst({
      where: {
        assignmentId,
        studentId,
      },
    })

    if (correction) {
      // 更新现有批改
      correction = await prisma.correction.update({
        where: { id: correction.id },
        data: {
          score,
          feedback: feedback || null,
          status: 'CORRECTED',
          correctedAt: new Date(),
          reviewerId: session.user.id,
        },
      })
    } else {
      // 创建新批改
      correction = await prisma.correction.create({
        data: {
          assignmentId,
          studentId,
          score,
          feedback: feedback || null,
          status: 'CORRECTED',
          correctedAt: new Date(),
          reviewerId: session.user.id,
        },
      })
    }

    // 如果标记为错题，创建错题记录
    if (isWrong && questionContent && correctAnswer && knowledgePointIds && knowledgePointIds.length > 0) {
      for (const knowledgePointId of knowledgePointIds) {
        await prisma.wrongQuestion.create({
          data: {
            studentId,
            knowledgePointId,
            questionContent,
            studentAnswer: studentAnswer || null,
            correctAnswer,
            errorType: errorType || null,
            notes: feedback || null,
          },
        })
      }
    }

    // 更新作业状态
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: 'CORRECTED',
      },
    })

    return NextResponse.json({
      success: true,
      data: correction,
      message: '批改提交成功',
    })
  } catch (error) {
    console.error('提交批改失败:', error)
    return NextResponse.json(
      { success: false, error: '提交批改失败' },
      { status: 500 }
    )
  }
}

// GET: 获取批改记录
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const assignmentId = searchParams.get('assignmentId')
    const studentId = searchParams.get('studentId')

    const where: any = {}

    if (assignmentId) {
      where.assignmentId = assignmentId
    }

    if (studentId) {
      where.studentId = studentId
    }

    const corrections = await prisma.correction.findMany({
      where,
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            subject: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: corrections,
    })
  } catch (error) {
    console.error('获取批改记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取批改记录失败' },
      { status: 500 }
    )
  }
}
