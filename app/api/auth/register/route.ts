import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// 邀请码配置（实际应该存储在数据库中）
const VALID_INVITE_CODES = ['TEACHER2026', 'SCHOOL2026', 'ADMIN123'];

// 注册请求验证 schema
const registerSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  password: z.string().min(6, '密码长度至少为 6 位'),
  role: z.enum(['TEACHER', 'PARENT']),
  inviteCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validatedData = registerSchema.parse(body);
    const { name, phone, password, role, inviteCode } = validatedData;

    // 老师注册需要邀请码
    if (role === 'TEACHER' && !inviteCode) {
      return NextResponse.json(
        { error: '老师注册需要邀请码' },
        { status: 400 }
      );
    }

    // 验证邀请码
    if (role === 'TEACHER' && inviteCode && !VALID_INVITE_CODES.includes(inviteCode)) {
      return NextResponse.json(
        { error: '邀请码无效' },
        { status: 400 }
      );
    }

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

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: phone,
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
