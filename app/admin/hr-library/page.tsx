'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/rich-text-editor';
import { FileUpload } from '@/components/file-upload';
import { Plus, Trash2, Download, ChevronUp, ChevronDown, Edit2, X } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  display_order: number;
  created_at: string;
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

export default function HRLibraryAdmin() {
  const [content, setContent] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [files, setFiles] = useState<Record<string, HRFile[]>>({});
  const [savingContent, setSavingContent] = useState(false);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchSections();
  }, []);

  async function fetchContent() {
    const { data, error } = await supabase
      .from('hr_library_content')
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

  async function fetchSections() {
    const { data, error } = await supabase
      .from('hr_library_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching sections:', error);
      return;
    }

    setSections(data || []);

    // Fetch files for each section
    if (data) {
      for (const section of data) {
        fetchFilesForSection(section.id);
      }
    }
  }

  async function fetchFilesForSection(sectionId: string) {
    const { data, error } = await supabase
      .from('hr_library_files')
      .select('*')
      .eq('section_id', sectionId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching files:', error);
      return;
    }

    setFiles(prev => ({ ...prev, [sectionId]: data || [] }));
  }

  async function handleSaveContent() {
    if (!contentId) return;

    setSavingContent(true);

    try {
      const { error } = await supabase
        .from('hr_library_content')
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

  async function handleAddSection() {
    if (!newSectionTitle.trim()) {
      alert('Please enter a section title');
      return;
    }

    try {
      const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) : -1;

      const { error } = await supabase
        .from('hr_library_sections')
        .insert({ title: newSectionTitle, display_order: maxOrder + 1 });

      if (error) throw error;

      setNewSectionTitle('');
      setIsAddingSectionOpen(false);
      fetchSections();
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Failed to add section. Please try again.');
    }
  }

  async function handleUpdateSection(sectionId: string) {
    if (!editSectionTitle.trim()) {
      alert('Please enter a section title');
      return;
    }

    try {
      const { error } = await supabase
        .from('hr_library_sections')
        .update({ title: editSectionTitle })
        .eq('id', sectionId);

      if (error) throw error;

      setEditingSectionId(null);
      setEditSectionTitle('');
      fetchSections();
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Failed to update section. Please try again.');
    }
  }

  async function handleDeleteSection(sectionId: string) {
    if (!confirm('Are you sure you want to delete this section and all its files?')) return;

    try {
      // Files will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('hr_library_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section. Please try again.');
    }
  }

  async function handleMoveSectionUp(index: number) {
    if (index === 0) return;

    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];

    // Update display_order for both
    try {
      await supabase
        .from('hr_library_sections')
        .update({ display_order: index })
        .eq('id', newSections[index].id);

      await supabase
        .from('hr_library_sections')
        .update({ display_order: index - 1 })
        .eq('id', newSections[index - 1].id);

      fetchSections();
    } catch (error) {
      console.error('Error reordering sections:', error);
    }
  }

  async function handleMoveSectionDown(index: number) {
    if (index === sections.length - 1) return;

    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];

    // Update display_order for both
    try {
      await supabase
        .from('hr_library_sections')
        .update({ display_order: index + 1 })
        .eq('id', newSections[index + 1].id);

      await supabase
        .from('hr_library_sections')
        .update({ display_order: index })
        .eq('id', newSections[index].id);

      fetchSections();
    } catch (error) {
      console.error('Error reordering sections:', error);
    }
  }

  async function handleUploadFile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !uploadingSectionId) {
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
        .from('hr-library')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get max order for this section
      const sectionFiles = files[uploadingSectionId] || [];
      const maxOrder = sectionFiles.length > 0 ? Math.max(...sectionFiles.map(f => f.display_order)) : -1;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('hr_library_files')
        .insert({
          section_id: uploadingSectionId,
          filename: displayName || selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          display_order: maxOrder + 1
        });

      if (dbError) {
        await supabase.storage.from('hr-library').remove([filePath]);
        throw dbError;
      }

      setSelectedFile(null);
      setDisplayName('');
      setUploadingSectionId(null);
      fetchFilesForSection(uploadingSectionId);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteFile(file: HRFile) {
    if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('hr-library')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('hr_library_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      fetchFilesForSection(file.section_id);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  }

  async function handleDownloadFile(file: HRFile) {
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

  async function handleMoveFileUp(sectionId: string, index: number) {
    const sectionFiles = files[sectionId] || [];
    if (index === 0) return;

    const newFiles = [...sectionFiles];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];

    try {
      await supabase
        .from('hr_library_files')
        .update({ display_order: index })
        .eq('id', newFiles[index].id);

      await supabase
        .from('hr_library_files')
        .update({ display_order: index - 1 })
        .eq('id', newFiles[index - 1].id);

      fetchFilesForSection(sectionId);
    } catch (error) {
      console.error('Error reordering files:', error);
    }
  }

  async function handleMoveFileDown(sectionId: string, index: number) {
    const sectionFiles = files[sectionId] || [];
    if (index === sectionFiles.length - 1) return;

    const newFiles = [...sectionFiles];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];

    try {
      await supabase
        .from('hr_library_files')
        .update({ display_order: index + 1 })
        .eq('id', newFiles[index + 1].id);

      await supabase
        .from('hr_library_files')
        .update({ display_order: index })
        .eq('id', newFiles[index].id);

      fetchFilesForSection(sectionId);
    } catch (error) {
      console.error('Error reordering files:', error);
    }
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Library - Admin</h1>
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
                placeholder="Write your HR Library introduction here..."
              />
            </div>
            <Button onClick={handleSaveContent} disabled={savingContent}>
              {savingContent ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sections & Files</h2>
            <Button onClick={() => setIsAddingSectionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {isAddingSectionOpen && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold mb-4">Add New Section</h3>
              <div className="flex gap-2">
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Section title (e.g., Employee Contracts)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                />
                <Button onClick={handleAddSection}>Add</Button>
                <Button variant="outline" onClick={() => {
                  setIsAddingSectionOpen(false);
                  setNewSectionTitle('');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {sections.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No sections yet. Add your first one!
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="p-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {editingSectionId === section.id ? (
                        <div className="flex gap-2 flex-1">
                          <Input
                            value={editSectionTitle}
                            onChange={(e) => setEditSectionTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateSection(section.id)}
                          />
                          <Button size="sm" onClick={() => handleUpdateSection(section.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingSectionId(null);
                            setEditSectionTitle('');
                          }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingSectionId(section.id);
                              setEditSectionTitle(section.title);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveSectionUp(sectionIndex)}
                        disabled={sectionIndex === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveSectionDown(sectionIndex)}
                        disabled={sectionIndex === sections.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUploadingSectionId(section.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Upload File
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Upload Form */}
                  {uploadingSectionId === section.id && (
                    <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <h4 className="font-semibold mb-3">Upload File to "{section.title}"</h4>
                      <form onSubmit={handleUploadFile} className="space-y-3">
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
                          <Button type="button" variant="outline" onClick={() => {
                            setUploadingSectionId(null);
                            setSelectedFile(null);
                            setDisplayName('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Files List */}
                  {files[section.id] && files[section.id].length > 0 ? (
                    <div className="space-y-2">
                      {files[section.id].map((file, fileIndex) => (
                        <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{file.filename}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(file.file_size)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveFileUp(section.id, fileIndex)}
                              disabled={fileIndex === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveFileDown(section.id, fileIndex)}
                              disabled={fileIndex === files[section.id].length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadFile(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteFile(file)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No files in this section yet</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
