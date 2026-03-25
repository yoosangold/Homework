'use client';

import { useState, useEffect } from 'react';
import { ReviewPlanCard } from '@/components/review/ReviewPlanCard';
import { ProgressTracker } from '@/components/review/ProgressTracker';
import { MasteryChart } from '@/components/review/MasteryChart';

interface ReviewPlanItem {
  id: string;
  questionContent: string;
  subject: string;
  knowledgePointName: string;
  reviewCount: number;
  masteryLevel: number;
  isCompleted: boolean;
  completedAt: string | null;
  nextReviewAt: string | null;
  reviewPlanId: string;
}

interface ReviewPlanData {
  date: string;
  totalDue: number;
  completedToday: number;
  progress: number;
  statsBySubject: Record<string, { subject: string; total: number; completed: number }>;
  groupedBySubject: Record<string, ReviewPlanItem[]>;
  items: ReviewPlanItem[];
}

export default function ReviewPlansPage() {
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<ReviewPlanData | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchReviewPlan();
  }, []);

  const fetchReviewPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/review-plans/today');
      const data = await response.json();

      if (data.success) {
        setReviewData(data.data);
      }
    } catch (error) {
      console.error('获取复习计划失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (reviewPlanId: string) => {
    try {
      const response = await fetch(`/api/review-plans/${reviewPlanId}/complete`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert('已完成复习');
        fetchReviewPlan();
      } else {
        alert('更新失败：' + data.error);
      }
    } catch (error) {
      console.error('完成复习失败:', error);
      alert('更新失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!reviewData || reviewData.items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">复习计划</h1>
          <p className="text-gray-600 mt-1">基于艾宾浩斯记忆曲线的智能复习</p>
        </div>
        <div className="bg-white rounded-lg shadow py-12 text-center">
          <p className="text-gray-500">今日暂无复习任务</p>
          <p className="text-sm text-gray-400 mt-2">好好休息，明天继续！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">复习计划</h1>
        <p className="text-gray-600 mt-1">基于艾宾浩斯记忆曲线的智能复习</p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日应复习</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reviewData.totalDue}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{reviewData.completedToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">完成率</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reviewData.progress}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 进度追踪 */}
      <ProgressTracker stats={reviewData.statsBySubject} />

      {/* 掌握程度图表 */}
      <MasteryChart items={reviewData.items} />

      {/* 筛选标签 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部 ({reviewData.items.length})
        </button>
        <button
          onClick={() => setActiveTab('MATH')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'MATH'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          数学 ({reviewData.groupedBySubject.MATH?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('CHINESE')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'CHINESE'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          语文 ({reviewData.groupedBySubject.CHINESE?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('ENGLISH')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'ENGLISH'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          英语 ({reviewData.groupedBySubject.ENGLISH?.length || 0})
        </button>
      </div>

      {/* 复习列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'all' ? reviewData.items : (reviewData.groupedBySubject[activeTab] || [])).map((item) => (
          <ReviewPlanCard
            key={item.reviewPlanId}
            item={item}
            onComplete={() => handleComplete(item.reviewPlanId)}
          />
        ))}
      </div>
    </div>
  );
}
