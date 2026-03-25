import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// 调班验证 schema
const transferSchema = z.object({
  classStudentId: z.string().cuid('学生记录 ID 格式不正确'),
  targetClassId: z.string().cuid('目标班级 ID 格式不正确'),
});

// POST: 学生调班操作
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
    const validatedData = transferSchema.parse(body);
    const { classStudentId, targetClassId } = validatedData;

    // 检查目标班级是否存在
    const targetClass = await prisma.class.findUnique({
      where: { id: targetClassId },
    });

    if (!targetClass) {
      return NextResponse.json(
        { error: '目标班级不存在' },
        { status: 404 }
      );
    }

    // 查找学生当前所在的班级记录
    const currentClassStudent = await prisma.classStudent.findUnique({
      where: { id: classStudentId },
      include: {
        class: true,
      },
    });

    if (!currentClassStudent || !currentClassStudent.isActive) {
      return NextResponse.json(
        { error: '该学生记录不存在或已不活跃' },
        { status: 400 }
      );
    }

    // 检查是否已经是目标班级
    if (currentClassStudent.classId === targetClassId) {
      return NextResponse.json(
        { error: '学生已经在目标班级' },
        { status: 400 }
      );
    }

    // 检查学生是否曾经在目标班级（避免重复调班）
    const existingTargetRelation = await prisma.classStudent.findFirst({
      where: {
        studentName: currentClassStudent.studentName,
        studentPhone: currentClassStudent.studentPhone || undefined,
        classId: targetClassId,
        isActive: true,
      },
    });

    if (existingTargetRelation) {
      return NextResponse.json(
        { error: '学生已经在目标班级' },
        { status: 400 }
      );
    }

    // 执行调班操作（事务）
    const result = await prisma.$transaction(async (tx) => {
      // 1. 将原班级关系设为不活跃
      await tx.classStudent.update({
        where: { id: classStudentId },
        data: { isActive: false },
      });

      // 2. 在目标班级创建新记录（复制学生信息）
      return await tx.classStudent.create({
        data: {
          userId: currentClassStudent.userId,
          studentName: currentClassStudent.studentName,
          studentPhone: currentClassStudent.studentPhone,
          classId: targetClassId,
        },
      });
    });

    return NextResponse.json({
      message: '调班成功',
      transfer: {
        classStudentId: result.id,
        studentName: currentClassStudent.studentName,
        fromClassId: currentClassStudent.classId,
        fromClassName: currentClassStudent.class.name,
        toClassId: targetClassId,
        toClassName: targetClass.name,
        transferredAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('调班失败:', error);
    return NextResponse.json(
      { error: '调班失败，请稍后重试' },
      { status: 500 }
    );
  }
}
