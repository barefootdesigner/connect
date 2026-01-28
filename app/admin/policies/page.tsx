'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/file-upload';
import { Plus, Download, Trash2, FileText } from 'lucide-react';

interface Policy {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export default function PoliciesAdmin() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching policies:', error);
      return;
    }

    setPolicies(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    try {
      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('policies')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('policies')
        .insert({
          filename: displayName || selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type
        });

      if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from('policies').remove([filePath]);
        throw dbError;
      }

      resetForm();
      fetchPolicies();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(policy: Policy) {
    if (!confirm(`Are you sure you want to delete "${policy.filename}"?`)) return;

    setLoading(true);

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('policies')
        .remove([policy.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('policies')
        .delete()
        .eq('id', policy.id);

      if (dbError) throw dbError;

      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(policy: Policy) {
    try {
      const { data, error } = await supabase.storage
        .from('policies')
        .download(policy.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = policy.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  }

  function resetForm() {
    setSelectedFile(null);
    setDisplayName('');
    setIsFormOpen(false);
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
    return '📎';
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Policies - Admin</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Policy
          </Button>
        </div>

        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload New Policy</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  acceptedTypes=".pdf,.doc,.docx"
                  maxSizeMB={10}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading || !selectedFile}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold">All Policies</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {policies.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No policies uploaded yet. Upload your first one!
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl">{getFileIcon(policy.file_type)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {policy.filename}
                        </h3>
                        <div className="flex gap-4 text-sm text-slate-500">
                          <span>{formatFileSize(policy.file_size)}</span>
                          <span>
                            {new Date(policy.uploaded_at).toLocaleDateString('en-GB', {
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
                        onClick={() => handleDownload(policy)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(policy)}
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
