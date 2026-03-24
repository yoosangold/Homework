// ==================== 角色类型 ====================

export type Role = 'ADMIN' | 'HEAD_TEACHER' | 'TEACHER' | 'PARENT' | 'STUDENT'

export const ROLES = {
  ADMIN: 'ADMIN' as Role,
  HEAD_TEACHER: 'HEAD_TEACHER' as Role,
  TEACHER: 'TEACHER' as Role,
  PARENT: 'PARENT' as Role,
  STUDENT: 'STUDENT' as Role,
}

// ==================== 学科类型 ====================

export type Subject = 'MATH' | 'CHINESE' | 'ENGLISH'

export const SUBJECTS = {
  MATH: 'MATH' as Subject,
  CHINESE: 'CHINESE' as Subject,
  ENGLISH: 'ENGLISH' as Subject,
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
}

// ==================== 用户相关类型 ====================

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  name: string
  password: string
  role?: Role
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: Role
}

// ==================== 班级相关类型 ====================

export interface Class {
  id: string
  name: string
  grade: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateClassInput {
  name: string
  grade: number
}

export interface ClassStudent {
  id: string
  userId: string
  classId: string
  enrolledAt: Date
  isActive: boolean
}

export interface ClassTeacher {
  id: string
  userId: string
  classId: string
  role: string
  assignedAt: Date
}

// ==================== 作业相关类型 ====================

export interface Assignment {
  id: string
  title: string
  description?: string | null
  subject: Subject
  teacherId: string
  classId?: string | null
  dueDate: Date
  images?: string | null // JSON 数组，存储图片 URL
  studentName?: string | null
  studentId?: string | null
  instruction?: string | null
  status: string // PENDING, CORRECTED, ARCHIVED
  createdAt: Date
  updatedAt: Date
}

export interface CreateAssignmentInput {
  title: string
  description?: string
  subject: Subject
  teacherId: string
  classId?: string
  dueDate: Date
  images?: string[]
  studentName: string
  studentId?: string
  instruction?: string
}

export interface UpdateAssignmentInput {
  title?: string
  description?: string
  subject?: Subject
  dueDate?: Date
  images?: string[]
  instruction?: string
  status?: string
}

// ==================== 批改相关类型 ====================

export type CorrectionStatus = 'PENDING' | 'CORRECTED' | 'REVIEWED'

export interface Correction {
  id: string
  assignmentId: string
  studentId: string
  status: CorrectionStatus
  score?: number | null
  feedback?: string | null
  correctedAt?: Date | null
  reviewedAt?: Date | null
  reviewerId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateCorrectionInput {
  assignmentId: string
  studentId: string
  score?: number
  feedback?: string
}

export interface UpdateCorrectionInput {
  status?: CorrectionStatus
  score?: number
  feedback?: string
  reviewerId?: string
}

// ==================== 知识点相关类型 ====================

export interface KnowledgePoint {
  id: string
  name: string
  code: string
  subject: Subject
  parentId?: string | null
  depth: number
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateKnowledgePointInput {
  name: string
  code: string
  subject: Subject
  parentId?: string
  description?: string
}

// ==================== 错题相关类型 ====================

export interface WrongQuestion {
  id: string
  studentId: string
  knowledgePointId: string
  questionContent: string
  studentAnswer?: string | null
  correctAnswer: string
  errorType?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateWrongQuestionInput {
  studentId: string
  knowledgePointId: string
  questionContent: string
  studentAnswer?: string
  correctAnswer: string
  errorType?: string
  notes?: string
}

// ==================== API 响应类型 ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
