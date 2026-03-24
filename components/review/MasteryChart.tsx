'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp } from 'lucide-react';

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

  // 按掌握程度排序的知识点（前 10 个）
  const topKnowledgePoints = [...items]
    .sort((a, b) => b.masteryLevel - a.masteryLevel)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 掌握程度分布 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            掌握程度分布
          </h4>
          <div className="space-y-2">
            {distribution.map((range) => (
              <div key={range.label} className="flex items-center gap-3">
                <div className={`w-20 text-xs ${range.color}`}>{range.label}</div>
                <div className={`flex-1 h-6 ${range.bg} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${range.color.replace('text', 'bg')} transition-all duration-500`}
                    style={{
                      width: `${items.length > 0 ? (range.count / items.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="w-12 text-xs text-right text-muted-foreground">
                  {range.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 按科目平均掌握程度 */}
        {Object.keys(subjectStats).length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">科目平均掌握程度</h4>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(subjectStats).map((stat) => (
                <div key={stat.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{stat.name}</span>
                    <span className="font-medium">{stat.average}%</span>
                  </div>
                  <Progress value={stat.average} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 掌握程度最高的知识点 */}
        {topKnowledgePoints.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">知识点掌握排行</h4>
            <div className="space-y-2">
              {topKnowledgePoints.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="w-6 text-center text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.knowledgePointName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {subjectLabels[item.subject]} · {item.reviewCount}次复习
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      item.masteryLevel >= 80
                        ? 'bg-green-100 text-green-800'
                        : item.masteryLevel >= 60
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.masteryLevel}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            暂无数据，开始复习后这里会显示掌握程度分析
          </div>
        )}
      </CardContent>
    </Card>
  );
}
