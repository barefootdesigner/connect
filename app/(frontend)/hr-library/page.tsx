"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileCard } from "@/components/ui/file-card";
import { Folder, FolderOpen, ChevronLeft } from "lucide-react";
import { cn, cleanFileName } from "@/lib/utils";
import { SearchBar } from "@/components/search/search-bar";

interface Section {
  id: string;
  title: string;
  display_order: number;
  parent_section_id: string | null;
  files: HRFile[];
  subsections?: Section[];
}

interface HRFile {
  id: string;
  section_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  display_order: number;
  uploaded_at: string;
}

interface BreadcrumbItem {
  id: string | null;
  title: string;
}

function getFileType(mimeType: string): "pdf" | "word" | "excel" | "powerpoint" | "image" | "other" {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'excel';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'powerpoint';
  if (mimeType.includes('image')) return 'image';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default function HRLibraryPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, title: 'HR Library' }]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('hr_library_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      setLoading(false);
      return;
    }

    const { data: filesData, error: filesError } = await supabase
      .from('hr_library_files')
      .select('*')
      .order('display_order', { ascending: true});

    if (filesError) {
      console.error('Error fetching files:', filesError);
      setLoading(false);
      return;
    }

    // Build nested structure
    const allSections = (sectionsData || []).map(section => ({
      ...section,
      files: (filesData || []).filter(file => file.section_id === section.id),
      subsections: []
    }));

    // Separate parent and child sections
    const parentSections = allSections.filter(s => !s.parent_section_id);
    const childSections = allSections.filter(s => s.parent_section_id);

    // Attach subsections to their parents
    parentSections.forEach(parent => {
      parent.subsections = childSections.filter(child => child.parent_section_id === parent.id);
    });

    setSections(parentSections);
    setLoading(false);
  }

  async function handleDownload(file: HRFile) {
    try {
      const { data, error } = await supabase.storage
        .from('hr-library')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  }

  function openFolder(section: Section) {
    setCurrentFolder(section.id);
    setBreadcrumbs([...breadcrumbs, { id: section.id, title: section.title }]);
  }

  function navigateToFolder(folderId: string | null) {
    setCurrentFolder(folderId);
    const index = breadcrumbs.findIndex(b => b.id === folderId);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "hr") {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  }

  // Get current view items (folders and files)
  function getCurrentItems() {
    if (currentFolder === null) {
      // Root level - show all parent sections
      return { folders: sections, files: [] };
    }

    // Find current section
    let currentSection: Section | undefined;
    for (const section of sections) {
      if (section.id === currentFolder) {
        currentSection = section;
        break;
      }
      if (section.subsections) {
        currentSection = section.subsections.find(s => s.id === currentFolder);
        if (currentSection) break;
      }
    }

    if (!currentSection) return { folders: [], files: [] };

    return {
      folders: currentSection.subsections || [],
      files: currentSection.files || []
    };
  }

  const { folders, files } = getCurrentItems();

  // Password Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)] p-8 sm:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-50 rounded-2xl">
                <FolderOpen className="h-12 w-12 text-primary-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              HR Library
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Enter the password to access HR documents
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
                Access HR Library
              </button>
            </form>

            {/* Hint */}
            <p className="text-xs text-gray-400 text-center mt-6">
              Contact HR if you need access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 sm:py-12 lg:py-20">
      {/* Page Header */}
      <div className="mb-8 sm:mb-12 lg:mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 pr-16 sm:pr-0">HR Library</h1>
          <SearchBar />
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-[4px_4px_12px_0px_rgba(0,0,0,0.08)] overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || 'root'} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => navigateToFolder(crumb.id)}
                className={cn(
                  "hover:text-blue-600 transition-colors",
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600"
                )}
              >
                {crumb.title}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading HR library...</p>
        </div>
      ) : (
        <>
          {/* Back Button (when not at root) */}
          {currentFolder !== null && (
            <button
              onClick={() => navigateToFolder(breadcrumbs[breadcrumbs.length - 2]?.id || null)}
              className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
          )}

          {/* Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Folders */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => openFolder(folder)}
                className="group flex flex-col items-center p-4 sm:p-6 bg-white rounded-3xl shadow-[4px_4px_12px_0px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_16px_0px_rgba(0,0,0,0.12)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <div className="mb-2 sm:mb-3 text-primary-500 group-hover:text-primary-600 transition-colors">
                  <Folder className="h-12 w-12 sm:h-16 sm:w-16" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center break-words w-full mb-1 sm:mb-2">
                  {cleanFileName(folder.title)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {(folder.files?.length || 0) + (folder.subsections?.reduce((sum, sub) => sum + (sub.files?.length || 0), 0) || 0)} items
                </p>
              </button>
            ))}

            {/* Files */}
            {files.map((file) => (
              <FileCard
                key={file.id}
                fileName={cleanFileName(file.filename)}
                fileType={getFileType(file.file_type)}
                fileSize={formatFileSize(file.file_size)}
                onDownload={() => handleDownload(file)}
              />
            ))}
          </div>

          {/* Empty State */}
          {folders.length === 0 && files.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)]">
              <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">This folder is empty</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
