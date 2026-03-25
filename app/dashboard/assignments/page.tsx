'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AssignmentCard from '@/components/assignments/AssignmentCard'

interface Assignment {
  id: string
  title: string
  subject: string
  studentName: string
  studentId: string
  status: string
  images?: string | null
  createdAt: string
  corrections?: {
    score?: number | null
    feedback?: string | null
  }[]
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')

  const SUBJECT_OPTIONS = [
    { value: '', label: '全部科目' },
    { value: 'MATH', label: '数学' },
    { value: 'CHINESE', label: '语文' },
    { value: 'ENGLISH', label: '英语' },
  ]

  const STATUS_OPTIONS = [
    { value: '', label: '全部状态' },
    { value: 'PENDING', label: '待批改' },
    { value: 'CORRECTED', label: '已完成' },
    { value: 'ARCHIVED', label: '已归档' },
  ]

  useEffect(() => {
    loadAssignments()
  }, [statusFilter, subjectFilter])

  const loadAssignments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (subjectFilter) params.append('subject', subjectFilter)

      const response = await fetch(`/api/assignments?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '加载失败')
      }

      setAssignments(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载作业列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作业管理</h1>
          <p className="mt-1 text-sm text-gray-500">上传、查看和批改学生作业</p>
        </div>
        <Link
          href="/assignments/upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          上传作业
        </Link>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态筛选
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              科目筛选
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SUBJECT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 作业列表 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无作业</h3>
          <p className="mt-1 text-sm text-gray-500">点击上方"上传作业"按钮添加第一个作业</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(assignment => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  )
}
