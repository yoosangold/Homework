'use client';

interface SubjectStats {
  subject: string;
  total: number;
  completed: number;
}

interface ProgressTrackerProps {
  totalDue: number;
  completedToday: number;
  statsBySubject?: Record<string, SubjectStats>;
  date?: string;
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

const subjectColors: Record<string, string> = {
  MATH: 'bg-blue-500',
  CHINESE: 'bg-red-500',
  ENGLISH: 'bg-green-500',
};

export function ProgressTracker({
  totalDue,
  completedToday,
  statsBySubject,
  date,
}: ProgressTrackerProps) {
  const progress = totalDue > 0 ? Math.round((completedToday / totalDue) * 100) : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressLabel = (percentage: number) => {
    if (percentage === 100) return '太棒了！';
    if (percentage >= 80) return '继续加油！';
    if (percentage >= 50) return '已完成一半';
    if (percentage > 0) return '刚刚开始';
    return '开始复习吧';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">今日复习进度</h2>
        {date && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {date}
          </span>
        )}
      </div>

      {/* 总体进度 */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${getProgressColor(progress)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {completedToday} / {totalDue}
            </span>
          </div>
          <span className={`font-bold ${getProgressColor(progress)}`}>
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'} h-3 rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 text-center">
          {getProgressLabel(progress)}
        </p>
      </div>

      {/* 按科目统计 */}
      {statsBySubject && Object.keys(statsBySubject).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">按科目统计</h3>
          <div className="space-y-3">
            {Object.values(statsBySubject).map((stat) => {
              const subjectProgress = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
              return (
                <div key={stat.subject} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">
                    {subjectLabels[stat.subject] || stat.subject}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${subjectColors[stat.subject] || 'bg-gray-500'} h-2.5 rounded-full`}
                      style={{ width: `${subjectProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 w-24 text-right">
                    {stat.completed}/{stat.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
