'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MasteryStatusBadge } from '@/components/wrong-questions/MasteryStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WrongQuestion {
  id: string;
  questionContent: string;
  studentAnswer?: string | null;
  correctAnswer: string;
  errorType?: string | null;
  notes?: string | null;
  masteryStatus?: 'NEW' | 'REVIEWING' | 'MASTERED';
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  knowledgePoint: {
    id: string;
    name: string;
    code: string;
    subject: string;
    description?: string | null;
    parent?: {
      id: string;
      name: string;
      code: string;
    } | null;
  };
}

const subjectLabels: Record<string, string> = {
  MATH: '数学',
  CHINESE: '语文',
  ENGLISH: '英语',
};

export default function WrongQuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [question, setQuestion] = useState<WrongQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [masteryStatus, setMasteryStatus] = useState<'NEW' | 'REVIEWING' | 'MASTERED'>('NEW');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchQuestion(params.id as string);
    }
  }, [params.id]);

  const fetchQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/wrong-questions/${id}`);
      const data = await response.json();

      if (data.success) {
        setQuestion(data.data);
        setMasteryStatus(data.data.masteryStatus || 'NEW');
        setNotes(data.data.notes || '');
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法获取错题详情',
          variant: 'destructive',
        });
        router.push('/wrong-questions');
      }
    } catch (error) {
      console.error('获取错题详情失败:', error);
      toast({
        title: '加载失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!question) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/wrong-questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masteryStatus,
          notes,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: '更新成功',
          description: '错题记录已更新',
        });
        setQuestion(data.data);
        setEditing(false);
      } else {
        toast({
          title: '更新失败',
          description: data.error || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('更新错题失败:', error);
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!question) return;
    if (!confirm('确定要删除这道错题吗？')) return;

    try {
      const response = await fetch(`/api/wrong-questions/${question.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: '删除成功',
          description: '错题记录已删除',
        });
        router.push('/wrong-questions');
      } else {
        toast({
          title: '删除失败',
          description: data.error || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('删除错题失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!question) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>错题记录不存在</p>
          <Button variant="link" onClick={() => router.push('/wrong-questions')}>
            返回错题本
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">错题详情</h1>
            <p className="text-muted-foreground">
              {subjectLabels[question.knowledgePoint.subject]} · {question.knowledgePoint.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setMasteryStatus(question.masteryStatus || 'NEW');
                  setNotes(question.notes || '');
                }}
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={updating}
              >
                <Save className="w-4 h-4 mr-2" />
                {updating ? '保存中...' : '保存'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                删除
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 题目内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>题目内容</CardTitle>
            <MasteryStatusBadge status={question.masteryStatus || 'NEW'} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="whitespace-pre-wrap">{question.questionContent}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">学生答案</h3>
              <p className="text-sm text-red-700 whitespace-pre-wrap">
                {question.studentAnswer || '未作答'}
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">正确答案</h3>
              <p className="text-sm text-green-700 whitespace-pre-wrap">
                {question.correctAnswer}
              </p>
            </div>
          </div>

          {question.errorType && (
            <div>
              <Label className="text-red-600">错误类型</Label>
              <p className="text-sm mt-1">{question.errorType}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 知识点信息 */}
      <Card>
        <CardHeader>
          <CardTitle>知识点信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>知识点名称</Label>
              <p className="text-sm mt-1">{question.knowledgePoint.name}</p>
            </div>
            <div>
              <Label>知识点编码</Label>
              <p className="text-sm mt-1 font-mono">{question.knowledgePoint.code}</p>
            </div>
            <div>
              <Label>科目</Label>
              <p className="text-sm mt-1">
                {subjectLabels[question.knowledgePoint.subject]}
              </p>
            </div>
            {question.knowledgePoint.parent && (
              <div>
                <Label>父知识点</Label>
                <p className="text-sm mt-1">{question.knowledgePoint.parent.name}</p>
              </div>
            )}
          </div>
          {question.knowledgePoint.description && (
            <div>
              <Label>描述</Label>
              <p className="text-sm mt-1">{question.knowledgePoint.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 学生信息 */}
      <Card>
        <CardHeader>
          <CardTitle>学生信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>姓名</Label>
              <p className="text-sm mt-1">{question.student.name}</p>
            </div>
            <div>
              <Label>电话</Label>
              <p className="text-sm mt-1">{question.student.phone}</p>
            </div>
            <div>
              <Label>邮箱</Label>
              <p className="text-sm mt-1">{question.student.email}</p>
            </div>
            <div>
              <Label>创建时间</Label>
              <p className="text-sm mt-1">
                {new Date(question.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 编辑区域 */}
      <Card>
        <CardHeader>
          <CardTitle>更新掌握状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>掌握状态</Label>
              <Select
                value={masteryStatus}
                onValueChange={(value) => setMasteryStatus(value as any)}
                disabled={!editing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">新题</SelectItem>
                  <SelectItem value="REVIEWING">复习中</SelectItem>
                  <SelectItem value="MASTERED">已掌握</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>备注笔记</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="添加复习笔记或备注..."
              className="mt-1 min-h-[100px]"
              disabled={!editing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
