"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  FileText,
  BookOpen,
  Heart,
  GraduationCap,
  Gift,
  FolderOpen,
  Briefcase,
  MessageCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/updates", label: "Updates", icon: Newspaper },
  { href: "/policies", label: "Policies", icon: FileText },
  { href: "/handbooks", label: "Handbooks", icon: BookOpen },
  { href: "/wellbeing", label: "Wellbeing", icon: Heart },
  { href: "/training", label: "Training", icon: GraduationCap },
  { href: "/benefits", label: "Benefits", icon: Gift },
  { href: "/hr-library", label: "HR Library", icon: FolderOpen },
  { href: "/vacancies", label: "Vacancies", icon: Briefcase },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-primary-500 flex flex-col z-50 transition-transform duration-300",
          // Mobile: slide in/out
          "lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Logo */}
        <div className="p-6 border-b border-primary-600/30 flex justify-center">
          <Image
            src="/logo.png"
            alt="iSTEP Learning Logo"
            width={131}
            height={131}
            className="h-auto"
            priority
            unoptimized
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* iCare Button at Bottom */}
        <div className="p-4 border-t border-primary-600/30">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            onClick={() => {
              alert("iCare chat integration coming soon!");
            }}
          >
            <MessageCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">iCare</span>
          </button>
        </div>
      </aside>
    </>
  );
}
