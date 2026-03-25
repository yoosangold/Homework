'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentTransferForm from '@/components/classes/StudentTransferForm';

interface Student {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  enrolledAt: string;
}

interface Teacher {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  classRole: string;
  assignedAt: string;
}

interface ClassDetail {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
  teacherCount: number;
  students: Student[];
  teachers: Teacher[];
  createdAt: string;
  updatedAt: string;
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentUserId, setStudentUserId] = useState('');
  const [studentNameSearch, setStudentNameSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // 获取班级详情
  const fetchClassDetail = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '获取班级详情失败');
      }
      
      setClassData(data.class);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取班级详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
    }
  }, [classId]);

  // 搜索学生
  const handleSearchStudents = async (keyword: string) => {
    setStudentNameSearch(keyword);
    
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/students?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      
      if (res.ok) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setSearching(false);
    }
  };

  // 选择学生
  const handleSelectStudent = (student: any) => {
    setStudentUserId(student.id);
    setStudentNameSearch(student.name);
    setSearchResults([]);
  };

  // 添加学生
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentUserId) {
      alert('请选择学生');
      return;
    }
    
    setAddingStudent(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentUserId,
          classId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '添加学生失败');
      }

      // 刷新班级详情
      await fetchClassDetail();
      
      // 关闭弹窗并重置
      setShowAddStudentModal(false);
      setStudentUserId('');
      setStudentNameSearch('');
      setSearchResults([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : '添加学生失败');
    } finally {
      setAddingStudent(false);
    }
  };

  // 打开调班弹窗
  const handleOpenTransfer = (student: Student) => {
    setSelectedStudent(student);
    setShowTransferModal(true);
  };

  // 调班成功后的回调
  const handleTransferSuccess = async () => {
    setShowTransferModal(false);
    setSelectedStudent(null);
    await fetchClassDetail();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error || '班级不存在'}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 返回按钮 */}
      <div className="mb-4">
        <Link
          href="/dashboard/classes"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回班级列表
        </Link>
      </div>

      {/* 班级信息 */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {classData.grade}年级 · 创建于 {new Date(classData.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{classData.studentCount}</div>
              <div className="text-sm text-gray-600">学生</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{classData.teacherCount}</div>
              <div className="text-sm text-gray-600">老师</div>
            </div>
          </div>
        </div>
      </div>

      {/* 学生列表 */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">学生列表</h2>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            添加学生
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手机号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  邮箱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入学时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classData.students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无学生
                  </td>
                </tr>
              ) : (
                classData.students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.enrolledAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenTransfer(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        调班
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 老师列表 */}
      {classData.teachers.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">老师列表</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    手机号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classData.teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.classRole}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 添加学生弹窗 */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">添加学生</h2>
            <form onSubmit={handleAddStudent}>
              <div className="mb-6">
                <label htmlFor="studentSearch" className="block text-sm font-medium text-gray-700 mb-1">
                  学生姓名
                </label>
                <input
                  type="text"
                  id="studentSearch"
                  value={studentNameSearch}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="输入学生姓名搜索..."
                  autoComplete="off"
                />
                {searching && (
                  <div className="mt-2 text-sm text-gray-500">搜索中...</div>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                    {searchResults.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectStudent(student)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </button>
                    ))}
                  </div>
                )}
                {studentNameSearch && searchResults.length === 0 && !searching && (
                  <div className="mt-2 text-sm text-gray-500">未找到匹配的学生</div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  提示：只有注册为学生角色的用户才会显示
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setStudentUserId('');
                    setStudentNameSearch('');
                    setSearchResults([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={addingStudent || !studentUserId}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingStudent ? '添加中...' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 调班弹窗 */}
      {showTransferModal && selectedStudent && (
        <StudentTransferForm
          student={selectedStudent}
          currentClassId={classId}
          onSuccess={handleTransferSuccess}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}
