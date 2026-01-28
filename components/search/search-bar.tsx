"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "./search-modal";

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-lg border border-gray-300 hover:border-primary-500 transition-colors text-gray-600 hover:text-gray-900"
      >
        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-xs sm:text-sm hidden xs:inline">Search portal...</span>
        <span className="text-xs sm:text-sm xs:hidden">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-300">
          ⌘K
        </kbd>
      </button>
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
