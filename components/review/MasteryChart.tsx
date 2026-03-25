'use client';

interface MasteryItem {
  id: string;
  knowledgePointName: string;
  subject: string;
  masteryLevel: number;
  reviewCount: number;
}

interface MasteryChartProps {
  items?: MasteryItem[];
  title?: string;
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

export function MasteryChart({ items = [], title = '掌握程度分析' }: MasteryChartProps) {
  if (items.length === 0) {
    return null;
  }

  // 按掌握程度分组统计
  const masteryRanges = [
    { label: '未掌握', min: 0, max: 20, color: 'text-red-600', bg: 'bg-red-100' },
    { label: '初步了解', min: 20, max: 40, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: '基本掌握', min: 40, max: 60, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: '良好', min: 60, max: 80, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '完全掌握', min: 80, max: 100, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const distribution = masteryRanges.map((range) => ({
    ...range,
    count: items.filter(
      (item) => item.masteryLevel >= range.min && item.masteryLevel < range.max
    ).length,
  }));

  // 按科目统计平均掌握程度
  const subjectStats: Record<
    string,
    { name: string; total: number; count: number; average: number }
  > = {};

  items.forEach((item) => {
    if (!subjectStats[item.subject]) {
      subjectStats[item.subject] = {
        name: subjectLabels[item.subject] || item.subject,
        total: 0,
        count: 0,
        average: 0,
      };
    }
    subjectStats[item.subject].total += item.masteryLevel;
    subjectStats[item.subject].count++;
  });

  Object.values(subjectStats).forEach((stat) => {
    stat.average = stat.count > 0 ? Math.round(stat.total / stat.count) : 0;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {title}
      </h2>

      {/* 掌握程度分布 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">掌握程度分布</h3>
        <div className="flex gap-2">
          {distribution.map((range) => (
            <div key={range.label} className="flex-1 text-center">
              <div className={`text-2xl font-bold ${range.color}`}>{range.count}</div>
              <div className="text-xs text-gray-600">{range.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 按科目统计 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">按科目统计</h3>
        <div className="space-y-3">
          {Object.values(subjectStats).map((stat) => (
            <div key={stat.name} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-16">{stat.name}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`${subjectColors[Object.keys(subjectStats).find(key => subjectStats[key] === stat)] || 'bg-gray-500'} h-2.5 rounded-full`}
                  style={{ width: `${stat.average}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-900 w-12 text-right">{stat.average}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 掌握最好的知识点 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          掌握最好的知识点
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[...items]
            .sort((a, b) => b.masteryLevel - a.masteryLevel)
            .slice(0, 6)
            .map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-900 truncate flex-1">{item.knowledgePointName}</span>
                <span className="text-xs text-gray-500">{item.masteryLevel}%</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
