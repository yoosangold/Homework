import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

// 创建知识点验证 Schema
const createKnowledgePointSchema = z.object({
  name: z.string().min(1, '知识点名称不能为空'),
  code: z.string().min(1, '知识点编码不能为空'),
  subject: z.enum(['MATH', 'CHINESE', 'ENGLISH']),
  parentId: z.string().cuid().optional(),
  description: z.string().optional(),
});

// GET: 获取知识点列表（支持按科目、年级筛选）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const search = searchParams.get('search');

    const where: any = {};

    if (subject) {
      where.subject = subject;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const knowledgePoints = await prisma.knowledgePoint.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            wrongQuestions: true,
          },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: knowledgePoints,
    });
  } catch (error) {
    console.error('获取知识点列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取知识点列表失败' },
      { status: 500 }
    );
  }
}

// POST: 创建知识点
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createKnowledgePointSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, code, subject, parentId, description } = validation.data;

    // 检查编码是否已存在
    const existing = await prisma.knowledgePoint.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: '知识点编码已存在' },
        { status: 400 }
      );
    }

    // 如果指定了父知识点，检查是否存在
    if (parentId) {
      const parent = await prisma.knowledgePoint.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        return NextResponse.json(
          { success: false, error: '父知识点不存在' },
          { status: 404 }
        );
      }
    }

    // 创建知识点
    const knowledgePoint = await prisma.knowledgePoint.create({
      data: {
        name,
        code,
        subject,
        parentId: parentId || null,
        description: description || null,
        depth: parentId ? 1 : 0,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: knowledgePoint,
      message: '知识点创建成功',
    });
  } catch (error) {
    console.error('创建知识点失败:', error);
    return NextResponse.json(
      { success: false, error: '创建知识点失败' },
      { status: 500 }
    );
  }
}
