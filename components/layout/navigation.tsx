"use client";

import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home, color: "terracotta" },
  { href: "/updates", label: "Updates", icon: Newspaper, color: "sage" },
  { href: "/policies", label: "Policies", icon: FileText, color: "terracotta" },
  { href: "/handbooks", label: "Handbooks", icon: BookOpen, color: "earth" },
  { href: "/wellbeing", label: "Wellbeing", icon: Heart, color: "terracotta" },
  { href: "/training", label: "Training", icon: GraduationCap, color: "sage" },
  { href: "/benefits", label: "Benefits", icon: Gift, color: "terracotta" },
  { href: "/hr-library", label: "HR Library", icon: FolderOpen, color: "earth" },
  { href: "/vacancies", label: "Vacancies", icon: Briefcase, color: "sage" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-earth-50/80 backdrop-blur-md border-b border-earth-200/50 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 overflow-x-auto py-3 scrollbar-hide">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "group relative flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap animate-scale-in",
                  isActive
                    ? "bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-organic"
                    : "text-slate-700 hover:bg-white/80 hover:shadow-md hover:scale-105"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                )}
                <Icon className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  isActive ? "drop-shadow-sm" : ""
                )} />
                <span className="hidden sm:inline relative z-10">{item.label}</span>
                {!isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    item.color === "terracotta" && "bg-terracotta-50",
                    item.color === "sage" && "bg-sage-50",
                    item.color === "earth" && "bg-earth-50"
                  )}></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
