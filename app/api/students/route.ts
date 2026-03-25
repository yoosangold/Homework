import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 添加学生验证 schema
const addStudentSchema = z.object({
  studentName: z.string().min(1, '学生姓名不能为空'),
  studentPhone: z.string().optional(),
  classId: z.string().cuid('班级 ID 格式不正确'),
});

// GET: 搜索学生（按姓名或手机号）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const classId = searchParams.get('classId') || '';

    if (!keyword && !classId) {
      return NextResponse.json([]);
    }

    // 构建查询条件
    const whereClause: any = {};
    
    if (classId) {
      whereClause.classId = classId;
    }
    
    if (keyword) {
      whereClause.OR = [
        { studentName: { contains: keyword } },
        { studentPhone: { contains: keyword } },
      ];
    }

    // 搜索学生（包括已注册和未注册的）
    const students = await prisma.classStudent.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        studentName: true,
        studentPhone: true,
        classId: true,
        enrolledAt: true,
        isActive: true,
        class: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            phone: true,
            email: true,
          },
        },
      },
      take: 20,
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('搜索学生失败:', error);
    return NextResponse.json(
      { error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}

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
    const { studentName, studentPhone, classId } = validatedData;

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

    // 如果提供了手机号，检查是否已经存在
    if (studentPhone) {
      const existingStudent = await prisma.classStudent.findFirst({
        where: { 
          studentPhone,
          classId: { not: classId }, // 不同班级的相同手机号
          isActive: true,
        },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: '该手机号的学生已在其他班级' },
          { status: 400 }
        );
      }
    }

    // 创建班级 - 学生关联（无需 User 表）
    const newRelation = await prisma.classStudent.create({
      data: {
        studentName,
        studentPhone: studentPhone || null,
        classId,
      },
      include: {
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
        studentName: newRelation.studentName,
        studentPhone: newRelation.studentPhone,
        classId: newRelation.classId,
        enrolledAt: newRelation.enrolledAt,
        isActive: newRelation.isActive,
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
