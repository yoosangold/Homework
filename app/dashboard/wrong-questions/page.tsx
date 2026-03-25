'use client';

import { useState, useEffect } from 'react';
import { WrongQuestionCard } from '@/components/wrong-questions/WrongQuestionCard';
import { useRouter } from 'next/navigation';

interface WrongQuestion {
  id: string;
  questionContent: string;
  studentAnswer?: string | null;
  correctAnswer: string;
  errorType?: string | null;
  notes?: string | null;
  masteryStatus?: 'NEW' | 'REVIEWING' | 'MASTERED';
  createdAt: string;
  student: {
    id: string;
    name: string;
    phone: string;
  };
  knowledgePoint: {
    id: string;
    name: string;
    code: string;
    subject: string;
  };
}

export default function WrongQuestionsPage() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [masteryStatus, setMasteryStatus] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, [subject, masteryStatus]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (subject !== 'all') {
        params.set('subject', subject);
      }
      if (masteryStatus !== 'all') {
        params.set('masteryStatus', masteryStatus);
      }

      const response = await fetch(`/api/wrong-questions?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('获取错题列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这道错题吗？')) return;

    try {
      const response = await fetch(`/api/wrong-questions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchQuestions();
      } else {
        alert('删除失败：' + (data.error || '请稍后重试'));
      }
    } catch (error) {
      console.error('删除错题失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.questionContent.toLowerCase().includes(search.toLowerCase()) ||
      q.knowledgePoint.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">错题本</h1>
          <p className="text-gray-600 mt-1">
            管理和复习学生的错题记录
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/wrong-questions/new')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加错题
        </button>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          筛选条件
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="题目或知识点..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">全部科目</option>
              <option value="MATH">数学</option>
              <option value="CHINESE">语文</option>
              <option value="ENGLISH">英语</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">掌握状态</label>
            <select
              value={masteryStatus}
              onChange={(e) => setMasteryStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">全部状态</option>
              <option value="NEW">新题</option>
              <option value="REVIEWING">复习中</option>
              <option value="MASTERED">已掌握</option>
            </select>
          </div>
        </div>
      </div>

      {/* 错题列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow py-12 text-center">
          <p className="text-gray-500">暂无错题记录</p>
          <p className="text-sm text-gray-400 mt-2">
            {search || subject !== 'all' || masteryStatus !== 'all'
              ? '尝试调整筛选条件'
              : '开始添加第一道错题吧'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => (
            <WrongQuestionCard
              key={question.id}
              question={question}
              onDelete={() => handleDelete(question.id)}
            />
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {!loading && questions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>共 {questions.length} 道错题</span>
            <span>显示 {filteredQuestions.length} 道</span>
          </div>
        </div>
      )}
    </div>
  );
}
