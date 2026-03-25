# 🚀 Vercel 一键部署

## 快速部署链接

**点击下方链接直接部署：**

```
https://vercel.com/new/clone?repository-url=https://github.com/yoosangold/Homework&project-name=homework-correction&repository-name=homework-correction
```

---

## 部署步骤

### 1️⃣ 点击部署链接

点击上方链接，会自动跳转到 Vercel 导入页面。

### 2️⃣ 登录 Vercel

- 如果没有 Vercel 账号，使用 GitHub 账号注册
- 如果已有账号，直接登录

### 3️⃣ 导入仓库

- Vercel 会自动识别 GitHub 仓库
- 点击 **"Import"** 按钮

### 4️⃣ 配置项目

**Root Directory**: 
```
homework-correction-system
```

**Framework Preset**: Next.js（会自动识别）

### 5️⃣ 添加环境变量

点击 **"Environment Variables"**，添加以下 4 个变量：

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgres://14cf07f41bd98213fce15eba0328189db619c93c7fa6689be1a699cec94672d9:sk_gV2i2e6AGpvSfwkBEnyrH@db.prisma.io:5432/postgres?sslmode=require` |
| `DIRECT_URL` | `postgres://14cf07f41bd98213fce15eba0328189db619c93c7fa6689be1a699cec94672d9:sk_gV2i2e6AGpvSfwkBEnyrH@db.prisma.io:5432/postgres?sslmode=require` |
| `NEXTAUTH_SECRET` | `homework-correction-system-secret` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` (部署后替换为实际域名) |

### 6️⃣ 点击 Deploy

- 点击 **"Deploy"** 按钮
- 等待 2-3 分钟
- 部署成功后会显示 **"Congratulations!"**

### 7️⃣ 访问应用

- 点击 **"Go to Dashboard"**
- 点击域名链接访问你的应用

---

## ✅ 部署完成后的操作

1. **测试功能**
   - 访问首页
   - 注册账号
   - 登录
   - 创建班级
   - 添加学生

2. **更新 NEXTAUTH_URL**
   - 在 Vercel 项目设置中
   - 将 `NEXTAUTH_URL` 更新为实际的 Vercel 域名
   - 重新部署（Redeploy）

---

## 🔧 常见问题

### 问题 1: Root Directory 错误

**错误**: `Next.js project not found`

**解决**: 确保 Root Directory 设置为 `homework-correction-system`

### 问题 2: 构建失败

**错误**: `Build failed`

**解决**: 
1. 检查环境变量是否配置正确
2. 查看部署日志，找到具体错误
3. 确保 `DATABASE_URL` 和 `DIRECT_URL` 格式正确

### 问题 3: 登录失败

**错误**: `NextAuth error`

**解决**: 
1. 确保 `NEXTAUTH_SECRET` 已配置
2. 确保 `NEXTAUTH_URL` 与实际域名匹配

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 访问 Vercel 文档：https://vercel.com/docs

---

**部署成功后，你的应用将拥有一个永久的公网链接！** 🎉
