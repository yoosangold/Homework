'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MasteryStatusBadge } from './MasteryStatusBadge';
import { useRouter } from 'next/navigation';

interface WrongQuestion {
  id: string;
  questionContent: string;
  studentAnswer?: string | null;
  correctAnswer: string;
  errorType?: string | null;
  notes?: string | null;
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

interface WrongQuestionCardProps {
  question: WrongQuestion;
  onViewDetail?: () => void;
  onDelete?: () => void;
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

export function WrongQuestionCard({
  question,
  onViewDetail,
  onDelete,
}: WrongQuestionCardProps) {
  const router = useRouter();

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail();
    } else {
      router.push(`/wrong-questions/${question.id}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">
              {question.questionContent}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {subjectLabels[question.knowledgePoint.subject] || question.knowledgePoint.subject}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {question.knowledgePoint.name}
              </Badge>
              <MasteryStatusBadge status={question.masteryStatus || 'NEW'} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">学生:</span> {question.student.name}
            </div>
            <div>
              <span className="font-medium">时间:</span>{' '}
              {new Date(question.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>

        {question.errorType && (
          <div className="text-sm">
            <span className="font-medium text-red-600">错误类型:</span>{' '}
            {question.errorType}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleViewDetail}
          >
            查看详情
          </Button>
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              删除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
