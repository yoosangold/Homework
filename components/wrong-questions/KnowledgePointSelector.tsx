'use client';

import { useEffect, useState } from 'react';

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
        <label className="block text-sm font-medium text-gray-700 mb-1">知识点</label>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">知识点</label>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="搜索知识点..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
        />
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">{placeholder}</option>
          {knowledgePoints.length === 0 ? (
            <option value="" disabled>暂无知识点</option>
          ) : (
            knowledgePoints.map((kp) => (
              <option key={kp.id} value={kp.id}>
                {kp.name} ({kp.code})
                {kp.parent && ` - ${kp.parent.name}`}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
