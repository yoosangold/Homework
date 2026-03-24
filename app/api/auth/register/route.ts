import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// 注册请求验证 schema
const registerSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  password: z.string().min(6, '密码长度至少为 6 位'),
  role: z.enum(['TEACHER', 'PARENT']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validatedData = registerSchema.parse(body);
    const { name, phone, password, role } = validatedData;

    // 检查手机号是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已被注册' },
        { status: 400 }
      );
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户（使用 phone 作为 email 的替代，因为 schema 需要 email）
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: phone, // 使用手机号作为 email
        password: hashedPassword,
        role,
      },
    });

    // 不返回密码信息
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: '注册成功',
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
