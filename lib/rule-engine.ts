/**
 * 本地规则引擎 - 用于判断答案对错
 * 支持：计算题、填空题、选择题、简单应用题
 */

interface QuestionAnalysis {
  questionType: 'calculation' | 'fillblank' | 'choice' | 'application' | 'unknown';
  questionContent: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  knowledgePoint?: string;
  errorType?: string;
  feedback?: string;
}

/**
 * 分析作业答案
 */
export function analyzeAnswer(text: string): QuestionAnalysis[] {
  const questions: QuestionAnalysis[] = [];

  // 按行分割，识别每道题目
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const analysis = analyzeSingleQuestion(line);
    if (analysis) {
      questions.push(analysis);
    }
  }

  return questions;
}

/**
 * 分析单道题目
 */
function analyzeSingleQuestion(line: string): QuestionAnalysis | null {
  // 1. 尝试识别计算题（如：1+1=2, 5×3=15）
  const calcMatch = line.match(/(\d+)\s*([+\-×÷*\/])\s*(\d+)\s*=\s*(\d+)/);
  if (calcMatch) {
    return analyzeCalculation(line, calcMatch);
  }

  // 2. 尝试识别填空题（如：1+1=(2), 5×3=(  )）
  const fillMatch = line.match(/(.+?)=\s*\(([^)]*)\)/);
  if (fillMatch) {
    return analyzeFillBlank(line, fillMatch);
  }

  // 3. 尝试识别选择题（如：1.A, 2.B, 3.C）
  const choiceMatch = line.match(/(\d+)\.?\s*([A-D])/i);
  if (choiceMatch) {
    return analyzeChoice(line, choiceMatch);
  }

  // 4. 其他类型，标记为未知
  return {
    questionType: 'unknown',
    questionContent: line,
    studentAnswer: '',
    correctAnswer: '',
    isCorrect: true, // 未知类型默认正确
    feedback: '无法自动判断，需要人工审核',
  };
}

/**
 * 分析计算题
 */
function analyzeCalculation(line: string, match: RegExpMatchArray): QuestionAnalysis {
  const [, num1, operator, num2, studentAnswer] = match;
  const n1 = parseInt(num1);
  const n2 = parseInt(num2);

  // 计算正确答案
  let correctAnswer: number;
  switch (operator) {
    case '+':
      correctAnswer = n1 + n2;
      break;
    case '-':
      correctAnswer = n1 - n2;
      break;
    case '×':
    case '*':
      correctAnswer = n1 * n2;
      break;
    case '÷':
    case '/':
      correctAnswer = n1 / n2;
      break;
    default:
      correctAnswer = 0;
  }

  const isCorrect = parseInt(studentAnswer) === correctAnswer;

  // 判断错误类型
  let errorType: string | undefined;
  let feedback: string | undefined;

  if (!isCorrect) {
    // 分析可能的错误原因
    if (operator === '+' && Math.abs(parseInt(studentAnswer) - correctAnswer) === Math.abs(n1 - n2)) {
      errorType = '运算符号错误';
      feedback = '可能看错了运算符号，把加法看成减法了';
    } else if (operator === '×' && parseInt(studentAnswer) === n1 + n2) {
      errorType = '运算混淆';
      feedback = '乘法和加法混淆了，乘法是重复相加';
    } else if (Math.abs(parseInt(studentAnswer) - correctAnswer) <= 10) {
      errorType = '计算错误';
      feedback = '计算过程有误，建议重新计算';
    } else {
      errorType = '概念不清';
      feedback = '对运算规则理解不够，需要复习';
    }
  }

  return {
    questionType: 'calculation',
    questionContent: `${num1} ${operator} ${num2} = ?`,
    studentAnswer,
    correctAnswer: correctAnswer.toString(),
    isCorrect,
    knowledgePoint: getCalculationKnowledgePoint(operator, n1, n2),
    errorType,
    feedback: feedback || '回答正确，继续保持！',
  };
}

/**
 * 分析填空题
 */
function analyzeFillBlank(line: string, match: RegExpMatchArray): QuestionAnalysis {
  const [, question, studentAnswer] = match;
  const trimmedAnswer = studentAnswer.trim();

  // 如果答案为空，标记为未作答
  if (!trimmedAnswer) {
    return {
      questionType: 'fillblank',
      questionContent: question,
      studentAnswer: '未作答',
      correctAnswer: '未知',
      isCorrect: false,
      errorType: '未作答',
      feedback: '这道题没有作答，请补上答案',
    };
  }

  // 填空题无法自动判断，需要人工审核
  return {
    questionType: 'fillblank',
    questionContent: question,
    studentAnswer: trimmedAnswer,
    correctAnswer: '待人工批改',
    isCorrect: true, // 暂时标记为正确
    feedback: '填空题需要人工批改',
  };
}

/**
 * 分析选择题
 */
function analyzeChoice(line: string, match: RegExpMatchArray): QuestionAnalysis {
  const [, num, answer] = match;

  // 选择题需要题目和选项才能判断，这里只记录答案
  return {
    questionType: 'choice',
    questionContent: `第${num}题`,
    studentAnswer: answer.toUpperCase(),
    correctAnswer: '待人工批改',
    isCorrect: true,
    feedback: '选择题需要人工批改',
  };
}

/**
 * 获取计算题对应的知识点
 */
function getCalculationKnowledgePoint(operator: string, n1: number, n2: number): string {
  const maxNum = Math.max(n1, n2);

  if (operator === '+' || operator === '-') {
    if (maxNum <= 10) return '10 以内加减法';
    if (maxNum <= 20) return '20 以内加减法';
    if (maxNum <= 100) return '100 以内加减法';
    return '多位数加减法';
  }

  if (operator === '×' || operator === '*') {
    if (maxNum <= 9) return '乘法口诀';
    if (maxNum <= 20) return '两位数乘法';
    return '多位数乘法';
  }

  if (operator === '÷' || operator === '/') {
    if (maxNum <= 20) return '表内除法';
    return '多位数除法';
  }

  return '基础运算';
}

/**
 * 生成批改反馈
 */
export function generateFeedback(questions: QuestionAnalysis[]) {
  const total = questions.length;
  const correct = questions.filter(q => q.isCorrect).length;
  const wrong = total - correct;
  const score = Math.round((correct / total) * 100);

  // 统计错误类型
  const errorTypes: Record<string, number> = {};
  questions.forEach(q => {
    if (q.errorType) {
      errorTypes[q.errorType] = (errorTypes[q.errorType] || 0) + 1;
    }
  });

  // 生成反馈
  let feedback = '';

  if (score >= 90) {
    feedback = `太棒了！得分 ${score} 分，${correct}/${total} 道题正确。`;
  } else if (score >= 70) {
    feedback = `不错！得分 ${score} 分，${correct}/${total} 道题正确。`;
  } else if (score >= 60) {
    feedback = `及格了，得分 ${score} 分。还有 ${wrong} 道题需要加油。`;
  } else {
    feedback = `得分 ${score} 分，需要多加练习哦。`;
  }

  // 添加错误类型分析
  if (Object.keys(errorTypes).length > 0) {
    feedback += '\n\n错误分析：\n';
    Object.entries(errorTypes).forEach(([type, count]) => {
      feedback += `- ${type}：${count} 题\n`;
    });
  }

  return {
    score,
    correct,
    wrong,
    feedback,
    errorTypes,
  };
}
