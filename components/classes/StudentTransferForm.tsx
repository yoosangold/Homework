'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  enrolledAt: string;
}

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
}

interface StudentTransferFormProps {
  student: Student;
  currentClassId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function StudentTransferForm({
  student,
  currentClassId,
  onSuccess,
  onClose,
}: StudentTransferFormProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [targetClassId, setTargetClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState('');

  // 获取班级列表
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        
        if (res.ok) {
          // 过滤掉当前班级
          const otherClasses = data.classes.filter(
            (c: ClassItem) => c.id !== currentClassId
          );
          setClasses(otherClasses);
          
          // 如果有其他班级，默认选择第一个
          if (otherClasses.length > 0) {
            setTargetClassId(otherClasses[0].id);
          }
        }
      } catch (err) {
        console.error('获取班级列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [currentClassId]);

  // 执行调班
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetClassId) {
      setError('请选择目标班级');
      return;
    }

    setTransferring(true);
    setError('');

    try {
      const res = await fetch('/api/students/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: student.userId,
          targetClassId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '调班失败');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '调班失败');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">学生调班</h2>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">学生：</span>
            {student.name}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">当前班级：</span>
            {currentClassId}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="targetClass" className="block text-sm font-medium text-gray-700 mb-1">
              目标班级
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">加载中...</div>
            ) : classes.length === 0 ? (
              <div className="text-sm text-red-600">
                没有其他可调入的班级
              </div>
            ) : (
              <select
                id="targetClass"
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount}名学生)
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || classes.length === 0 || transferring}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transferring ? '调班中...' : '确认调班'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
