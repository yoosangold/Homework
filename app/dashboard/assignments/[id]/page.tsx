'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import CorrectionForm from '@/components/assignments/CorrectionForm'

interface Assignment {
  id: string
  title: string
  description?: string | null
  subject: string
  teacherId: string
  studentName: string
  studentId: string
  instruction?: string | null
  images?: string | null
  status: string
  createdAt: string
  teacher?: {
    id: string
    name: string
  }
  corrections?: {
    id: string
    score?: number | null
    feedback?: string | null
    status: string
    correctedAt?: string | null
    reviewer?: {
      id: string
      name: string
    }
  }[]
}

const SUBJECT_LABELS: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待批改',
  CORRECTED: '已批改',
  ARCHIVED: '已归档',
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    loadAssignment()
  }, [assignmentId])

  const loadAssignment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '加载失败')
      }

      setAssignment(result.data)

      // 解析图片
      if (result.data.images) {
        try {
          const parsedImages = JSON.parse(result.data.images)
          setImages(Array.isArray(parsedImages) ? parsedImages : [])
        } catch (e) {
          console.error('解析图片失败:', e)
          setImages([])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载作业详情失败')
    } finally {
      setIsLoading(false)
    }
  }

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || '作业不存在'}
        </div>
        <Link href="/assignments" className="mt-4 inline-block text-blue-600 hover:underline">
          ← 返回作业列表
        </Link>
      </div>
    )
  }

  const latestCorrection = assignment.corrections?.[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/assignments" className="hover:text-blue-600">
          作业管理
        </Link>
        <span>/</span>
        <span className="text-gray-900">{assignment.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：作业图片 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">作业图片</h2>

            {images.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">暂无图片</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={images[currentImageIndex]}
                  alt={`作业图片 ${currentImageIndex + 1}`}
                  className="w-full h-auto rounded-lg"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`缩略图 ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 作业信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">作业信息</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">标题</dt>
                <dd className="text-gray-900">{assignment.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">学生</dt>
                <dd className="text-gray-900">{assignment.studentName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">科目</dt>
                <dd className="text-gray-900">{SUBJECT_LABELS[assignment.subject] || assignment.subject}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">状态</dt>
                <dd className="text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    assignment.status === 'CORRECTED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {STATUS_LABELS[assignment.status] || assignment.status}
                  </span>
                </dd>
              </div>
              {assignment.instruction && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">说明</dt>
                  <dd className="text-gray-900">{assignment.instruction}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">提交时间</dt>
                <dd className="text-gray-900">
                  {new Date(assignment.createdAt).toLocaleString('zh-CN')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 右侧：批改表单 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">批改作业</h2>
            <CorrectionForm
              assignmentId={assignment.id}
              studentId={assignment.studentId}
              subject={assignment.subject}
              onSuccess={() => {
                loadAssignment()
              }}
            />
          </div>

          {/* 批改历史 */}
          {latestCorrection && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">批改记录</h2>
              <dl className="space-y-3">
                {latestCorrection.score !== null && latestCorrection.score !== undefined && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">得分</dt>
                    <dd className="text-gray-900 font-semibold">{latestCorrection.score}分</dd>
                  </div>
                )}
                {latestCorrection.feedback && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">评语</dt>
                    <dd className="text-gray-900">{latestCorrection.feedback}</dd>
                  </div>
                )}
                {latestCorrection.reviewer && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">批改老师</dt>
                    <dd className="text-gray-900">{latestCorrection.reviewer.name}</dd>
                  </div>
                )}
                {latestCorrection.correctedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">批改时间</dt>
                    <dd className="text-gray-900">
                      {new Date(latestCorrection.correctedAt).toLocaleString('zh-CN')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
