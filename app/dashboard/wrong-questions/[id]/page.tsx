'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MasteryStatusBadge } from '@/components/wrong-questions/MasteryStatusBadge';

interface WrongQuestion {
  id: string;
  questionContent: string;
  studentAnswer?: string | null;
  correctAnswer: string;
  errorType?: string | null;
  notes?: string | null;
  masteryStatus?: 'NEW' | 'REVIEWING' | 'MASTERED';
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
  };
  knowledgePoint: {
    id: string;
    name: string;
    code: string;
    subject: string;
  };
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

export default function WrongQuestionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [question, setQuestion] = useState<WrongQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [masteryStatus, setMasteryStatus] = useState<'NEW' | 'REVIEWING' | 'MASTERED'>('NEW');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchQuestion(params.id as string);
    }
  }, [params.id]);

  const fetchQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/wrong-questions/${id}`);
      const data = await response.json();

      if (data.success) {
        setQuestion(data.data);
        setMasteryStatus(data.data.masteryStatus || 'NEW');
        setNotes(data.data.notes || '');
      } else {
        alert('加载失败：' + (data.error || '无法获取错题详情'));
        router.push('/dashboard/wrong-questions');
      }
    } catch (error) {
      console.error('获取错题详情失败:', error);
      alert('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/wrong-questions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masteryStatus,
          notes,
        }),
      });
      const data = await response.json();

      if (data.success) {
        alert('更新成功');
        setEditing(false);
        fetchQuestion(params.id as string);
      } else {
        alert('更新失败：' + data.error);
      }
    } catch (error) {
      console.error('更新错题失败:', error);
      alert('更新失败，请稍后重试');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        错题不存在
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回
      </button>

      {/* 错题详情 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">错题详情</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>学生：{question.student.name}</span>
              <span>科目：{subjectLabels[question.knowledgePoint.subject]}</span>
              <span>
                知识点：{question.knowledgePoint.name} ({question.knowledgePoint.code})
              </span>
            </div>
          </div>
          <MasteryStatusBadge status={question.masteryStatus || 'NEW'} />
        </div>

        {/* 题目内容 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">题目内容</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
            {question.questionContent}
          </div>
        </div>

        {/* 学生答案和正确答案 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">学生答案</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-gray-900 min-h-[80px]">
              {question.studentAnswer || '未填写'}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">正确答案</h3>
            <div className="bg-green-50 rounded-lg p-3 text-green-900 min-h-[80px]">
              {question.correctAnswer}
            </div>
          </div>
        </div>

        {/* 错误类型 */}
        {question.errorType && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">错误类型</h3>
            <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              {question.errorType}
            </div>
          </div>
        )}

        {/* 备注 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">备注</h3>
          {editing ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
              {notes || '暂无备注'}
            </div>
          )}
        </div>

        {/* 掌握状态 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">掌握状态</h3>
          {editing ? (
            <select
              value={masteryStatus}
              onChange={(e) => setMasteryStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="NEW">新题</option>
              <option value="REVIEWING">复习中</option>
              <option value="MASTERED">已掌握</option>
            </select>
          ) : (
            <MasteryStatusBadge status={masteryStatus} />
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {updating ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setNotes(question.notes || '');
                  setMasteryStatus(question.masteryStatus || 'NEW');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                取消
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              编辑
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
