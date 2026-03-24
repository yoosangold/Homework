'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AssignmentUpload from '@/components/assignments/AssignmentUpload'

interface Student {
  id: string
  name: string
}

export default function UploadAssignmentPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students')
      const result = await response.json()
      if (result.success) {
        setStudents(result.data)
      }
    } catch (err) {
      console.error('加载学生列表失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面头部 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/assignments" className="hover:text-blue-600">
            作业管理
          </Link>
          <span>/</span>
          <span className="text-gray-900">上传作业</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">上传作业</h1>
        <p className="mt-1 text-sm text-gray-500">
          选择学生、科目，上传作业图片
        </p>
      </div>

      {/* 上传表单 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载学生列表...</p>
          </div>
        ) : (
          <AssignmentUpload students={students} />
        )}
      </div>

      {/* 帮助提示 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支持上传多张图片，可以拍摄作业的每一页</li>
          <li>• 如果学生不在列表中，可以直接输入学生姓名</li>
          <li>• 上传后可以在作业列表页面进行批改</li>
        </ul>
      </div>
    </div>
  )
}
