'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/rich-text-editor';
import { FileUpload } from '@/components/file-upload';
import { Plus, Download, Trash2 } from 'lucide-react';

interface TrainingFile {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export default function TrainingAdmin() {
  const [content, setContent] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);
  const [files, setFiles] = useState<TrainingFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchFiles();
  }, []);

  async function fetchContent() {
    const { data, error } = await supabase
      .from('training_content')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching content:', error);
      return;
    }

    if (data) {
      setContentId(data.id);
      setContent(data.content || '');
    }
  }

  async function fetchFiles() {
    const { data, error } = await supabase
      .from('training_files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return;
    }

    setFiles(data || []);
  }

  async function handleSaveContent() {
    if (!contentId) return;

    setSavingContent(true);

    try {
      const { error } = await supabase
        .from('training_content')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', contentId);

      if (error) throw error;

      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSavingContent(false);
    }
  }

  async function handleUploadFile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploadingFile(true);

    try {
      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('training')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('training_files')
        .insert({
          filename: displayName || selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type
        });

      if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from('training').remove([filePath]);
        throw dbError;
      }

      resetUploadForm();
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleDeleteFile(file: TrainingFile) {
    if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) return;

    setLoading(true);

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('training')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('training_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadFile(file: TrainingFile) {
    try {
      const { data, error } = await supabase.storage
        .from('training')
        .download(file.file_path);

      if (error) throw error;

      // Create download link
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

  function resetUploadForm() {
    setSelectedFile(null);
    setDisplayName('');
    setIsUploadFormOpen(false);
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function getFileIcon(fileType: string) {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📊';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📈';
    return '📎';
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Training - Admin</h1>
        </div>

        {/* Page Content Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Page Content</h2>
          <div className="space-y-4">
            <div>
              <Label>Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your training content here..."
              />
            </div>
            <Button onClick={handleSaveContent} disabled={savingContent}>
              {savingContent ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Training Files</h2>
            <Button onClick={() => setIsUploadFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>

          {isUploadFormOpen && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold mb-4">Upload New File</h3>
              <form onSubmit={handleUploadFile} className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name (Optional)</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Leave blank to use filename"
                  />
                </div>
                <div>
                  <Label>File</Label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    acceptedTypes=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    maxSizeMB={10}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploadingFile || !selectedFile}>
                    {uploadingFile ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetUploadForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="divide-y divide-slate-200">
            {files.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No files uploaded yet. Upload your first one!
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl">{getFileIcon(file.file_type)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {file.filename}
                        </h3>
                        <div className="flex gap-4 text-sm text-slate-500">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>
                            {new Date(file.uploaded_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadFile(file)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteFile(file)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
