'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
}

interface AssignmentUploadProps {
  students?: Student[]
  onSuccess?: () => void
}

export default function AssignmentUpload({ students = [], onSuccess }: AssignmentUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'MATH' as 'MATH' | 'CHINESE' | 'ENGLISH',
    studentName: '',
    studentId: '',
    instruction: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const SUBJECT_OPTIONS = [
    { value: 'MATH', label: '数学' },
    { value: 'CHINESE', label: '语文' },
    { value: 'ENGLISH', label: '英语' },
  ]

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStudent = students.find(s => s.id === e.target.value)
    setFormData(prev => ({
      ...prev,
      studentId: selectedStudent?.id || '',
      studentName: selectedStudent?.name || prev.studentName,
    }))
  }

  const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      studentName: e.target.value,
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedFiles(prev => [...prev, ...files])

    // 创建预览
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...previews])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsUploading(true)

    try {
      // 上传图片（这里使用 Base64 编码，实际生产环境应该上传到对象存储）
      const imageUrls = await Promise.all(
        selectedFiles.map(file => fileToBase64(file))
      )

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '上传失败')
      }

      // 清空表单
      setFormData({
        title: '',
        description: '',
        subject: 'MATH',
        studentName: '',
        studentId: '',
        instruction: '',
      })
      setSelectedFiles([])
      setImagePreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onSuccess?.()
      router.push('/assignments')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 学生选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          学生
        </label>
        {students.length > 0 ? (
          <select
            value={formData.studentId}
            onChange={handleStudentChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            required
          >
            <option value="">选择学生</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={formData.studentName}
            onChange={handleStudentNameChange}
            placeholder="输入学生姓名"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            required
          />
        )}
      </div>

      {/* 科目选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          科目
        </label>
        <select
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          required
        >
          {SUBJECT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 作业标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          作业标题
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="例如：数学作业 - 第三章练习"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          required
        />
      </div>

      {/* 作业说明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          说明/备注
        </label>
        <textarea
          value={formData.instruction}
          onChange={(e) => setFormData(prev => ({ ...prev, instruction: e.target.value }))}
          placeholder="添加作业说明或备注..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* 图片上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          上传图片
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-1">点击或拖拽上传图片</p>
            <p className="text-sm text-gray-400">支持 JPG, PNG, GIF 格式</p>
          </div>
        </div>

        {/* 图片预览 */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isUploading || selectedFiles.length === 0}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? '上传中...' : '提交作业'}
      </button>
    </form>
  )
}
