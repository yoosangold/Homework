import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // 如果已登录，直接跳转到仪表盘
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-blue-600">Homework Correction System</h1>
          <p className="text-2xl text-gray-600">作业批改系统</p>
          <p className="text-gray-500">智能批改 · 错题管理 · 艾宾浩斯复习计划</p>
        </div>
        
        <div className="flex gap-4 justify-center mt-12">
          <Link 
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition shadow-lg"
          >
            登录
          </Link>
          <Link 
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-medium hover:bg-blue-50 transition shadow-lg"
          >
            注册
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">📚 作业批改</h3>
            <p className="text-gray-600">支持数学、语文、英语多科目作业上传与批改</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">📝 错题本</h3>
            <p className="text-gray-600">自动收录错题，关联知识点，追踪掌握状态</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">🔄 智能复习</h3>
            <p className="text-gray-600">基于艾宾浩斯记忆曲线，自动生成复习计划</p>
          </div>
        </div>
      </div>
    </main>
  )
}
