'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface KnowledgePoint {
  id: string
  name: string
  code: string
  subject: string
}

interface CorrectionFormProps {
  assignmentId: string
  studentId: string
  subject: string
  onSuccess?: () => void
}

export default function CorrectionForm({ assignmentId, studentId, subject, onSuccess }: CorrectionFormProps) {
  const router = useRouter()
  const [score, setScore] = useState<number | ''>('')
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const [questionContent, setQuestionContent] = useState('')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [errorType, setErrorType] = useState('')
  const [selectedKnowledgePoints, setSelectedKnowledgePoints] = useState<string[]>([])
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const GRADE_OPTIONS = [
    { value: 'A', label: 'A (优秀)' },
    { value: 'B', label: 'B (良好)' },
    { value: 'C', label: 'C (中等)' },
    { value: 'D', label: 'D (及格)' },
    { value: 'F', label: 'F (不及格)' },
  ]

  const ERROR_TYPE_OPTIONS = [
    { value: '概念理解错误', label: '概念理解错误' },
    { value: '计算错误', label: '计算错误' },
    { value: '审题错误', label: '审题错误' },
    { value: '公式应用错误', label: '公式应用错误' },
    { value: '其他', label: '其他' },
  ]

  // 加载知识点
  useEffect(() => {
    const loadKnowledgePoints = async () => {
      try {
        const response = await fetch(`/api/knowledge-points?subject=${subject}`)
        const result = await response.json()
        if (result.success) {
          setKnowledgePoints(result.data)
        }
      } catch (err) {
        console.error('加载知识点失败:', err)
      }
    }

    if (subject) {
      loadKnowledgePoints()
    }
  }, [subject])

  const handleKnowledgePointToggle = (id: string) => {
    setSelectedKnowledgePoints(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/corrections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          studentId,
          score: score === '' ? null : Number(score),
          grade: grade || null,
          feedback: feedback || null,
          isWrong,
          knowledgePointIds: isWrong ? selectedKnowledgePoints : [],
          questionContent: isWrong ? questionContent : null,
          studentAnswer: isWrong ? studentAnswer : null,
          correctAnswer: isWrong ? correctAnswer : null,
          errorType: isWrong ? errorType : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '提交批改失败')
      }

      // 清空表单
      setScore('')
      setGrade('')
      setFeedback('')
      setIsWrong(false)
      setQuestionContent('')
      setStudentAnswer('')
      setCorrectAnswer('')
      setErrorType('')
      setSelectedKnowledgePoints([])

      onSuccess?.()
      router.push('/assignments')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交批改失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 分数和等级 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分数
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0-100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            等级
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">选择等级</option>
            {GRADE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 评语 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          评语
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="写下对学生的评价和建议..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 标记错题 */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="isWrong"
            checked={isWrong}
            onChange={(e) => setIsWrong(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isWrong" className="ml-2 text-sm font-medium text-gray-700">
            标记为错题
          </label>
        </div>

        {isWrong && (
          <div className="space-y-4 pl-6">
            {/* 题目内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                题目内容
              </label>
              <textarea
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                placeholder="描述题目内容..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={isWrong}
              />
            </div>

            {/* 学生答案和正确答案 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学生答案
                </label>
                <textarea
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="学生的答案..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  正确答案
                </label>
                <textarea
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="正确答案..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={isWrong}
                />
              </div>
            </div>

            {/* 错误类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                错误类型
              </label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择错误类型</option>
                {ERROR_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 知识点选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关联知识点
              </label>
              <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                {knowledgePoints.length === 0 ? (
                  <p className="text-sm text-gray-500">暂无知识点</p>
                ) : (
                  <div className="space-y-2">
                    {knowledgePoints.map(kp => (
                      <label key={kp.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedKnowledgePoints.includes(kp.id)}
                          onChange={() => handleKnowledgePointToggle(kp.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {kp.name} ({kp.code})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                选择相关的知识点，帮助学生针对性复习
              </p>
            </div>
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
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '提交中...' : '提交批改'}
      </button>
    </form>
  )
}
