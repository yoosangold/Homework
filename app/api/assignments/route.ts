import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { Subject } from '@prisma/client'
import { z } from 'zod'

// 验证创建作业的 Schema
const createAssignmentSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  subject: z.enum(['MATH', 'CHINESE', 'ENGLISH']).optional().default('MATH'),
  studentName: z.string().min(1, '学生姓名不能为空'),
  studentId: z.string().optional(),
  instruction: z.string().optional(),
  images: z.array(z.string()).optional(),
  imageHash: z.string().optional(),
})

// GET: 获取作业列表（支持按学生、状态筛选）
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
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    const subject = searchParams.get('subject')

    const where: any = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (status) {
      where.status = status
    }

    if (subject && ['MATH', 'CHINESE', 'ENGLISH'].includes(subject)) {
      where.subject = subject as Subject
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        corrections: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: assignments,
    })
  } catch (error) {
    console.error('获取作业列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取作业列表失败' },
      { status: 500 }
    )
  }
}

// POST: 创建新作业
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
    const validation = createAssignmentSchema.safeParse(body)

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

    const { title, description, subject, studentName, studentId, instruction, images, imageHash } = validation.data

    // 查找或创建学生用户（如果 studentId 不存在）
    let actualStudentId = studentId
    if (!studentId) {
      // 尝试根据学生姓名查找
      const existingStudent = await prisma.user.findFirst({
        where: {
          name: studentName,
          role: 'STUDENT',
        },
      })

      if (existingStudent) {
        actualStudentId = existingStudent.id
      } else {
        // 创建临时学生记录（如果需要）
        const newStudent = await prisma.user.create({
          data: {
            email: `student_${studentName}_${Date.now()}@temp.local`,
            name: studentName,
            password: 'temp_password',
            role: 'STUDENT',
          },
        })
        actualStudentId = newStudent.id
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subject: subject as Subject,
        teacherId: session.user.id,
        studentName,
        studentId: actualStudentId,
        instruction,
        images: images ? JSON.stringify(images) : null,
        imageHash,
        status: 'PENDING',
        dueDate: new Date(),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: assignment,
      message: '作业创建成功',
    })
  } catch (error) {
    console.error('创建作业失败:', error)
    return NextResponse.json(
      { success: false, error: '创建作业失败' },
      { status: 500 }
    )
  }
}
