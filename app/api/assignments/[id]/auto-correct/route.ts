import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { recognizeText } from '@/lib/baidu-ocr'
import { analyzeAnswer, generateFeedback } from '@/lib/rule-engine'

// POST: 自动批改作业（使用百度 OCR + 本地规则引擎）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取作业详情
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '作业不存在' },
        { status: 404 }
      )
    }

    // 解析作业图片
    let images: string[] = [];
    if (assignment.images) {
      try {
        images = JSON.parse(assignment.images);
      } catch {
        images = [assignment.images];
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: '作业没有图片' },
        { status: 400 }
      )
    }

    // 使用百度 OCR 识别图片文字
    const ocrResults = [];
    for (const image of images) {
      try {
        // 移除 data:image/xxx;base64, 前缀
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const ocrResult = await recognizeText(base64Data);
        ocrResults.push(ocrResult.text);
      } catch (error: any) {
        console.error('OCR 识别失败:', error.message);
        // OCR 失败不影响后续流程
      }
    }

    const fullText = ocrResults.join('\n');

    // 使用本地规则引擎分析答案
    const questions = analyzeAnswer(fullText);
    const feedbackResult = generateFeedback(questions);

    // 创建或更新批改记录
    let correction = await prisma.correction.findFirst({
      where: {
        assignmentId: assignment.id,
        studentId: assignment.studentId || '',
      },
    })

    if (correction) {
      correction = await prisma.correction.update({
        where: { id: correction.id },
        data: {
          score: feedbackResult.score,
          feedback: feedbackResult.feedback,
          status: 'CORRECTED',
          correctedAt: new Date(),
          reviewerId: session.user.id,
        },
      })
    } else {
      correction = await prisma.correction.create({
        data: {
          assignmentId: assignment.id,
          studentId: assignment.studentId || '',
          score: feedbackResult.score,
          feedback: feedbackResult.feedback,
          status: 'CORRECTED',
          correctedAt: new Date(),
          reviewerId: session.user.id,
        },
      })
    }

    // 创建错题记录
    const wrongQuestions = questions.filter(q => !q.isCorrect);
    if (wrongQuestions.length > 0) {
      // 获取知识点 ID（这里使用模拟 ID，实际应该从知识点表查询）
      const knowledgePointMap: Record<string, string> = {
        '10 以内加减法': 'cmn5t8zxl0000l50ycwvz5v2h',
        '20 以内加减法': 'cmn5t92xl0001l50y8q3h9v3k',
        '100 以内加减法': 'cmn5t95xl0002l50y2p7k8v4m',
        '乘法口诀': 'cmn5t98xl0003l50y6r2m9v5n',
        '表内除法': 'cmn5t9bxl0004l50y1s4n0v6p',
      };

      for (const wrongQ of wrongQuestions) {
        const kpId = knowledgePointMap[wrongQ.knowledgePoint || ''] || 'cmn5t8zxl0000l50ycwvz5v2h';
        
        await prisma.wrongQuestion.create({
          data: {
            studentId: assignment.studentId || '',
            assignmentId: assignment.id,
            knowledgePointId: kpId,
            questionContent: wrongQ.questionContent,
            studentAnswer: wrongQ.studentAnswer,
            correctAnswer: wrongQ.correctAnswer,
            errorType: wrongQ.errorType || '其他错误',
            notes: wrongQ.feedback,
          },
        })
      }
    }

    // 更新作业状态
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        status: 'CORRECTED',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        correction,
        wrongQuestionCount: wrongQuestions.length,
        ocrText: fullText,
        questions,
      },
      message: '自动批改完成',
    })
  } catch (error: any) {
    console.error('自动批改失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '自动批改失败' },
      { status: 500 }
    )
  }
}
