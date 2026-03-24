import { PrismaClient, Subject } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 年级编码映射
const gradeCodeMap: Record<string, string> = {
  '一年级上册': 'g1a',
  '一年级下册': 'g1b',
  '二年级上册': 'g2a',
  '二年级下册': 'g2b',
  '三年级上册': 'g3a',
  '三年级下册': 'g3b',
  '四年级上册': 'g4a',
  '四年级下册': 'g4b',
  '五年级上册': 'g5a',
  '五年级下册': 'g5b',
  '六年级上册': 'g6a',
  '六年级下册': 'g6b',
};

// 科目映射
const subjectMap: Record<string, Subject> = {
  '数学': Subject.MATH,
  '语文': Subject.CHINESE,
  '英语': Subject.ENGLISH,
};

interface KnowledgePointNode {
  name: string;
  code: string;
  subject: Subject;
  depth: number;
  parentId?: string;
  children: KnowledgePointNode[];
}

/**
 * 解析知识点树文件
 */
function parseKnowledgePoints(filePath: string): KnowledgePointNode[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const subjects: KnowledgePointNode[] = [];
  let currentSubject: KnowledgePointNode | null = null;
  let currentGrade: KnowledgePointNode | null = null;
  let currentUnit: KnowledgePointNode | null = null;
  
  let subjectCounter = 0;
  let gradeCounter = 0;
  let unitCounter = 0;
  let pointCounter = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过空行、注释和元数据
    if (!trimmedLine || trimmedLine.startsWith('**') || trimmedLine.startsWith('---') || 
        trimmedLine.startsWith('# 人教版') || trimmedLine.startsWith('## 目标') ||
        trimmedLine.startsWith('## 使用说明') || trimmedLine.startsWith('## 待完善') ||
        trimmedLine.startsWith('|') || trimmedLine.startsWith('```') ||
        trimmedLine.startsWith('- [ ]') || trimmedLine.startsWith('示例：') ||
        trimmedLine.startsWith('建议采用')) {
      continue;
    }
    
    // 检测科目层级 (## 数学科目)
    if (trimmedLine.startsWith('## ') && (trimmedLine.includes('科目') || trimmedLine.includes('英语科目'))) {
      const subjectName = trimmedLine.replace('## ', '').replace('科目', '');
      const subject = subjectMap[subjectName];
      if (subject) {
        subjectCounter++;
        currentSubject = {
          name: subjectName,
          code: `${subject}-${String(subjectCounter).padStart(3, '0')}`,
          subject,
          depth: 0,
          children: [],
        };
        subjects.push(currentSubject);
        currentGrade = null;
        currentUnit = null;
      }
      continue;
    }
    
    // 检测年级层级 (### 一年级上册)
    if (trimmedLine.startsWith('### ') && currentSubject) {
      const gradeName = trimmedLine.replace('### ', '');
      const gradeCode = gradeCodeMap[gradeName];
      if (gradeCode) {
        gradeCounter++;
        currentGrade = {
          name: gradeName,
          code: `${currentSubject.subject}-${gradeCode}`,
          subject: currentSubject.subject,
          depth: 1,
          parentId: currentSubject.id,
          children: [],
        };
        currentSubject.children.push(currentGrade);
        currentUnit = null;
      }
      continue;
    }
    
    // 检测单元层级 (- 准备课)
    if (trimmedLine.startsWith('- ') && !trimmedLine.startsWith('- [') && currentGrade) {
      const unitName = trimmedLine.replace('- ', '');
      unitCounter++;
      currentUnit = {
        name: unitName,
        code: `${currentGrade.code}-unit${String(unitCounter).padStart(2, '0')}`,
        subject: currentGrade.subject,
        depth: 2,
        parentId: currentGrade.id,
        children: [],
      };
      currentGrade.children.push(currentUnit);
      pointCounter = 0;
      continue;
    }
    
    // 检测知识点层级 (  - 数一数)
    if (trimmedLine.startsWith('  - ') && currentUnit) {
      const pointName = trimmedLine.replace('  - ', '');
      pointCounter++;
      const pointNode: KnowledgePointNode = {
        name: pointName,
        code: `${currentUnit.code}-${String(pointCounter).padStart(3, '0')}`,
        subject: currentUnit.subject,
        depth: 3,
        parentId: currentUnit.id,
        children: [],
      };
      currentUnit.children.push(pointNode);
      continue;
    }
  }
  
  return subjects;
}

/**
 * 递归创建知识点
 */
async function createKnowledgePoints(nodes: KnowledgePointNode[], parentId?: string): Promise<void> {
  for (const node of nodes) {
    const created = await prisma.knowledgePoint.create({
      data: {
        name: node.name,
        code: node.code,
        subject: node.subject,
        parentId: parentId,
        depth: node.depth,
      },
    });
    
    console.log(`✓ 创建知识点: ${node.code} - ${node.name}`);
    
    if (node.children.length > 0) {
      await createKnowledgePoints(node.children, created.id);
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🌱 开始导入知识点数据...\n');
  
  const filePath = path.join(__dirname, '../docs/knowledge-points/人教版小学知识点树.md');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在：${filePath}`);
    process.exit(1);
  }
  
  console.log(`📖 读取文件：${filePath}\n`);
  
  // 先清空现有数据（避免重复）
  console.log('🧹 清空现有知识点数据...');
  await prisma.knowledgePoint.deleteMany({});
  console.log('✓ 清空完成\n');
  
  // 解析知识点
  const knowledgePoints = parseKnowledgePoints(filePath);
  
  // 统计数量
  let totalCount = 0;
  function countNodes(nodes: KnowledgePointNode[]): number {
    let count = nodes.length;
    for (const node of nodes) {
      count += countNodes(node.children);
    }
    return count;
  }
  totalCount = countNodes(knowledgePoints);
  
  console.log(`📊 解析完成，共 ${totalCount} 个知识点\n`);
  
  // 创建知识点
  console.log('💾 开始导入数据库...\n');
  await createKnowledgePoints(knowledgePoints);
  
  console.log('\n✅ 知识点导入完成！');
  
  // 统计结果
  const mathCount = await prisma.knowledgePoint.count({ where: { subject: Subject.MATH } });
  const chineseCount = await prisma.knowledgePoint.count({ where: { subject: Subject.CHINESE } });
  const englishCount = await prisma.knowledgePoint.count({ where: { subject: Subject.ENGLISH } });
  
  console.log('\n📈 导入统计:');
  console.log(`   数学：${mathCount} 个知识点`);
  console.log(`   语文：${chineseCount} 个知识点`);
  console.log(`   英语：${englishCount} 个知识点`);
  console.log(`   总计：${mathCount + chineseCount + englishCount} 个知识点`);
}

main()
  .catch((e) => {
    console.error('❌ 导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
