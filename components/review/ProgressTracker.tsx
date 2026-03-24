'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">今日复习进度</CardTitle>
          {date && (
            <Badge variant="outline" className="text-xs">
              {date}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总体进度 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className={`w-5 h-5 ${getProgressColor(progress)}`} />
              <span className="font-medium">
                {completedToday} / {totalDue}
              </span>
            </div>
            <span className={`font-bold ${getProgressColor(progress)}`}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {getProgressLabel(progress)}
          </p>
        </div>

        {/* 按科目统计 */}
        {statsBySubject && Object.keys(statsBySubject).length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              科目分布
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(statsBySubject).map((stats) => (
                <div
                  key={stats.subject}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${
                        stats.subject === 'MATH'
                          ? 'bg-blue-100 text-blue-800'
                          : stats.subject === 'CHINESE'
                          ? 'bg-red-100 text-red-800'
                          : stats.subject === 'ENGLISH'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subjectLabels[stats.subject] || stats.subject}
                    </Badge>
                    <span className="text-sm">
                      {stats.completed} / {stats.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        stats.total > 0
                          ? (stats.completed / stats.total) * 100
                          : 0
                      }
                      className="w-24 h-2"
                    />
                    <CheckCircle
                      className={`w-4 h-4 ${
                        stats.completed === stats.total
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 快速统计 */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">
              {totalDue - completedToday}
            </div>
            <div className="text-xs text-blue-600">待复习</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold text-green-600">
              {completedToday}
            </div>
            <div className="text-xs text-green-600">已完成</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
