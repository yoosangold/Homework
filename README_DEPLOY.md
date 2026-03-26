# 作业批改系统 - 部署说明

## 快速开始

### 1. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的配置：
```bash
# 百度 OCR（免费，每天 500 次）
BAIDU_OCR_APP_ID=你的 APP_ID
BAIDU_OCR_API_KEY=你的 API_KEY
BAIDU_OCR_SECRET_KEY=你的 SECRET_KEY

# NextAuth
NEXTAUTH_SECRET="homework-correction-system-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# 数据库
DATABASE_URL="你的数据库连接"
DIRECT_URL="你的数据库连接"
```

### 2. 获取百度 OCR 密钥

访问：https://console.bce.baidu.com/ai/#/ai/ocr/app/list

1. 登录百度智能云
2. 创建 OCR 应用
3. 获取 App ID、API Key、Secret Key
4. 填入 `.env.local`

**免费额度：每天 500 次识别**

### 3. 安装依赖
```bash
npm install
```

### 4. 数据库迁移
```bash
npx prisma migrate dev
```

### 5. 启动服务
```bash
npm run dev
```

访问：http://localhost:3000

---

## 功能说明

### 1. 上传作业 → 自动批改
- 支持 JPG、PNG 格式
- 自动识别计算题
- 自动判断对错
- 自动生成得分和反馈

### 2. 错题本
- 自动收录错题
- 按知识点分类
- 支持导出 CSV

### 3. 复习计划
- 艾宾浩斯记忆曲线
- 智能提醒复习

---

## 成本说明

**完全免费！**

- 百度 OCR：500 次/天免费额度
- 适合每天 100 份作业以内
- 超出后：¥0.0035/次

---

## 常见问题

### Q: 没有百度 OCR 密钥能用吗？
A: 可以，系统会使用模拟数据进行测试，但无法真实批改作业。

### Q: 识别准确率低？
A: 确保图片清晰、光线充足。手写体识别率约 80-90%，打印体约 95%+。

### Q: 如何申请教育优惠？
A: 访问 https://cloud.baidu.com/support/edu，提交教育机构证明。

---

## 技术栈

- Next.js 14
- Prisma
- PostgreSQL
- NextAuth
- 百度 OCR
- Tailwind CSS

---

## 开发文档

- [百度 OCR 接入指南](./BAIDU_OCR_GUIDE.md)
- [API 文档](./API.md)
- [数据库设计](./DATABASE.md)
