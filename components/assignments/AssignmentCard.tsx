'use client'

import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  subject: string
  studentName: string
  status: string
  images?: string | null
  createdAt: string
  corrections?: {
    score?: number | null
    feedback?: string | null
  }[]
}

interface AssignmentCardProps {
  assignment: Assignment
}

const SUBJECT_COLORS: Record<string, string> = {
  MATH: 'bg-blue-100 text-blue-800',
  CHINESE: 'bg-red-100 text-red-800',
  ENGLISH: 'bg-green-100 text-green-800',
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

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CORRECTED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const hasImages = assignment.images && JSON.parse(assignment.images).length > 0
  const isCorrected = assignment.status === 'CORRECTED'
  const latestCorrection = assignment.corrections?.[0]

  return (
    <Link href={`/assignments/${assignment.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {assignment.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>👤 {assignment.studentName}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${SUBJECT_COLORS[assignment.subject] || 'bg-gray-100 text-gray-800'}`}>
            {SUBJECT_LABELS[assignment.subject] || assignment.subject}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[assignment.status] || 'bg-gray-100 text-gray-800'}`}>
              {STATUS_LABELS[assignment.status] || assignment.status}
            </span>
            {hasImages && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {JSON.parse(assignment.images!).length} 张图片
              </span>
            )}
          </div>

          <div className="text-sm text-gray-500">
            {new Date(assignment.createdAt).toLocaleDateString('zh-CN')}
          </div>
        </div>

        {isCorrected && latestCorrection && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {latestCorrection.score !== null && latestCorrection.score !== undefined && (
                  <span className="text-sm font-medium text-gray-700">
                    得分：{latestCorrection.score}分
                  </span>
                )}
                {latestCorrection.feedback && (
                  <span className="text-xs text-gray-500 truncate max-w-xs">
                    💬 {latestCorrection.feedback}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
