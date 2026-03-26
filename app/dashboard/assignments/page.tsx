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
  studentId: string;
  subject: string;
  status: string;
  createdAt: string;
  wrongQuestionCount?: number;
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

export default function AssignmentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchAssignments();
  }, []);

  // 获取班级学生列表
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      
      if (response.ok && data.classes) {
        const allStudents: Student[] = [];
        data.classes.forEach((cls: any) => {
          if (cls.students) {
            cls.students.forEach((student: any) => {
              allStudents.push({
                id: student.id,
                name: student.name,
                phone: student.phone || '',
              });
            });
          }
        });
        setStudents(allStudents);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取作业列表
  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok && data.data) {
        // 为每个作业获取错题数量
        const assignmentsWithCount = await Promise.all(
          data.data.map(async (assignment: any) => {
            try {
              const wrongQuestionsRes = await fetch(
                `/api/wrong-questions?studentId=${assignment.studentId}&assignmentId=${assignment.id}`
              );
              const wrongQuestionsData = await wrongQuestionsRes.json();
              return {
                ...assignment,
                wrongQuestionCount: wrongQuestionsData.data?.length || 0,
              };
            } catch {
              return { ...assignment, wrongQuestionCount: 0 };
            }
          })
        );
        setAssignments(assignmentsWithCount);
      } else if (data.error) {
        console.error('获取作业失败:', data.error);
      }
    } catch (error) {
      console.error('获取作业列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpload = (studentId: string, studentName: string) => {
    sessionStorage.setItem('selectedStudent', JSON.stringify({
      id: studentId,
      name: studentName,
    }));
    router.push('/dashboard/assignments/upload');
  };

  const handleViewAssignment = (assignmentId: string) => {
    router.push(`/dashboard/assignments/${assignmentId}`);
  };

  const handlePreviewWrongQuestions = (studentId: string, studentName: string, assignmentId: string) => {
    router.push(`/dashboard/wrong-questions/preview?studentId=${studentId}&studentName=${studentName}&assignmentId=${assignmentId}`);
  };

  const handleDeleteAssignment = async (assignmentId: string, assignmentTitle: string) => {
    if (!confirm(`确定要删除作业"${assignmentTitle}"吗？删除后不可恢复！`)) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('作业已删除');
        fetchAssignments();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除作业失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleAutoCorrect = async (assignmentId: string) => {
    if (!confirm('确定要启动 AI 自动批改吗？系统将智能分析作业并识别错题。')) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/auto-correct`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ 自动批改完成！\n得分：${data.data.correction.score}分\n错题数：${data.data.wrongQuestionCount}道\n\n${data.data.correction.feedback}`);
        fetchAssignments();
      } else {
        alert(data.error || '批改失败');
      }
    } catch (error) {
      console.error('自动批改失败:', error);
      alert('批改失败，请稍后重试');
    }
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
          <div className="text-gray-500 py-8 text-center">
            <p>暂无学生</p>
            <p className="text-sm mt-2">
              请先在 <a href="/dashboard/classes" className="text-blue-600 hover:underline">班级管理</a> 中添加学生
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
                onClick={() => handleQuickUpload(student.id, student.name)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    {student.phone && (
                      <p className="text-sm text-gray-500">{student.phone}</p>
                    )}
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
                  错题数
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                    <td className="px-6 py-4 text-sm">
                      {assignment.wrongQuestionCount !== undefined ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          assignment.wrongQuestionCount > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {assignment.wrongQuestionCount > 0 
                            ? `${assignment.wrongQuestionCount} 道错题`
                            : '全对'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(assignment.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {assignment.status === 'CORRECTED' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          已批改
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          待批改
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {assignment.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleAutoCorrect(assignment.id)}
                          className="text-purple-600 hover:text-purple-900 mr-3 font-medium"
                          title="AI 自动批改"
                        >
                          🤖 批改
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handlePreviewWrongQuestions(assignment.studentId, assignment.studentName, assignment.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="查看错题"
                          >
                            错题
                          </button>
                          <button 
                            onClick={() => handleViewAssignment(assignment.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="查看详情"
                          >
                            详情
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                        className="text-red-600 hover:text-red-900"
                        title="删除作业"
                      >
                        删除
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
