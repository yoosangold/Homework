'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  studentName: string;
  studentId: string;
  instruction: string | null;
  images: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAssignment();
    }
  }, [params.id]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}`);
      const data = await response.json();
      
      if (response.ok && data.data) {
        setAssignment(data.data);
      }
    } catch (error) {
      console.error('获取作业详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCorrect = async () => {
    if (!confirm('确定要启动 AI 自动批改吗？系统将智能分析作业并识别错题。')) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${params.id}/auto-correct`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ 自动批改完成！\n得分：${data.data.correction.score}分\n错题数：${data.data.wrongQuestionCount}道\n\n${data.data.correction.feedback}`);
        fetchAssignment(); // 刷新数据
      } else {
        alert(data.error || '批改失败');
      }
    } catch (error) {
      console.error('自动批改失败:', error);
      alert('批改失败，请稍后重试');
    }
  };

  const handleExportWrongQuestions = async () => {
    try {
      const response = await fetch(`/api/wrong-questions?studentId=${assignment?.studentId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok && data.data) {
        // 导出为 CSV
        const csv = convertToCSV(data.data);
        downloadCSV(csv, `${assignment?.studentName}_错题本.csv`);
      } else {
        alert('该学生暂无错题记录');
      }
    } catch (error) {
      console.error('导出错题失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = ['题目内容', '学生答案', '正确答案', '错误类型', '知识点', '备注'];
    const rows = data.map(item => [
      item.questionContent,
      item.studentAnswer || '',
      item.correctAnswer,
      item.errorType || '',
      item.knowledgePoint?.name || '',
      item.notes || ''
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">作业不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">作业详情</h1>
          <p className="text-gray-600 mt-1">{assignment.title}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回
        </button>
      </div>

      {/* 作业信息 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">学生姓名</p>
            <p className="text-base text-gray-900">{assignment.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">科目</p>
            <p className="text-base">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {subjectLabels[assignment.subject] || assignment.subject}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">状态</p>
            <p className="text-base">
              {assignment.status === 'CORRECTED' ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  已批改
                </span>
              ) : (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm flex items-center gap-1 inline-flex">
                  <span className="animate-pulse">●</span> 待批改
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">上传时间</p>
            <p className="text-base text-gray-900">
              {new Date(assignment.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </div>

      {/* 批改结果 */}
      {assignment.status === 'CORRECTED' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🤖</span> AI 批改结果
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">得分</p>
                <p className="text-3xl font-bold text-purple-600">
                  {/* 这里需要从 API 获取分数，暂时显示占位符 */}
                  85
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">批改反馈</p>
                <p className="text-gray-700">
                  {/* 这里需要从 API 获取反馈 */}
                  整体完成不错，但要注意计算细节。错题已自动收录到错题本，可以进行针对性练习。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 作业图片 */}
      {assignment.images && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">作业图片</h2>
          <div className="space-y-4">
            {(() => {
              try {
                const images = JSON.parse(assignment.images);
                return images.map((img: string, index: number) => (
                  <div key={index} className="flex justify-center">
                    <img
                      src={img}
                      alt={`作业图片 ${index + 1}`}
                      className="max-w-full h-auto max-h-[600px] rounded-lg shadow-md"
                    />
                  </div>
                ));
              } catch {
                return <p className="text-gray-500">图片加载失败</p>;
              }
            })()}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-4">
        {assignment.status === 'PENDING' && (
          <button
            onClick={handleAutoCorrect}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <span>🤖</span>
            AI 自动批改
          </button>
        )}
        {assignment.status === 'CORRECTED' && (
          <>
            <button
              onClick={() => router.push(`/dashboard/wrong-questions/preview?studentId=${assignment.studentId}&studentName=${assignment.studentName}&assignmentId=${assignment.id}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              查看错题
            </button>
            <button
              onClick={handleExportWrongQuestions}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              导出错题本
            </button>
          </>
        )}
      </div>
    </div>
  );
}
