import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 添加学生验证 schema
const addStudentSchema = z.object({
  userId: z.string().cuid('用户 ID 格式不正确'),
  classId: z.string().cuid('班级 ID 格式不正确'),
});

// POST: 添加学生到班级
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证请求数据
    const validatedData = addStudentSchema.parse(body);
    const { userId, classId } = validatedData;

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查用户是否已经是 STUDENT 角色
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: '该用户不是学生角色' },
        { status: 400 }
      );
    }

    // 检查班级是否存在
    const cls = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!cls) {
      return NextResponse.json(
        { error: '班级不存在' },
        { status: 404 }
      );
    }

    // 检查学生是否已经在该班级
    const existingRelation = await prisma.classStudent.findUnique({
      where: {
        userId_classId: {
          userId,
          classId,
        },
      },
    });

    if (existingRelation) {
      if (existingRelation.isActive) {
        return NextResponse.json(
          { error: '该学生已经在班级中' },
          { status: 400 }
        );
      } else {
        // 如果之前有记录但不活跃，更新为活跃
        const updatedRelation = await prisma.classStudent.update({
          where: { id: existingRelation.id },
          data: { isActive: true },
        });

        return NextResponse.json({
          message: '学生已重新加入班级',
          relation: {
            id: updatedRelation.id,
            userId: updatedRelation.userId,
            classId: updatedRelation.classId,
            enrolledAt: updatedRelation.enrolledAt,
            isActive: updatedRelation.isActive,
          },
        });
      }
    }

    // 创建班级 - 学生关联
    const newRelation = await prisma.classStudent.create({
      data: {
        userId,
        classId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: '学生添加成功',
      relation: {
        id: newRelation.id,
        userId: newRelation.userId,
        classId: newRelation.classId,
        enrolledAt: newRelation.enrolledAt,
        isActive: newRelation.isActive,
        student: newRelation.user,
        class: newRelation.class,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('添加学生失败:', error);
    return NextResponse.json(
      { error: '添加学生失败，请稍后重试' },
      { status: 500 }
    );
  }
}
