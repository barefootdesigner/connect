"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileCard } from "@/components/ui/file-card";
import { SearchBar } from "@/components/search/search-bar";
import { cleanFileName } from "@/lib/utils";

interface Handbook {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
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

export default function HandbooksPage() {
  const [handbooks, setHandbooks] = useState<Handbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandbooks();
  }, []);

  async function fetchHandbooks() {
    const { data, error } = await supabase
      .from('handbooks')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching handbooks:', error);
    } else {
      setHandbooks(data || []);
    }
    setLoading(false);
  }

  async function handleDownload(handbook: Handbook) {
    try {
      const { data, error } = await supabase.storage
        .from('handbooks')
        .download(handbook.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = handbook.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  }

  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 sm:py-12 lg:py-20">
      {/* Page Header */}
      <div className="mb-12 sm:mb-16 lg:mb-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 pr-16 sm:pr-0">Employee Handbooks</h1>
        <SearchBar />
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading handbooks...</p>
        </div>
      ) : handbooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)]">
          <p className="text-gray-600">No handbooks available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {handbooks.map((handbook) => (
            <FileCard
              key={handbook.id}
              fileName={cleanFileName(handbook.filename)}
              fileType={getFileType(handbook.file_type)}
              fileSize={formatFileSize(handbook.file_size)}
              onDownload={() => handleDownload(handbook)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
