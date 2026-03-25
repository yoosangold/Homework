'use client';

interface MasteryStatusBadgeProps {
  status: 'NEW' | 'REVIEWING' | 'MASTERED';
  className?: string;
}

const statusConfig = {
  NEW: {
    label: '新题',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  REVIEWING: {
    label: '复习中',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  MASTERED: {
    label: '已掌握',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
};

export function MasteryStatusBadge({ status, className = '' }: MasteryStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
}
