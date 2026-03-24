/**
 * 艾宾浩斯记忆曲线复习算法库
 * 
 * 艾宾浩斯复习间隔（基于记忆保留率研究）：
 * - 第 1 次复习：5 分钟后（保留率从 58% 提升至更高）
 * - 第 2 次复习：30 分钟后
 * - 第 3 次复习：12 小时后
 * - 第 4 次复习：1 天后
 * - 第 5 次复习：2 天后
 * - 第 6 次复习：4 天后
 * - 第 7 次复习：7 天后
 * - 第 8 次复习：15 天后
 */

// 艾宾浩斯复习间隔（单位：分钟）
export const EBBINGHAUS_INTERVALS = [
  5,      // 第 1 次：5 分钟
  30,     // 第 2 次：30 分钟
  720,    // 第 3 次：12 小时
  1440,   // 第 4 次：1 天
  2880,   // 第 5 次：2 天
  5760,   // 第 6 次：4 天
  10080,  // 第 7 次：7 天
  21600,  // 第 8 次：15 天
];

// 复习间隔描述（用于 UI 显示）
export const INTERVAL_LABELS = [
  '5 分钟',
  '30 分钟',
  '12 小时',
  '1 天',
  '2 天',
  '4 天',
  '7 天',
  '15 天',
];

/**
 * 计算下次复习时间
 * @param lastReviewedAt 上次复习时间
 * @param reviewCount 已复习次数（0 表示未复习过）
 * @returns 下次复习时间
 */
export function calculateNextReview(
  lastReviewedAt: Date | null,
  reviewCount: number = 0
): Date {
  // 如果从未复习过，立即需要复习
  if (!lastReviewedAt || reviewCount === 0) {
    return new Date();
  }

  // 获取当前复习次数对应的间隔（限制在最大间隔内）
  const intervalIndex = Math.min(reviewCount - 1, EBBINGHAUS_INTERVALS.length - 1);
  const intervalMinutes = EBBINGHAUS_INTERVALS[intervalIndex];

  // 计算下次复习时间
  const nextReview = new Date(lastReviewedAt.getTime() + intervalMinutes * 60 * 1000);
  return nextReview;
}

/**
 * 判断某题是否需要复习
 * @param lastReviewedAt 上次复习时间
 * @param reviewCount 已复习次数
 * @param checkTime 检查时间（默认为当前时间）
 * @returns 是否需要复习
 */
export function shouldReview(
  lastReviewedAt: Date | null,
  reviewCount: number = 0,
  checkTime: Date = new Date()
): boolean {
  // 如果从未复习过，需要复习
  if (!lastReviewedAt || reviewCount === 0) {
    return true;
  }

  // 计算下次复习时间
  const nextReview = calculateNextReview(lastReviewedAt, reviewCount);

  // 如果当前时间已超过下次复习时间，需要复习
  return checkTime >= nextReview;
}

/**
 * 获取复习计划项
 */
export interface ReviewPlanItem {
  wrongQuestionId: string;
  questionContent: string;
  subject: string;
  knowledgePointName: string;
  lastReviewedAt: Date | null;
  reviewCount: number;
  nextReviewAt: Date;
  isDue: boolean;
  masteryLevel: number; // 掌握程度 0-100
}

/**
 * 生成学生复习计划
 * @param wrongQuestions 学生的错题列表
 * @param checkTime 检查时间（默认为当前时间）
 * @returns 复习计划
 */
export function getReviewPlan(
  wrongQuestions: Array<{
    id: string;
    questionContent: string;
    subject: string;
    knowledgePointName: string;
    lastReviewedAt: Date | null;
    reviewCount: number;
  }>,
  checkTime: Date = new Date()
): ReviewPlanItem[] {
  return wrongQuestions.map((question) => {
    const nextReviewAt = calculateNextReview(question.lastReviewedAt, question.reviewCount);
    const isDue = shouldReview(question.lastReviewedAt, question.reviewCount, checkTime);

    // 计算掌握程度（基于复习次数）
    // 复习次数越多，掌握程度越高
    const masteryLevel = Math.min(100, question.reviewCount * 12.5);

    return {
      wrongQuestionId: question.id,
      questionContent: question.questionContent,
      subject: question.subject,
      knowledgePointName: question.knowledgePointName,
      lastReviewedAt: question.lastReviewedAt,
      reviewCount: question.reviewCount,
      nextReviewAt,
      isDue,
      masteryLevel,
    };
  });
}

/**
 * 获取今日应复习的题目数量
 * @param wrongQuestions 学生的错题列表
 * @returns 今日应复习数量
 */
export function getDueTodayCount(
  wrongQuestions: Array<{
    lastReviewedAt: Date | null;
    reviewCount: number;
  }>
): number {
  const now = new Date();
  return wrongQuestions.filter((q) =>
    shouldReview(q.lastReviewedAt, q.reviewCount, now)
  ).length;
}

/**
 * 格式化复习时间为友好字符串
 * @param date 复习时间
 * @returns 格式化后的字符串
 */
export function formatReviewTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 0) {
    return '已过期';
  } else if (diffMinutes < 1) {
    return '立即';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟后`;
  } else if (diffHours < 24) {
    return `${diffHours}小时后`;
  } else {
    return `${diffDays}天后`;
  }
}
