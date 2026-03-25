import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">欢迎回来，{session.user.name}！</h2>
        <p className="text-gray-600 mt-1">管理你的班级、作业和错题本</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 班级管理卡片 */}
        <Link href="/dashboard/classes" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏫</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">班级管理</h3>
                <p className="text-sm text-gray-600">管理学生和班级</p>
              </div>
            </div>
          </div>
        </Link>

        {/* 作业批改卡片 */}
        <Link href="/dashboard/assignments" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">作业批改</h3>
                <p className="text-sm text-gray-600">上传和批改作业</p>
              </div>
            </div>
          </div>
        </Link>

        {/* 错题本卡片 */}
        <Link href="/dashboard/wrong-questions" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">错题本</h3>
                <p className="text-sm text-gray-600">查看和管理错题</p>
              </div>
            </div>
          </div>
        </Link>

        {/* 复习计划卡片 */}
        <Link href="/dashboard/review-plans" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">复习计划</h3>
                <p className="text-sm text-gray-600">艾宾浩斯智能复习</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
