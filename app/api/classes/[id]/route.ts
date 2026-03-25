import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// 更新班级验证 schema
const updateClassSchema = z.object({
  name: z.string().min(1, '班级名称不能为空').optional(),
  grade: z.number().int().min(1).max(12, '年级必须在 1-12 之间').optional(),
});

// GET: 获取班级详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const classId = params.id;

    // 获取班级详情，包括学生和老师信息
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classStudents: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            enrolledAt: 'asc',
          },
        },
        classTeachers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!cls) {
      return NextResponse.json(
        { error: '班级不存在' },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const classData = {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      studentCount: cls.classStudents.length,
      teacherCount: cls.classTeachers.length,
      students: cls.classStudents.map((cs) => ({
        id: cs.id,
        userId: cs.userId,
        name: cs.studentName, // 使用 ClassStudent 表中的姓名
        phone: cs.studentPhone || cs.user?.phone, // 优先使用 ClassStudent 表中的手机号
        email: cs.user?.email || '',
        role: cs.user?.role || 'STUDENT',
        enrolledAt: cs.enrolledAt,
      })),
      teachers: cls.classTeachers.map((ct) => ({
        id: ct.id,
        userId: ct.userId,
        name: ct.user.name,
        phone: ct.user.phone,
        email: ct.user.email,
        role: ct.user.role,
        classRole: ct.role,
        assignedAt: ct.assignedAt,
      })),
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    };

    return NextResponse.json({
      class: classData,
    });
  } catch (error) {
    console.error('获取班级详情失败:', error);
    return NextResponse.json(
      { error: '获取班级详情失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// PUT: 更新班级信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const classId = params.id;
    const body = await request.json();

    // 验证请求数据
    const validatedData = updateClassSchema.parse(body);

    // 检查班级是否存在
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: '班级不存在' },
        { status: 404 }
      );
    }

    // 如果更新名称，检查新名称是否已被使用
    if (validatedData.name && validatedData.name !== existingClass.name) {
      const nameConflict = await prisma.class.findUnique({
        where: { name: validatedData.name },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: '该班级名称已存在' },
          { status: 400 }
        );
      }
    }

    // 更新班级
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: validatedData,
    });

    return NextResponse.json({
      message: '班级信息更新成功',
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        grade: updatedClass.grade,
        createdAt: updatedClass.createdAt,
        updatedAt: updatedClass.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('更新班级失败:', error);
    return NextResponse.json(
      { error: '更新班级失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// DELETE: 删除班级
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const classId = params.id;

    // 检查班级是否存在
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classStudents: {
          where: { isActive: true },
        },
      },
    });

    if (!cls) {
      return NextResponse.json(
        { error: '班级不存在' },
        { status: 404 }
      );
    }

    // 检查班级是否有学生
    if (cls.classStudents.length > 0) {
      return NextResponse.json(
        { error: '班级中还有学生，无法删除' },
        { status: 400 }
      );
    }

    // 删除班级
    await prisma.class.delete({
      where: { id: classId },
    });

    return NextResponse.json({
      message: '班级删除成功',
    });
  } catch (error) {
    console.error('删除班级失败:', error);
    return NextResponse.json(
      { error: '删除班级失败，请稍后重试' },
      { status: 500 }
    );
  }
}
