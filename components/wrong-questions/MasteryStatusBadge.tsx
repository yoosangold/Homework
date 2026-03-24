'use client';

import { Badge } from '@/components/ui/badge';

interface MasteryStatusBadgeProps {
  status: 'NEW' | 'REVIEWING' | 'MASTERED';
  className?: string;
}

const statusConfig = {
  NEW: {
    label: '新题',
    variant: 'default' as const,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  REVIEWING: {
    label: '复习中',
    variant: 'secondary' as const,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  MASTERED: {
    label: '已掌握',
    variant: 'outline' as const,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
};

export function MasteryStatusBadge({ status, className = '' }: MasteryStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={`${config.color} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
