'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignmentUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<{id: string; name: string} | null>(null);

  // 页面加载时检查是否有选中的学生
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedStudent');
    if (stored) {
      try {
        setSelectedStudent(JSON.parse(stored));
      } catch (e) {
        console.error('解析学生信息失败:', e);
      }
    }
  }, []);

  // 处理文件选择
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件（JPG/PNG）');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  // 拖拽事件处理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // 计算图片哈希（简化版，用于重复检测）
  const calculateImageHash = (base64Image: string): string => {
    // 简单的哈希计算：对 base64 字符串进行哈希
    let hash = 0;
    const str = base64Image.substring(0, 1000); // 只取前 1000 个字符计算哈希
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  };

  // 检查是否已存在相同作业
  const checkDuplicateAssignment = async (imageHash: string, studentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/assignments/check-duplicate?studentId=${studentId}&imageHash=${imageHash}`);
      const data = await response.json();
      
      if (response.ok && data.exists) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('检查重复作业失败:', error);
      return false;
    }
  };

  // 上传作业
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请选择作业图片');
      return;
    }

    if (!selectedStudent) {
      setError('请选择学生');
      router.push('/dashboard/assignments');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 将图片转换为 Base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // 计算图片哈希，检查是否重复
        const imageHash = calculateImageHash(base64Image);
        const isDuplicate = await checkDuplicateAssignment(imageHash, selectedStudent.id);
        
        if (isDuplicate) {
          setUploading(false);
          setError('⚠️ 该作业图片已上传过，无需重复提交！系统会自动登记为同一次作业。');
          return;
        }
        
        // 调用 API 上传作业
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${selectedStudent.name}的作业`,
            studentId: selectedStudent.id,
            studentName: selectedStudent.name,
            images: [base64Image],
            imageHash, // 传递图片哈希用于重复检测
            // 科目由系统自动识别
          }),
        });

        const result = await response.json();

        if (response.ok) {
          // 作业上传成功，自动触发 AI 批改
          const assignmentId = result.data.id;
          
          try {
            const correctResponse = await fetch(`/api/assignments/${assignmentId}/auto-correct`, {
              method: 'POST',
              credentials: 'include',
            });
            const correctResult = await correctResponse.json();
            
            if (correctResponse.ok) {
              alert(`✅ 作业上传并批改完成！\n得分：${correctResult.data.correction.score}分\n错题数：${correctResult.data.wrongQuestionCount}道\n\n${correctResult.data.correction.feedback}`);
            } else {
              alert('作业上传成功，但自动批改失败，请稍后手动批改。');
            }
          } catch (error) {
            console.error('自动批改失败:', error);
            alert('作业上传成功，但自动批改失败，请稍后手动批改。');
          }
          
          // 清除选中的学生
          sessionStorage.removeItem('selectedStudent');
          router.push('/dashboard/assignments');
        } else {
          setError(result.error || '上传失败');
        }
      };
    } catch (err) {
      setError('上传失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">上传作业</h1>
          <p className="text-gray-600 mt-1">拖拽作业图片到下方区域即可自动上传</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回
        </button>
      </div>

      {/* 选中的学生信息 */}
      {selectedStudent ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">当前学生</p>
              <p className="text-lg font-semibold text-blue-900">{selectedStudent.name}</p>
            </div>
            <button
              onClick={() => {
                setSelectedStudent(null);
                sessionStorage.removeItem('selectedStudent');
                router.push('/dashboard/assignments');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              更换学生
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ 请先返回 <a href="/dashboard/assignments" className="underline font-medium">作业管理</a> 选择学生
          </p>
        </div>
      )}

      {/* 拖拽上传区域 */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="预览"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setPreview(null);
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              删除
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                拖拽作业图片到此处
              </p>
              <p className="text-sm text-gray-500 mt-1">
                或者点击选择文件
              </p>
            </div>
            <p className="text-xs text-gray-400">
              支持 JPG、PNG 格式，系统会自动识别科目
            </p>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 上传按钮 */}
      {selectedFile && selectedStudent && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {uploading ? '上传中...' : '确认上传'}
        </button>
      )}

      {/* 说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使用说明</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支持拖拽上传，也可以点击选择文件</li>
          <li>• 系统会自动识别作业科目（语文/数学/英语）</li>
          <li>• 上传后会自动分析错题知识点</li>
          <li>• 可以导出同类型错题进行强化练习</li>
        </ul>
      </div>
    </div>
  );
}
