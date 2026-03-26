import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

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

    // 检查作业是否存在
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '作业不存在' },
        { status: 404 }
      )
    }

    // 删除作业（级联删除相关的批改记录）
    await prisma.assignment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: '作业删除成功',
    })
  } catch (error) {
    console.error('删除作业失败:', error)
    return NextResponse.json(
      { success: false, error: '删除作业失败' },
      { status: 500 }
    )
  }
}

// GET: 获取单个作业详情
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
