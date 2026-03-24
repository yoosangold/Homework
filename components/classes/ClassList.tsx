'use client';

import Link from 'next/link';

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ClassListProps {
  classes: ClassItem[];
  onRefresh?: () => void;
}

export default function ClassList({ classes, onRefresh }: ClassListProps) {
  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">暂无班级</div>
        <div className="text-gray-500 text-sm">点击右上角"新建班级"创建第一个班级</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <Link
          key={cls.id}
          href={`/classes/${cls.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cls.grade}年级</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  {cls.studentCount} 名学生
                </span>
              </div>
              
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                创建于 {new Date(cls.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
