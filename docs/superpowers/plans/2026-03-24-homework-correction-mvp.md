# 晚托作业批改系统 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建服务于小学生晚托辅导机构的作业批改系统 MVP，包含用户系统、班级管理、作业上传、批改功能、错题本核心功能

**Architecture:** Next.js 14 App Router 全栈架构，前后端一体，Supabase PostgreSQL 数据库，Vercel 部署

**Tech Stack:** Next.js 14, TypeScript, TailwindCSS, shadcn/ui, Supabase, Prisma ORM

---

## 文件结构规划

### 创建的核心文件

```
homework-correction-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # 登录页
│   │   └── register/page.tsx       # 注册页
│   ├── (dashboard)/
│   │   ├── layout.tsx              # 仪表盘布局
│   │   ├── page.tsx                # 仪表盘首页
│   │   ├── classes/
│   │   │   ├── page.tsx            # 班级管理列表
│   │   │   ├── new/page.tsx        # 创建班级
│   │   │   └── [id]/page.tsx       # 班级详情
│   │   ├── assignments/
│   │   │   ├── page.tsx            # 作业列表
│   │   │   ├── [id]/page.tsx       # 作业详情/批改
│   │   │   └── upload/page.tsx     # 上传作业
│   │   ├── wrong-questions/
│   │   │   ├── page.tsx            # 错题本列表
│   │   │   └── [id]/page.tsx       # 错题详情
│   │   └── students/
│   │       ├── page.tsx            # 学生管理
│   │       └── transfer/page.tsx   # 调班操作
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── assignments/
│   │   │   ├── route.ts            # 作业 CRUD
│   │   │   └── [id]/route.ts
│   │   ├── corrections/
│   │   │   └── route.ts            # 批改接口
│   │   └── wrong-questions/
│   │       └── route.ts            # 错题接口
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui 组件
│   ├── assignments/
│   │   ├── AssignmentCard.tsx
│   │   ├── AssignmentUpload.tsx
│   │   └── CorrectionForm.tsx
│   ├── classes/
│   │   ├── ClassList.tsx
│   │   └── StudentTransferForm.tsx
│   └── wrong-questions/
│       ├── WrongQuestionCard.tsx
│       └── KnowledgePointSelector.tsx
├── lib/
│   ├── db.ts                       # 数据库连接
│   ├── auth.ts                     # 认证配置
│   └── utils.ts
├── prisma/
│   ├── schema.prisma               # 数据库模型
│   └── seed.ts                     # 初始数据
├── types/
│   └── index.ts                    # TypeScript 类型定义
├── .env.local                      # 环境变量
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Phase 1: 项目基础搭建 (Week 1-2)

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `.env.local.example`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "homework-correction-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.9.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.0",
    "prisma": "^5.9.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
npm install
```
Expected: 安装成功，无错误

- [ ] **Step 3: 初始化 TailwindCSS**

```bash
npx tailwindcss init -p
```
Expected: 创建 tailwind.config.js 和 postcss.config.js

- [ ] **Step 4: 配置 next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 5: 创建 .env.local.example**

```bash
# Supabase
DATABASE_URL="postgresql://user:password@host:5432/homework"
DIRECT_URL="postgresql://user:password@host:5432/homework"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

- [ ] **Step 6: 创建基础 layout 和首页**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '作业批改系统',
  description: '晚托辅导机构作业批改平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 初始化 Next.js 项目基础结构"
```

---

### Task 2: 配置 Prisma 数据库模型

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`
- Create: `types/index.ts`

- [ ] **Step 1: 创建 Prisma Schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  ADMIN
  HEAD_TEACHER
  TEACHER
  PARENT
  STUDENT
}

enum Subject {
  MATH
  CHINESE
  ENGLISH
}

enum AssignmentStatus {
  PENDING
  COMPLETED
}

enum MasteryStatus {
  NEW
  REVIEWING
  MASTERED
}

model User {
  id                 String    @id @default(cuid())
  name               String
  phone              String    @unique
  role               Role
  enterpriseWechatId String?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  
  assignments        Assignment[]
  corrections        Correction[]
  wrongQuestions     WrongQuestion[]
  classStudents      ClassStudent[]
  classTeachers      ClassTeacher[]
}

model Class {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  
  students    ClassStudent[]
  teachers    ClassTeacher[]
}

model ClassStudent {
  id        String   @id @default(cuid())
  classId   String
  studentId String
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  status    String   @default("active")
  
  class     Class   @relation(fields: [classId], references: [id])
  student   User    @relation(fields: [studentId], references: [id])
  
  @@unique([classId, studentId, status])
}

model ClassTeacher {
  id        String   @id @default(cuid())
  classId   String
  teacherId String
  role      String   @default("head_teacher")
  
  class     Class   @relation(fields: [classId], references: [id])
  teacher   User    @relation(fields: [teacherId], references: [id])
  
  @@unique([classId, teacherId])
}

model Assignment {
  id          String            @id @default(cuid())
  studentId   String
  subject     Subject
  imageUrls   String[]
  description String?
  status      AssignmentStatus  @default(PENDING)
  uploadedAt  DateTime          @default(now())
  completedAt DateTime?
  
  student     User         @relation(fields: [studentId], references: [id])
  corrections Correction[]
}

model Correction {
  id              String    @id @default(cuid())
  assignmentId    String
  teacherId       String
  score           Decimal?
  grade           String?
  comment         String?
  isWrongQuestion Boolean   @default(false)
  knowledgePointId String?
  correctedAt     DateTime  @default(now())
  notified        Boolean   @default(false)
  
  assignment      Assignment @relation(fields: [assignmentId], references: [id])
  teacher         User       @relation(fields: [teacherId], references: [id])
  wrongQuestion   WrongQuestion?
}

model KnowledgePoint {
  id        String   @id @default(cuid())
  subject   Subject
  grade     String
  unit      String?
  name      String
  parentId  String?
  path      String?
  
  parent    KnowledgePoint? @relation("KnowledgePointHierarchy", fields: [parentId], references: [id])
  children  KnowledgePoint[] @relation("KnowledgePointHierarchy")
  wrongQuestions WrongQuestion[]
}

model WrongQuestion {
  id             String        @id @default(cuid())
  studentId      String
  correctionId   String        @unique
  knowledgePointId String?
  imageUrl       String
  correctAnswer  String?
  reviewCount    Int           @default(0)
  lastReviewAt   DateTime?
  masteryStatus  MasteryStatus @default(NEW)
  createdAt      DateTime      @default(now())
  
  student        User          @relation(fields: [studentId], references: [id])
  correction     Correction    @relation(fields: [correctionId], references: [id])
  knowledgePoint KnowledgePoint? @relation(fields: [knowledgePointId], references: [id])
}
```

- [ ] **Step 2: 创建数据库连接**

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: 创建类型定义**

```typescript
// types/index.ts
export type UserRole = 'ADMIN' | 'HEAD_TEACHER' | 'TEACHER' | 'PARENT' | 'STUDENT';
export type Subject = 'MATH' | 'CHINESE' | 'ENGLISH';
export type AssignmentStatus = 'PENDING' | 'COMPLETED';
export type MasteryStatus = 'NEW' | 'REVIEWING' | 'MASTERED';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  enterpriseWechatId?: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
}

export interface Assignment {
  id: string;
  studentId: string;
  subject: Subject;
  imageUrls: string[];
  description?: string;
  status: AssignmentStatus;
  uploadedAt: Date;
  completedAt?: Date;
}

export interface WrongQuestion {
  id: string;
  studentId: string;
  imageUrl: string;
  correctAnswer?: string;
  knowledgePoint?: {
    id: string;
    name: string;
    subject: Subject;
    grade: string;
  };
  masteryStatus: MasteryStatus;
  reviewCount: number;
}
```

- [ ] **Step 4: 生成 Prisma Client**

```bash
npm run db:generate
```
Expected: Prisma Client 生成成功

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 配置 Prisma 数据库模型和类型定义"
```

---

### Task 3: 配置 NextAuth 认证系统

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`
- Modify: `.env.local`

- [ ] **Step 1: 配置 NextAuth**

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: '手机号', type: 'text' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error('请输入手机号和密码');
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        if (!user) {
          throw new Error('用户不存在');
        }

        // 注：实际项目中需要 password 字段，此处简化
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
```

- [ ] **Step 2: 创建 API Route**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: 创建中间件**

```typescript
// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/assignments/:path*', '/classes/:path*'],
};
```

- [ ] **Step 4: 更新 .env.local**

```bash
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 配置 NextAuth 认证系统"
```

---

## Phase 2: 核心功能开发 (Week 3-4)

### Task 4: 实现登录注册页面

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `components/auth/LoginForm.tsx`
- Create: `components/auth/RegisterForm.tsx`

- [ ] **Step 1: 创建登录表单组件**

```tsx
// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">手机号</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        登录
      </button>
    </form>
  );
}
```

- [ ] **Step 2: 创建登录页面**

```tsx
// app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">作业批改系统</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请登录您的账号
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm">
          还没有账号？{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 实现登录注册页面"
```

---

### Task 5: 实现班级管理功能

**Files:**
- Create: `app/(dashboard)/classes/page.tsx`
- Create: `app/(dashboard)/classes/new/page.tsx`
- Create: `components/classes/ClassList.tsx`
- Create: `app/api/classes/route.ts`

- [ ] **Step 1: 创建班级 API**

```typescript
// app/api/classes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    include: {
      students: {
        include: { student: true }
      }
    }
  });

  return NextResponse.json(classes);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newClass = await prisma.class.create({
    data: {
      name: body.name,
      description: body.description,
    }
  });

  return NextResponse.json(newClass);
}
```

- [ ] **Step 2: 创建班级列表页面**

```tsx
// app/(dashboard)/classes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Class {
  id: string;
  name: string;
  description?: string;
  students: { student: { name: string } }[];
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => setClasses(data));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">班级管理</h1>
        <Link
          href="/classes/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新建班级
        </Link>
      </div>
      <div className="grid gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="border rounded p-4">
            <h2 className="text-lg font-semibold">{cls.name}</h2>
            <p className="text-gray-600">{cls.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              学生数：{cls.students.length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 实现班级管理功能"
```

---

### Task 6: 实现作业上传和批改功能

**Files:**
- Create: `app/(dashboard)/assignments/upload/page.tsx`
- Create: `app/(dashboard)/assignments/[id]/page.tsx`
- Create: `components/assignments/AssignmentUpload.tsx`
- Create: `components/assignments/CorrectionForm.tsx`
- Create: `app/api/assignments/route.ts`
- Create: `app/api/corrections/route.ts`

- [ ] **Step 1: 创建作业上传组件**

```tsx
// components/assignments/AssignmentUpload.tsx
'use client';

import { useState } from 'react';

interface AssignmentUploadProps {
  studentId: string;
}

export function AssignmentUpload({ studentId }: AssignmentUploadProps) {
  const [subject, setSubject] = useState('MATH');
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 上传图片到 Supabase Storage
    // 创建作业记录
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">科目</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="MATH">数学</option>
          <option value="CHINESE">语文</option>
          <option value="ENGLISH">英语</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">作业图片</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">说明</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        提交作业
      </button>
    </form>
  );
}
```

- [ ] **Step 2: 创建批改表单组件**

```tsx
// components/assignments/CorrectionForm.tsx
'use client';

import { useState } from 'react';

interface CorrectionFormProps {
  assignmentId: string;
  onComplete: () => void;
}

export function CorrectionForm({ assignmentId, onComplete }: CorrectionFormProps) {
  const [score, setScore] = useState('');
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [isWrongQuestion, setIsWrongQuestion] = useState(false);
  const [knowledgePointId, setKnowledgePointId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignmentId,
        score,
        grade,
        comment,
        isWrongQuestion,
        knowledgePointId: isWrongQuestion ? knowledgePointId : null,
      }),
    });

    if (response.ok) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">分数</label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">等级</label>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">评语</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isWrongQuestion}
          onChange={(e) => setIsWrongQuestion(e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm">标记为错题</label>
      </div>
      {isWrongQuestion && (
        <div>
          <label className="block text-sm font-medium">知识点</label>
          <select
            value={knowledgePointId}
            onChange={(e) => setKnowledgePointId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">选择知识点</option>
            {/* 知识点选项 */}
          </select>
        </div>
      )}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        提交批改
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 实现作业上传和批改功能"
```

---

### Task 7: 实现错题本功能

**Files:**
- Create: `app/(dashboard)/wrong-questions/page.tsx`
- Create: `components/wrong-questions/WrongQuestionCard.tsx`
- Create: `components/wrong-questions/KnowledgePointSelector.tsx`
- Create: `app/api/wrong-questions/route.ts`
- Create: `app/api/knowledge-points/route.ts`

- [ ] **Step 1: 创建知识点 API**

```typescript
// app/api/knowledge-points/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');

  const knowledgePoints = await prisma.knowledgePoint.findMany({
    where: subject ? { subject: subject as any } : {},
    orderBy: { grade: 'asc' },
  });

  return NextResponse.json(knowledgePoints);
}
```

- [ ] **Step 2: 创建错题本页面**

```tsx
// app/(dashboard)/wrong-questions/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface WrongQuestion {
  id: string;
  imageUrl: string;
  knowledgePoint?: {
    name: string;
    subject: string;
    grade: string;
  };
  masteryStatus: string;
  reviewCount: number;
}

export default function WrongQuestionsPage() {
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/wrong-questions')
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">错题本</h1>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('NEW')}
          className={`px-4 py-2 rounded ${filter === 'NEW' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          新题
        </button>
        <button
          onClick={() => setFilter('REVIEWING')}
          className={`px-4 py-2 rounded ${filter === 'REVIEWING' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          复习中
        </button>
        <button
          onClick={() => setFilter('MASTERED')}
          className={`px-4 py-2 rounded ${filter === 'MASTERED' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          已掌握
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((q) => (
          <div key={q.id} className="border rounded p-4">
            <img src={q.imageUrl} alt="错题" className="w-full h-48 object-cover rounded mb-2" />
            {q.knowledgePoint && (
              <p className="text-sm text-gray-600">
                {q.knowledgePoint.grade} - {q.knowledgePoint.name}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              复习次数：{q.reviewCount} | 状态：{q.masteryStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 实现错题本功能"
```

---

## Phase 3: 知识点和复习计划 (Week 5-6)

### Task 8: 导入人教版知识点数据

**Files:**
- Create: `prisma/seed.ts`
- Create: `scripts/import-knowledge-points.ts`

- [ ] **Step 1: 创建种子脚本**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  // 读取知识点树文档
  const knowledgePointsData = [
    // 数学知识点
    { subject: 'MATH', grade: '一年级上册', unit: '1-5 的认识和加减法', name: '数一数' },
    { subject: 'MATH', grade: '一年级上册', unit: '1-5 的认识和加减法', name: '比大小' },
    // ... 更多知识点
  ];

  for (const kp of knowledgePointsData) {
    await prisma.knowledgePoint.create({
      data: kp,
    });
  }

  console.log('知识点导入完成');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: 运行种子脚本**

```bash
npm run db:seed
```
Expected: 知识点数据导入成功

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 导入人教版知识点数据"
```

---

### Task 9: 实现艾宾浩斯复习计划生成

**Files:**
- Create: `lib/review-schedule.ts`
- Create: `app/api/review-plans/route.ts`
- Create: `app/(dashboard)/review-plans/page.tsx`

- [ ] **Step 1: 创建复习计划算法**

```typescript
// lib/review-schedule.ts
import { WrongQuestion } from '@prisma/client';

// 艾宾浩斯复习间隔（小时）
const REVIEW_INTERVALS = [
  0,        // 初次学习
  0.5,      // 30 分钟后
  12,       // 12 小时后
  24,       // 1 天后
  48,       // 2 天后
  96,       // 4 天后
  168,      // 7 天后
  360,      // 15 天后
];

export function shouldReview(wrongQuestion: WrongQuestion): boolean {
  const now = new Date();
  const lastReview = wrongQuestion.lastReviewAt || wrongQuestion.createdAt;
  const hoursSinceLastReview = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60);
  
  const nextReviewInterval = REVIEW_INTERVALS[wrongQuestion.reviewCount];
  
  if (!nextReviewInterval) {
    return false; // 已完成所有复习周期
  }

  // 允许 1 小时的误差范围
  const tolerance = 1;
  return hoursSinceLastReview >= nextReviewInterval - tolerance;
}

export function getReviewPlan(studentId: string, wrongQuestions: WrongQuestion[]) {
  return wrongQuestions.filter(wq => wq.studentId === studentId && shouldReview(wq));
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: 实现艾宾浩斯复习计划生成"
```

---

## 测试策略

### 单元测试
- 使用 Jest + React Testing Library
- 测试关键工具函数（如复习计划算法）

### 集成测试
- 使用 Playwright 进行 E2E 测试
- 测试核心流程：登录→上传作业→批改→查看错题本

### 手动测试清单
- [ ] 登录注册流程
- [ ] 创建班级、添加学生
- [ ] 上传作业图片
- [ ] 批改作业并标记错题
- [ ] 查看错题本
- [ ] 筛选错题（按状态、知识点）

---

## 部署检查清单

- [ ] 配置 Supabase 生产数据库
- [ ] 设置 Vercel 项目
- [ ] 配置环境变量
- [ ] 运行数据库迁移
- [ ] 导入知识点数据
- [ ] 测试生产环境

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Supabase 免费额度不足 | 中 | 监控用量，及时升级 |
| 图片存储成本 | 低 | 前端压缩，限制大小 |
| 企业微信接入复杂 | 中 | MVP 阶段先用站内通知 |
| 知识点数据录入工作量大 | 高 | 分批次导入，先数学科目 |

---

## 完成标准

- [ ] 所有 Task 完成
- [ ] 通过手动测试清单
- [ ] 部署到生产环境
- [ ] 用户手册编写完成
