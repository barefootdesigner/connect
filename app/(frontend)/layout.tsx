"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Menu, Lock } from "lucide-react";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem("portal_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "istep2024") {
      setIsAuthenticated(true);
      setError(false);
      localStorage.setItem("portal_authenticated", "true");
    } else {
      setError(true);
      setPassword("");
    }
  }

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-500 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)] p-8 sm:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-50 rounded-2xl">
                <Lock className="h-12 w-12 text-primary-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              iStep Connect
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Enter your password to access the portal
            </p>

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    error
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
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
                className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                Access Portal
              </button>
            </form>

            {/* Hint */}
            <p className="text-xs text-gray-400 text-center mt-6">
              Contact your administrator if you need access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-500">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 right-4 z-30 p-3 bg-primary-500 text-white rounded-xl shadow-lg lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{
            type: "tween",
            ease: [0.42, 0, 0.58, 1],
            duration: 0.4,
          }}
          className="fixed left-0 lg:left-64 right-0 top-0 bottom-0 bg-gray-50 lg:rounded-l-[2rem] overflow-y-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
