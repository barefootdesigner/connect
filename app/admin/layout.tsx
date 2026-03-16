'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Lock,
  Newspaper,
  FileText,
  BookOpen,
  GraduationCap,
  Gift,
  Heart,
  FolderOpen,
  Briefcase,
  MessageCircle,
  LogOut,
} from 'lucide-react';

const ADMIN_PASSWORD = 'nursery@dm1n';

const navItems = [
  { href: '/admin/company-updates', label: 'Company Updates', icon: Newspaper },
  { href: '/admin/policies', label: 'Policies', icon: FileText },
  { href: '/admin/handbooks', label: 'Handbooks', icon: BookOpen },
  { href: '/admin/training', label: 'Training', icon: GraduationCap },
  { href: '/admin/benefits', label: 'Benefits', icon: Gift },
  { href: '/admin/wellbeing-hub', label: 'Wellbeing Hub', icon: Heart },
  // { href: '/admin/hr-library', label: 'HR Library', icon: FolderOpen },
  { href: '/admin/vacancies', label: 'Vacancies', icon: Briefcase },
  { href: '/admin/icare-companion', label: 'iCare Companion', icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      setError(true);
      setPassword('');
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setPassword('');
  }

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.2)] p-8 sm:p-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-slate-100 rounded-2xl">
                <Lock className="h-12 w-12 text-slate-700" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Admin Panel
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Enter the admin password to continue
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  placeholder="Admin password"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    error
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 focus:border-slate-500'
                  }`}
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <span className="font-bold text-lg tracking-tight">iStep Admin</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 pb-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
