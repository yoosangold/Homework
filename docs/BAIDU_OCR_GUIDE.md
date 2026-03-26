# 百度 OCR 接入指南

## 1. 申请百度 OCR 免费额度

### 步骤 1：注册百度账号
1. 访问 https://cloud.baidu.com/
2. 点击"免费注册"，使用手机号注册百度账号
3. 完成实名认证（必须，否则无法使用 OCR 服务）

### 步骤 2：创建 OCR 应用
1. 登录百度智能云控制台
2. 访问 AI 能力中心：https://console.bce.baidu.com/ai/
3. 选择"文字识别 OCR"
4. 点击"创建应用"
5. 填写应用信息：
   - 应用名称：作业批改系统
   - 应用描述：自动批改学生作业
6. 创建成功后，获取以下信息：
   - **App ID**
   - **API Key**
   - **Secret Key**

### 步骤 3：配置环境变量
将获取的密钥填入 `.env.local` 文件：

```bash
BAIDU_OCR_APP_ID=你的 APP_ID
BAIDU_OCR_API_KEY=你的 API_KEY
BAIDU_OCR_SECRET_KEY=你的 SECRET_KEY
```

### 步骤 4：重启服务
```bash
# 如果使用 PM2
pm2 restart homework-correction-system

# 或者重新运行
npm run dev
```

---

## 2. 免费额度说明

| 接口类型 | 免费额度 | QPS 限制 |
|---------|---------|---------|
| 通用文字识别 | 500 次/天 | 5 QPS |
| 表格文字识别 | 100 次/月 | 1 QPS |
| 公式识别 | 100 次/月 | 1 QPS |

**说明：**
- 每天 0 点重置免费额度
- QPS：每秒请求数限制
- 超出免费额度后：¥0.0035/次

---

## 3. 测试 OCR 是否正常工作

### 方法 1：使用测试脚本
```bash
cd /home/admin/openclaw/workspace/homework-correction-system
node -e "
const { recognizeText } = require('./lib/baidu-ocr');
const fs = require('fs');

// 读取测试图片
const image = fs.readFileSync('./test.jpg', 'base64');

// 调用 OCR
recognizeText(image).then(result => {
  console.log('识别结果:', result.text);
}).catch(err => {
  console.error('识别失败:', err.message);
});
"
```

### 方法 2：上传作业测试
1. 访问：http://localhost:3000/dashboard/assignments/upload
2. 上传一张包含计算题的图片
3. 系统会自动调用 OCR 识别并批改
4. 查看批改结果

---

## 4. 常见问题

### Q1: 提示"未授权访问"
**原因：** API Key 或 Secret Key 错误
**解决：** 检查环境变量是否正确配置

### Q2: 提示"QPS 超限"
**原因：** 并发请求太多
**解决：** 
- 降低并发
- 添加请求队列
- 升级付费套餐

### Q3: 识别准确率低
**原因：** 图片质量差、手写体潦草
**解决：**
- 确保图片清晰
- 光线充足
- 尽量使用打印体

### Q4: 额度用完了怎么办？
**方案：**
1. 等第二天（每天 0 点重置）
2. 升级付费套餐
3. 申请教育优惠

---

## 5. 教育优惠申请

如果是教育机构，可以申请更高免费额度：

1. 访问：https://cloud.baidu.com/support/edu
2. 提交教育机构证明
3. 审核通过后，免费额度提升至：
   - 通用文字识别：5000 次/天
   - 其他接口：1000 次/月

---

## 6. 成本估算

### 小规模使用（<100 份作业/天）
- 每份作业平均 5 道题
- 每次 OCR 识别约 1 次请求
- 每天 100 次 << 500 次免费额度
- **成本：¥0/月**

### 中等规模（100-500 份作业/天）
- 每天 500 次 = 免费额度用完
- 超出部分：¥0.0035/次
- 每月成本：¥0（控制在免费额度内）

### 大规模（>500 份作业/天）
- 假设每天 1000 次
- 超出 500 次/天 × 30 天 × ¥0.0035 = ¥52.5/月
- **成本：约¥50-100/月**

---

## 7. 优化建议

### 1. 图片压缩
上传前压缩图片，减少传输时间：
```typescript
// 前端压缩图片
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// ... 压缩逻辑
```

### 2. 批量识别
多张图片合并成一张，减少请求次数

### 3. 缓存结果
相同图片不重复识别

### 4. 本地预处理
- 图片二值化
- 去噪
- 增强对比度
提高 OCR 准确率

---

## 8. 技术支持

- 百度 OCR 文档：https://ai.baidu.com/ai-doc/OCR
- API 错误码：https://ai.baidu.com/ai-doc/OCR/Ok3h7xqqe
- 社区论坛：https://bbs.cloud.baidu.com/
