"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="bg-mesh border-b border-earth-200/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-terracotta-500 to-terracotta-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-organic transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-serif font-bold text-2xl italic">i</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-sage-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight group-hover:text-terracotta-600 transition-colors">
                iSTEP Portal
              </span>
              <span className="text-xs font-sans text-slate-500 tracking-wide">Nurture & Grow</span>
            </div>
          </Link>

          {/* iCare Chat Bubble */}
          <button
            className="group relative flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white rounded-full hover:shadow-organic-hover transition-all duration-300 hover:scale-105 overflow-hidden"
            onClick={() => {
              // This will be connected to iCare chat later
              alert("iCare chat integration coming soon!");
            }}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <Sparkles className="h-4 w-4 animate-pulse" />
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline font-medium tracking-wide">iCare Companion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
