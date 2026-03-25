'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressTracker } from '@/components/review/ProgressTracker';
import { ReviewPlanCard } from '@/components/review/ReviewPlanCard';
import { MasteryChart } from '@/components/review/MasteryChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, RefreshCw, CheckCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewPlanItem {
  id: string;
  questionContent: string;
  subject: string;
  knowledgePointName: string;
  reviewCount: number;
  masteryLevel: number;
  isCompleted: boolean;
  completedAt: string | null;
  nextReviewAt: string | null;
  reviewPlanId: string;
}

interface ReviewPlanData {
  date: string;
  totalDue: number;
  completedToday: number;
  progress: number;
  statsBySubject: Record<
    string,
    { subject: string; total: number; completed: number }
  >;
  groupedBySubject: Record<string, ReviewPlanItem[]>;
  items: ReviewPlanItem[];
}

export default function ReviewPlansPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<ReviewPlanData | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // 获取当前登录用户信息（简化处理，实际应从 session 获取）
    const fetchStudentId = async () => {
      try {
        // 这里简化处理，假设从某个 API 获取当前学生 ID
        // 实际应用中应该从 auth session 获取
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        if (session?.user?.id) {
          setStudentId(session.user.id);
        }
      } catch (error) {
        console.error('获取学生 ID 失败:', error);
      }
    };

    fetchStudentId();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchReviewPlan();
    }
  }, [studentId]);

  const fetchReviewPlan = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/review-plans/today?studentId=${studentId}`);
      const data = await response.json();

      if (data.success) {
        setReviewData(data.data);
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法获取复习计划',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('获取复习计划失败:', error);
      toast({
        title: '加载失败',
        description: '无法获取复习计划，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (reviewPlanId: string) => {
    try {
      const response = await fetch(`/api/review-plans/${reviewPlanId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: '完成复习',
          description: '已标记为完成',
        });
        fetchReviewPlan();
      } else {
        toast({
          title: '操作失败',
          description: data.error || '请稍后重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('标记完成失败:', error);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    fetchReviewPlan();
    toast({
      title: '已刷新',
      description: '复习计划已更新',
    });
  };

  const subjectLabels: Record<string, string> = {
    MATH: '数学',
    CHINESE: '语文',
    ENGLISH: '英语',
  };

  if (!studentId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">复习计划</h1>
            <p className="text-muted-foreground">
              基于艾宾浩斯记忆曲线的智能复习计划
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">正在加载用户信息...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">复习计划</h1>
          <p className="text-muted-foreground">
            基于艾宾浩斯记忆曲线的智能复习计划
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !reviewData || reviewData.totalDue === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无复习计划</h3>
            <p className="text-muted-foreground mb-4">
              当前没有需要复习的题目
            </p>
            <Button onClick={() => window.location.href = '/wrong-questions'}>
              前往错题本
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 进度追踪器 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <ProgressTracker
                totalDue={reviewData.totalDue}
                completedToday={reviewData.completedToday}
                statsBySubject={reviewData.statsBySubject}
                date={reviewData.date}
              />
            </div>
            <div>
              <MasteryChart items={reviewData.items} title="今日复习掌握程度" />
            </div>
          </div>

          {/* 按科目分组的复习题目 */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              {Object.keys(reviewData.groupedBySubject).map((subject) => (
                <TabsTrigger key={subject} value={subject}>
                  {subjectLabels[subject] || subject}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviewData.items.map((item) => (
                  <ReviewPlanCard
                    key={item.id}
                    item={item}
                    onMarkComplete={handleMarkComplete}
                  />
                ))}
              </div>
            </TabsContent>

            {Object.entries(reviewData.groupedBySubject).map(([subject, items]) => (
              <TabsContent key={subject} value={subject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <ReviewPlanCard
                      key={item.id}
                      item={item}
                      onMarkComplete={handleMarkComplete}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* 统计信息 */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  共 {reviewData.totalDue} 道题目需要复习
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  已完成 {reviewData.completedToday} 道
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
