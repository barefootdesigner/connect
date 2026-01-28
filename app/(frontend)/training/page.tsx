"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileCard } from "@/components/ui/file-card";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/search/search-bar";
import { cleanFileName } from "@/lib/utils";

interface TrainingContent {
  id: string;
  content: string;
  updated_at: string;
}

interface TrainingFile {
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

export default function TrainingPage() {
  const [content, setContent] = useState<TrainingContent | null>(null);
  const [files, setFiles] = useState<TrainingFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch content
    const { data: contentData } = await supabase
      .from('training_content')
      .select('*')
      .limit(1)
      .single();

    if (contentData) {
      setContent(contentData);
    }

    // Fetch files
    const { data: filesData } = await supabase
      .from('training_files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (filesData) {
      setFiles(filesData);
    }

    setLoading(false);
  }

  async function handleDownload(file: TrainingFile) {
    try {
      const { data, error } = await supabase.storage
        .from('training')
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

  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 sm:py-12 lg:py-20">
      {/* Page Header */}
      <div className="mb-12 sm:mb-16 lg:mb-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 pr-16 sm:pr-0">Training & Development</h1>
        <SearchBar />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading training content...</p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {/* Content Section */}
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Content */}
              <div className="p-6 sm:p-8 lg:p-12">
                {content?.content ? (
                  <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    <p>No training content available yet.</p>
                  </div>
                )}
              </div>

              {/* Right: Image */}
              <div className="relative h-full min-h-[400px]">
                <img
                  src="/images/trainingfeature.jpeg"
                  alt="Training"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Files Section */}
          {files.length > 0 && (
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 lg:mb-10">Training Materials</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
