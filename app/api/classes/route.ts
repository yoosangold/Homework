import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// 创建班级验证 schema
const createClassSchema = z.object({
  name: z.string().min(1, '班级名称不能为空'),
  grade: z.number().int().min(1).max(12, '年级必须在 1-12 之间'),
});

// GET: 获取班级列表（包含学生数量）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 获取所有班级，并包含学生详细信息
    const classes = await prisma.class.findMany({
      include: {
        classStudents: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            studentName: true,
            studentPhone: true,
            enrolledAt: true,
          },
        },
      },
      orderBy: {
        grade: 'asc',
      },
    });

    // 格式化返回数据
    const classesWithStudents = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      studentCount: cls.classStudents.length,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
      students: cls.classStudents.map((cs) => ({
        id: cs.id,
        name: cs.studentName,
        phone: cs.studentPhone || '',
        enrolledAt: cs.enrolledAt,
      })),
    }));

    return NextResponse.json({
      classes: classesWithStudents,
    });
  } catch (error) {
    console.error('获取班级列表失败:', error);
    return NextResponse.json(
      { error: '获取班级列表失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// POST: 创建新班级
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
    const validatedData = createClassSchema.parse(body);
    const { name, grade } = validatedData;

    // 检查班级名称是否已存在
    const existingClass = await prisma.class.findUnique({
      where: { name },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: '该班级名称已存在' },
        { status: 400 }
      );
    }

    // 创建班级
    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
      },
    });

    return NextResponse.json({
      message: '班级创建成功',
      class: {
        id: newClass.id,
        name: newClass.name,
        grade: newClass.grade,
        studentCount: 0,
        createdAt: newClass.createdAt,
        updatedAt: newClass.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('创建班级失败:', error);
    return NextResponse.json(
      { error: '创建班级失败，请稍后重试' },
      { status: 500 }
    );
  }
}
