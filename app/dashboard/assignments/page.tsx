'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  phone: string;
}

interface Assignment {
  id: string;
  title: string;
  studentName: string;
  subject: string;
  status: string;
  createdAt: string;
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

export default function AssignmentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 获取当前老师的班级学生列表
    // 这里用模拟数据
    setStudents([
      { id: '1', name: '张三', phone: '13800138000' },
      { id: '2', name: '李四', phone: '13800138001' },
      { id: '3', name: '王五', phone: '13800138002' },
    ]);
    setLoading(false);
  }, []);

  const handleQuickUpload = (studentId: string) => {
    setSelectedStudent(studentId);
    router.push('/dashboard/assignments/upload');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">作业管理</h1>
          <p className="text-gray-600 mt-1">上传作业并自动分析错题知识点</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/assignments/upload')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          上传作业
        </button>
      </div>

      {/* 学生列表 - 快速上传 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">我的学生</h2>
        {loading ? (
          <div className="text-gray-500">加载中...</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500">暂无学生</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
                onClick={() => handleQuickUpload(student.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.phone}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 作业列表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">作业记录</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  作业标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  学生
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  科目
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  上传时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    暂无作业记录
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {assignment.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {assignment.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {subjectLabels[assignment.subject] || assignment.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(assignment.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        已完成
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        查看
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        导出错题
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
