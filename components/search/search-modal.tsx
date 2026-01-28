"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { cleanFileName } from "@/lib/utils";
import {
  Search,
  X,
  FileText,
  BookOpen,
  Newspaper,
  FolderOpen,
  GraduationCap,
  Download,
  ExternalLink,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  type: 'update' | 'handbook' | 'policy' | 'training' | 'hr-library-folder' | 'hr-library-file' | 'vacancy';
  category: string;
  excerpt?: string;
  href?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  storageTable?: string;
  isDownloadable: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const allResults: SearchResult[] = [];

    try {
      // Search Company Updates (Pages)
      const { data: updates } = await supabase
        .from('company_updates')
        .select('id, title, content')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      if (updates) {
        updates.forEach(update => {
          allResults.push({
            id: update.id,
            title: update.title,
            type: 'update',
            category: 'Company Updates',
            excerpt: update.content?.replace(/<[^>]*>/g, '').substring(0, 80) + '...',
            href: `/updates/${update.id}`,
            isDownloadable: false
          });
        });
      }

      // Search Handbooks (Downloads)
      const { data: handbooks } = await supabase
        .from('handbooks')
        .select('id, filename, file_path, file_size, file_type')
        .ilike('filename', `%${searchQuery}%`)
        .limit(10);

      if (handbooks) {
        handbooks.forEach(handbook => {
          allResults.push({
            id: handbook.id,
            title: cleanFileName(handbook.filename),
            type: 'handbook',
            category: 'Handbooks',
            filePath: handbook.file_path,
            fileName: handbook.filename,
            fileSize: handbook.file_size,
            fileType: handbook.file_type,
            storageTable: 'handbooks',
            isDownloadable: true
          });
        });
      }

      // Search Policies (Downloads)
      const { data: policies } = await supabase
        .from('policies')
        .select('id, filename, file_path, file_size, file_type')
        .ilike('filename', `%${searchQuery}%`)
        .limit(10);

      if (policies) {
        policies.forEach(policy => {
          allResults.push({
            id: policy.id,
            title: cleanFileName(policy.filename),
            type: 'policy',
            category: 'Policies',
            filePath: policy.file_path,
            fileName: policy.filename,
            fileSize: policy.file_size,
            fileType: policy.file_type,
            storageTable: 'policies',
            isDownloadable: true
          });
        });
      }

      // Search Training Files (Downloads)
      const { data: training } = await supabase
        .from('training_files')
        .select('id, filename, file_path, file_size, file_type')
        .ilike('filename', `%${searchQuery}%`)
        .limit(10);

      if (training) {
        training.forEach(file => {
          allResults.push({
            id: file.id,
            title: cleanFileName(file.filename),
            type: 'training',
            category: 'Training',
            filePath: file.file_path,
            fileName: file.filename,
            fileSize: file.file_size,
            fileType: file.file_type,
            storageTable: 'training',
            isDownloadable: true
          });
        });
      }

      // Search HR Library Folders
      const { data: hrSections } = await supabase
        .from('hr_library_sections')
        .select('id, title')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      if (hrSections) {
        hrSections.forEach(section => {
          allResults.push({
            id: section.id,
            title: cleanFileName(section.title),
            type: 'hr-library-folder',
            category: 'HR Library',
            href: '/hr-library',
            isDownloadable: false
          });
        });
      }

      // Search HR Library Files (Downloads)
      const { data: hrFiles } = await supabase
        .from('hr_library_files')
        .select('id, filename, file_path, file_size, file_type')
        .ilike('filename', `%${searchQuery}%`)
        .limit(10);

      if (hrFiles) {
        hrFiles.forEach(file => {
          allResults.push({
            id: file.id,
            title: cleanFileName(file.filename),
            type: 'hr-library-file',
            category: 'HR Library',
            filePath: file.file_path,
            fileName: file.filename,
            fileSize: file.file_size,
            fileType: file.file_type,
            storageTable: 'hr-library',
            isDownloadable: true
          });
        });
      }

      // Search Vacancies (Pages)
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, job_title, nursery_name, nursery_location')
        .ilike('job_title', `%${searchQuery}%`)
        .limit(5);

      if (jobs) {
        jobs.forEach(job => {
          allResults.push({
            id: job.id,
            title: job.job_title,
            type: 'vacancy',
            category: 'Vacancies',
            excerpt: `${job.nursery_name} - ${job.nursery_location}`,
            href: '/vacancies',
            isDownloadable: false
          });
        });
      }

      setResults(allResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleAction(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  async function handleDownload(result: SearchResult) {
    if (!result.filePath || !result.fileName || !result.storageTable) return;

    try {
      const { data, error } = await supabase.storage
        .from(result.storageTable)
        .download(result.filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
      setQuery("");
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  }

  function handleAction(result: SearchResult) {
    if (result.isDownloadable) {
      handleDownload(result);
    } else if (result.href) {
      router.push(result.href);
      onClose();
      setQuery("");
    }
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'update':
        return Newspaper;
      case 'handbook':
        return BookOpen;
      case 'policy':
        return FileText;
      case 'training':
        return GraduationCap;
      case 'hr-library-folder':
        return FolderOpen;
      case 'hr-library-file':
        return FileText;
      case 'vacancy':
        return Briefcase;
      default:
        return FileText;
    }
  };

  if (!isOpen) return null;

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    const key = result.isDownloadable ? 'Downloads' : 'Pages';
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200/50">
        {/* Search Input */}
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search for documents, updates, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-base sm:text-xl text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary-500"></div>
              <p className="text-gray-500 mt-4">Searching...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="p-12 text-center text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-gray-600">No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2 sm:py-3">
              {Object.entries(groupedResults).map(([groupName, groupResults]) => (
                <div key={groupName} className="mb-3 sm:mb-4">
                  <div className="px-4 sm:px-8 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {groupName}
                  </div>
                  {groupResults.map((result, index) => {
                    const globalIndex = results.indexOf(result);
                    const Icon = getIcon(result.type);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleAction(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full px-4 sm:px-8 py-3 sm:py-4 transition-all text-left flex items-center gap-3 sm:gap-4 group ${
                          isSelected ? 'bg-primary-50 border-l-2 sm:border-l-4 border-primary-500' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-colors flex-shrink-0 ${
                          isSelected ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                            isSelected ? 'text-primary-600' : 'text-gray-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1">
                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                              {result.title}
                            </h4>
                            <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">
                              {result.category}
                            </span>
                          </div>

                          {result.excerpt && (
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                              {result.excerpt}
                            </p>
                          )}

                          {result.fileSize && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(result.fileSize)}
                            </p>
                          )}
                        </div>

                        <div className={`flex items-center gap-2 transition-opacity flex-shrink-0 ${
                          isSelected ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
                        }`}>
                          {result.isDownloadable ? (
                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium">
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Download</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium">
                              <span className="hidden sm:inline">Open</span>
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">↵</kbd>
                <span className="hidden sm:inline">Select</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">ESC</kbd>
              <span className="hidden sm:inline">Close</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
