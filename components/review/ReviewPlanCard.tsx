'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, RotateCcw } from 'lucide-react';

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

  const getReviewCountLabel = (count: number) => {
    if (count === 0) return '新题';
    return `第${count + 1}次复习`;
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
    <Card className={`hover:shadow-md transition-shadow ${item.isCompleted ? 'bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-base line-clamp-2">
              {item.questionContent}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={subjectColors[item.subject] || 'bg-gray-100 text-gray-800'}
              >
                {subjectLabels[item.subject] || item.subject}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {item.knowledgePointName}
              </Badge>
              <Badge
                variant={item.isCompleted ? 'default' : 'outline'}
                className="text-xs"
              >
                {getReviewCountLabel(item.reviewCount)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 掌握程度 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">掌握程度</span>
            <span className={`font-medium ${getMasteryColor(item.masteryLevel)}`}>
              {item.masteryLevel}%
            </span>
          </div>
          <Progress value={item.masteryLevel} className="h-2" />
        </div>

        {/* 下次复习时间 */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">下次复习:</span>
          <span className={item.isCompleted ? 'text-green-600' : 'text-orange-600'}>
            {formatNextReview(item.nextReviewAt)}
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          {item.isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onReview?.(item.id)}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              重新复习
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onMarkComplete?.(item.reviewPlanId)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              标记完成
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
