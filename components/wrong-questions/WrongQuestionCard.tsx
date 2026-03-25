'use client';

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
      router.push(`/dashboard/wrong-questions/${question.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4"
      onClick={handleViewDetail}
    >
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
            {question.questionContent}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {subjectLabels[question.knowledgePoint.subject] || question.knowledgePoint.subject}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {question.knowledgePoint.name}
            </span>
            <MasteryStatusBadge status={question.masteryStatus || 'NEW'} />
          </div>
        </div>

        <div className="text-sm text-gray-600">
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
          <button
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail();
            }}
          >
            查看详情
          </button>
          {onDelete && (
            <button
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              删除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
