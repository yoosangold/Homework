'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface KnowledgePoint {
  id: string;
  name: string;
  code: string;
  subject: string;
  parent?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface KnowledgePointSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  subject?: string;
  placeholder?: string;
  className?: string;
}

export function KnowledgePointSelector({
  value,
  onChange,
  subject,
  placeholder = '选择知识点',
  className = '',
}: KnowledgePointSelectorProps) {
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchKnowledgePoints = async () => {
      try {
        const params = new URLSearchParams();
        if (subject) {
          params.set('subject', subject);
        }
        if (search) {
          params.set('search', search);
        }

        const response = await fetch(`/api/knowledge-points?${params}`);
        const data = await response.json();

        if (data.success) {
          setKnowledgePoints(data.data);
        }
      } catch (error) {
        console.error('获取知识点失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchKnowledgePoints, 300);
    return () => clearTimeout(debounceTimer);
  }, [subject, search]);

  if (loading) {
    return (
      <div className={className}>
        <Label>知识点</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className={className}>
      <Label>知识点</Label>
      <div className="space-y-2">
        <Input
          placeholder="搜索知识点..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {knowledgePoints.length === 0 ? (
              <SelectItem value="none" disabled>
                暂无知识点
              </SelectItem>
            ) : (
              knowledgePoints.map((kp) => (
                <SelectItem key={kp.id} value={kp.id}>
                  {kp.name} ({kp.code})
                  {kp.parent && ` - ${kp.parent.name}`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
