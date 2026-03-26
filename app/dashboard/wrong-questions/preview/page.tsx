'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface WrongQuestion {
  id: string;
  studentId: string;
  knowledgePointId: string;
  questionContent: string;
  studentAnswer: string | null;
  correctAnswer: string;
  errorType: string | null;
  notes: string | null;
  createdAt: string;
  knowledgePoint?: {
    name: string;
    code: string;
  };
  student?: {
    name: string;
  };
}

export default function WrongQuestionsPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const studentName = searchParams.get('studentName');
  const assignmentId = searchParams.get('assignmentId');

  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (studentId) {
      fetchWrongQuestions();
    }
  }, [studentId, assignmentId]);

  const fetchWrongQuestions = async () => {
    try {
      let url = `/api/wrong-questions?studentId=${studentId}`;
      if (assignmentId) {
        url += `&assignmentId=${assignmentId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.data) {
        setWrongQuestions(data.data);
        // 默认全选
        setSelectedQuestions(new Set(data.data.map((q: WrongQuestion) => q.id)));
      }
    } catch (error) {
      console.error('获取错题失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleAll = () => {
    if (selectedQuestions.size === wrongQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(wrongQuestions.map(q => q.id)));
    }
  };

  const handleExport = () => {
    if (selectedQuestions.size === 0) {
      alert('请至少选择一道错题');
      return;
    }

    const questionsToExport = wrongQuestions.filter(q => selectedQuestions.has(q.id));
    const csv = convertToCSV(questionsToExport);
    downloadCSV(csv, `${studentName}_错题本_${new Date().toLocaleDateString('zh-CN')}.csv`);
  };

  const convertToCSV = (data: WrongQuestion[]) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">错题预览</h1>
          <p className="text-gray-600 mt-1">
            {studentName} - 共 {wrongQuestions.length} 道错题，已选择 {selectedQuestions.size} 道
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回
        </button>
      </div>

      {/* 操作栏 */}
      {wrongQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAll}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {selectedQuestions.size === wrongQuestions.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-500">
              已选择 {selectedQuestions.size} / {wrongQuestions.length}
            </span>
          </div>
          <button
            onClick={handleExport}
            disabled={selectedQuestions.size === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            导出选中错题 ({selectedQuestions.size})
          </button>
        </div>
      )}

      {/* 错题列表 */}
      {wrongQuestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900">暂无错题</h3>
          <p className="text-gray-500 mt-2">该学生还没有错题记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wrongQuestions.map((question, index) => (
            <div
              key={question.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 transition ${
                selectedQuestions.has(question.id)
                  ? 'border-green-500'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedQuestions.has(question.id)}
                  onChange={() => toggleQuestion(question.id)}
                  className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      第 {index + 1} 题
                    </span>
                    {question.knowledgePoint && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {question.knowledgePoint.name}
                      </span>
                    )}
                    {question.errorType && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        {question.errorType}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">题目内容</p>
                      <p className="text-gray-900">{question.questionContent}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">学生答案</p>
                        <p className={`text-gray-900 ${
                          question.studentAnswer !== question.correctAnswer 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {question.studentAnswer || '未作答'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">正确答案</p>
                        <p className="text-green-600">{question.correctAnswer}</p>
                      </div>
                    </div>
                    
                    {question.notes && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">备注</p>
                        <p className="text-gray-700">{question.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
