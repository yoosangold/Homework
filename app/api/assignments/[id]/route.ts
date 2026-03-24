import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

// 验证更新作业的 Schema
const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  instruction: z.string().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(['PENDING', 'CORRECTED', 'ARCHIVED']).optional(),
})

// GET: 获取作业详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        corrections: {
          include: {
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
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '作业不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: assignment,
    })
  } catch (error) {
    console.error('获取作业详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取作业详情失败' },
      { status: 500 }
    )
  }
}

// DELETE: 删除作业
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '作业不存在' },
        { status: 404 }
      )
    }

    // 只有老师或管理员可以删除
    if (assignment.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权删除此作业' },
        { status: 403 }
      )
    }

    await prisma.assignment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: '作业已删除',
    })
  } catch (error) {
    console.error('删除作业失败:', error)
    return NextResponse.json(
      { success: false, error: '删除作业失败' },
      { status: 500 }
    )
  }
}

// PATCH: 更新作业
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '作业不存在' },
        { status: 404 }
      )
    }

    // 只有老师或管理员可以更新
    if (assignment.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权更新此作业' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = updateAssignmentSchema.safeParse(body)

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

    const updateData: any = {}
    if (validation.data.title) updateData.title = validation.data.title
    if (validation.data.description !== undefined) updateData.description = validation.data.description
    if (validation.data.instruction !== undefined) updateData.instruction = validation.data.instruction
    if (validation.data.images) updateData.images = JSON.stringify(validation.data.images)
    if (validation.data.status) updateData.status = validation.data.status

    const updatedAssignment = await prisma.assignment.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: '作业已更新',
    })
  } catch (error) {
    console.error('更新作业失败:', error)
    return NextResponse.json(
      { success: false, error: '更新作业失败' },
      { status: 500 }
    )
  }
}
