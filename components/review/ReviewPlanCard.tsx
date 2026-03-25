'use client';

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

interface ReviewPlanCardProps {
  item: ReviewPlanItem;
  onMarkComplete?: (reviewPlanId: string) => void;
  onReview?: (questionId: string) => void;
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

const subjectColors: Record<string, string> = {
  MATH: 'bg-blue-100 text-blue-800',
  CHINESE: 'bg-red-100 text-red-800',
  ENGLISH: 'bg-green-100 text-green-800',
};

export function ReviewPlanCard({
  item,
  onMarkComplete,
  onReview,
}: ReviewPlanCardProps) {
  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNextReview = (nextReviewAt: string | null) => {
    if (!nextReviewAt) return '待安排';
    const date = new Date(nextReviewAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 0) {
      return '已过期';
    } else if (diffMinutes < 1) {
      return '立即';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟后`;
    } else if (diffHours < 24) {
      return `${diffHours}小时后`;
    } else {
      return `${diffDays}天后`;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 ${item.isCompleted ? 'border-2 border-green-500' : ''}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
              {item.questionContent}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subjectColors[item.subject] || 'bg-gray-100 text-gray-800'}`}>
                {subjectLabels[item.subject] || item.subject}
              </span>
              <span className="text-xs text-gray-600 truncate max-w-[150px]">
                {item.knowledgePointName}
              </span>
            </div>
          </div>
          {item.isCompleted && (
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* 掌握程度 */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-600">掌握程度</span>
            <span className={`font-medium ${getMasteryColor(item.masteryLevel)}`}>
              {item.masteryLevel}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`${item.masteryLevel >= 80 ? 'bg-green-500' : item.masteryLevel >= 50 ? 'bg-yellow-500' : 'bg-red-500'} h-1.5 rounded-full`}
              style={{ width: `${item.masteryLevel}%` }}
            ></div>
          </div>
        </div>

        {/* 复习信息 */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{item.reviewCount === 0 ? '新题' : `第${item.reviewCount + 1}次`}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatNextReview(item.nextReviewAt)}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        {!item.isCompleted && (
          <div className="pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onMarkComplete) {
                  onMarkComplete(item.reviewPlanId);
                }
              }}
              className="w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              完成复习
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
