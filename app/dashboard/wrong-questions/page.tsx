'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { WrongQuestionCard } from '@/components/wrong-questions/WrongQuestionCard';
import { MasteryStatusBadge } from '@/components/wrong-questions/MasteryStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  student: {
    id: string;
    name: string;
    phone: string;
  };
  knowledgePoint: {
    id: string;
    name: string;
    code: string;
    subject: string;
  };
}

export default function WrongQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [masteryStatus, setMasteryStatus] = useState('all');
  const [grade, setGrade] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, [subject, masteryStatus]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (subject !== 'all') {
        params.set('subject', subject);
      }
      if (masteryStatus !== 'all') {
        params.set('masteryStatus', masteryStatus);
      }

      const response = await fetch(`/api/wrong-questions?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('获取错题列表失败:', error);
      toast({
        title: '加载失败',
        description: '无法获取错题列表，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这道错题吗？')) return;

    try {
      const response = await fetch(`/api/wrong-questions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: '删除成功',
          description: '错题记录已删除',
        });
        fetchQuestions();
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

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.questionContent.toLowerCase().includes(search.toLowerCase()) ||
      q.knowledgePoint.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">错题本</h1>
          <p className="text-muted-foreground">
            管理和复习学生的错题记录
          </p>
        </div>
        <Button onClick={() => router.push('/wrong-questions/new')}>
          <Plus className="w-4 h-4 mr-2" />
          添加错题
        </Button>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="题目或知识点..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>科目</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="全部科目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部科目</SelectItem>
                  <SelectItem value="MATH">数学</SelectItem>
                  <SelectItem value="CHINESE">语文</SelectItem>
                  <SelectItem value="ENGLISH">英语</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>掌握状态</Label>
              <Select value={masteryStatus} onValueChange={setMasteryStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="NEW">新题</SelectItem>
                  <SelectItem value="REVIEWING">复习中</SelectItem>
                  <SelectItem value="MASTERED">已掌握</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>年级</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="全部年级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部年级</SelectItem>
                  <SelectItem value="1">一年级</SelectItem>
                  <SelectItem value="2">二年级</SelectItem>
                  <SelectItem value="3">三年级</SelectItem>
                  <SelectItem value="4">四年级</SelectItem>
                  <SelectItem value="5">五年级</SelectItem>
                  <SelectItem value="6">六年级</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错题列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>暂无错题记录</p>
            <p className="text-sm mt-2">
              {search || subject !== 'all' || masteryStatus !== 'all'
                ? '尝试调整筛选条件'
                : '开始添加第一道错题吧'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => (
            <WrongQuestionCard
              key={question.id}
              question={question}
              onDelete={() => handleDelete(question.id)}
            />
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {!loading && questions.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>共 {questions.length} 道错题</span>
              <span>显示 {filteredQuestions.length} 道</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
