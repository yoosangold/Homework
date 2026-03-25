# 🚀 Vercel 部署指南

## 方式 1: 通过 Vercel 官网（最简单，推荐）

### 步骤

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择 "Import Git Repository"
   - 找到 `yoosangold/Homework` 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js (会自动识别)
   - **Root Directory**: `homework-correction-system`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **添加环境变量**
   
   点击 "Environment Variables"，添加以下变量：
   
   ```bash
   # 数据库配置
   DATABASE_URL="postgres://用户：密码@db.prisma.io:5432/postgres?sslmode=require"
   DIRECT_URL="postgres://用户：密码@db.prisma.io:5432/postgres?sslmode=require"
   
   # NextAuth 认证
   NEXTAUTH_SECRET="homework-correction-system-secret-change-in-production"
   NEXTAUTH_URL="https://你的域名.vercel.app"
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟
   - 部署完成后会获得公网链接

---

## 方式 2: 使用 Vercel CLI（需要 Token）

### 获取 Vercel Token

1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 复制生成的 Token

### 配置 Token

**选项 A: 在 GitHub Secrets 中配置（用于 GitHub Actions）**

1. 访问 https://github.com/yoosangold/Homework/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加：
   - Name: `VERCEL_TOKEN`
   - Value: 你的 Vercel Token
4. 点击 "Add secret"

**选项 B: 本地使用**

```bash
# 设置环境变量
export VERCEL_TOKEN="你的 token"

# 部署
cd /home/admin/openclaw/workspace/homework-correction-system
vercel --prod --token=$VERCEL_TOKEN
```

---

## 方式 3: 直接访问 Vercel 控制台部署

### 快速部署链接

点击以下链接直接部署：

```
https://vercel.com/new/clone?repository-url=https://github.com/yoosangold/Homework&project-name=homework-correction-system&repository-name=Homework
```

---

## 📋 部署后检查清单

- [ ] 访问首页，确认页面正常加载
- [ ] 测试注册功能
- [ ] 测试登录功能
- [ ] 测试创建班级
- [ ] 测试添加学生
- [ ] 配置自定义域名（可选）

---

## 🔧 常见问题

### Q: 部署失败怎么办？

**检查构建日志**：
1. 访问 Vercel 项目页面
2. 点击 "Deployments"
3. 查看失败的部署，点击查看详情
4. 检查错误信息

**常见错误**：
- `DATABASE_URL not found` → 添加环境变量
- `Build failed` → 检查 package.json 和 next.config.js

### Q: 如何更新部署？

推送到 GitHub 的 main 分支后，Vercel 会自动重新部署（如果配置了 GitHub 集成）。

### Q: 如何配置自定义域名？

1. Vercel 项目 → Settings → Domains
2. 添加你的域名
3. 按照提示配置 DNS

---

## 📞 需要帮助？

- Vercel 文档：https://vercel.com/docs
- Next.js 部署：https://nextjs.org/docs/deployment

---

**最后更新**: 2026-03-25 13:02
