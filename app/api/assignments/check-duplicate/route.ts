import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 检查是否存在相同作业
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
    const imageHash = searchParams.get('imageHash')

    if (!studentId || !imageHash) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      )
    }

    // 检查该学生是否已有相同哈希的作业
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        studentId,
        imageHash,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const isDuplicate = existingAssignment !== null

    return NextResponse.json({
      success: true,
      exists: isDuplicate,
      existingAssignment: existingAssignment ? {
        id: existingAssignment.id,
        createdAt: existingAssignment.createdAt,
      } : null,
    })
  } catch (error) {
    console.error('检查重复作业失败:', error)
    return NextResponse.json(
      { success: false, error: '检查重复作业失败' },
      { status: 500 }
    )
  }
}
