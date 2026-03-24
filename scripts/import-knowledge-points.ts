import { PrismaClient, Subject } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

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
 * 创建进度条
 */
class ProgressBar {
  private total: number;
  private current: number = 0;
  private width: number = 30;

  constructor(total: number) {
    this.total = total;
  }

  tick(label: string = ''): void {
    this.current++;
    const percent = this.current / this.total;
    const filled = Math.round(this.width * percent);
    const empty = this.width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`[${bar}] ${(percent * 100).toFixed(1)}% ${this.current}/${this.total} ${label}`);
    
    if (this.current >= this.total) {
      console.log();
    }
  }
}

/**
 * 解析知识点树文件，支持按科目过滤
 */
function parseKnowledgePoints(
  filePath: string, 
  targetSubject?: Subject
): KnowledgePointNode[] {
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
    
    // 检测科目层级
    if (trimmedLine.startsWith('## ') && (trimmedLine.includes('科目') || trimmedLine.includes('英语科目'))) {
      const subjectName = trimmedLine.replace('## ', '').replace('科目', '');
      const subject = subjectMap[subjectName];
      
      if (subject) {
        // 如果指定了科目，只处理匹配的
        if (targetSubject && subject !== targetSubject) {
          currentSubject = null;
          continue;
        }
        
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
    
    // 检测年级层级
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
          children: [],
        };
        currentSubject.children.push(currentGrade);
        currentUnit = null;
      }
      continue;
    }
    
    // 检测单元层级
    if (trimmedLine.startsWith('- ') && !trimmedLine.startsWith('- [') && currentGrade) {
      const unitName = trimmedLine.replace('- ', '');
      unitCounter++;
      currentUnit = {
        name: unitName,
        code: `${currentGrade.code}-unit${String(unitCounter).padStart(2, '0')}`,
        subject: currentGrade.subject,
        depth: 2,
        children: [],
      };
      currentGrade.children.push(currentUnit);
      pointCounter = 0;
      continue;
    }
    
    // 检测知识点层级
    if (trimmedLine.startsWith('  - ') && currentUnit) {
      const pointName = trimmedLine.replace('  - ', '');
      pointCounter++;
      const pointNode: KnowledgePointNode = {
        name: pointName,
        code: `${currentUnit.code}-${String(pointCounter).padStart(3, '0')}`,
        subject: currentUnit.subject,
        depth: 3,
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
async function createKnowledgePoints(
  nodes: KnowledgePointNode[], 
  parentId: string | undefined,
  progressBar: ProgressBar
): Promise<void> {
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
    
    progressBar.tick(`${node.code}`);
    
    if (node.children.length > 0) {
      await createKnowledgePoints(node.children, created.id, progressBar);
    }
  }
}

/**
 * 统计节点数量
 */
function countNodes(nodes: KnowledgePointNode[]): number {
  let count = nodes.length;
  for (const node of nodes) {
    count += countNodes(node.children);
  }
  return count;
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
📚 知识点导入工具

用法:
  npx ts-node scripts/import-knowledge-points.ts [选项]

选项:
  --subject <科目>  只导入指定科目 (math|chinese|english)
  --clear          导入前清空现有数据
  --dry-run        只解析不导入，显示预览
  --help           显示此帮助信息

示例:
  npx ts-node scripts/import-knowledge-points.ts
  npx ts-node scripts/import-knowledge-points.ts --subject math
  npx ts-node scripts/import-knowledge-points.ts --subject chinese --clear
  npx ts-node scripts/import-knowledge-points.ts --dry-run

科目代码:
  math     - 数学
  chinese  - 语文
  english  - 英语
`);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 解析参数
  const options = {
    subject: undefined as Subject | undefined,
    clear: false,
    dryRun: false,
    help: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--subject') {
      const subjectValue = args[++i];
      if (subjectValue === 'math') options.subject = Subject.MATH;
      else if (subjectValue === 'chinese') options.subject = Subject.CHINESE;
      else if (subjectValue === 'english') options.subject = Subject.ENGLISH;
      else {
        console.error(`❌ 无效的科目：${subjectValue}`);
        process.exit(1);
      }
    } else if (arg === '--clear') {
      options.clear = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  console.log('🌱 知识点导入工具\n');
  
  const filePath = path.join(__dirname, '../docs/knowledge-points/人教版小学知识点树.md');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在：${filePath}`);
    process.exit(1);
  }
  
  console.log(`📖 读取文件：${filePath}`);
  
  if (options.subject) {
    console.log(`🎯 目标科目：${options.subject}\n`);
  } else {
    console.log(`🎯 目标科目：全部\n`);
  }
  
  // 解析知识点
  const knowledgePoints = parseKnowledgePoints(filePath, options.subject);
  const totalCount = countNodes(knowledgePoints);
  
  console.log(`📊 解析完成，共 ${totalCount} 个知识点\n`);
  
  if (options.dryRun) {
    console.log('🔍 预览模式 - 不会写入数据库\n');
    
    function printTree(nodes: KnowledgePointNode[], indent: number = 0) {
      for (const node of nodes) {
        console.log(`${'  '.repeat(indent)}${node.code} - ${node.name}`);
        printTree(node.children, indent + 1);
      }
    }
    
    printTree(knowledgePoints);
    console.log(`\n✅ 预览完成，共 ${totalCount} 个知识点`);
    process.exit(0);
  }
  
  // 清空数据
  if (options.clear) {
    console.log('🧹 清空现有知识点数据...');
    await prisma.knowledgePoint.deleteMany({});
    console.log('✓ 清空完成\n');
  }
  
  // 创建知识点
  console.log('💾 开始导入数据库...\n');
  const progressBar = new ProgressBar(totalCount);
  await createKnowledgePoints(knowledgePoints, undefined, progressBar);
  
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
