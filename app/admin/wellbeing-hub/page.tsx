'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/rich-text-editor';
import { ImageUpload } from '@/components/image-upload';
import { Plus, Trash2, Download } from 'lucide-react';

interface WellbeingImage {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export default function WellbeingHubAdmin() {
  const [content, setContent] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);
  const [images, setImages] = useState<WellbeingImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchImages();
  }, []);

  async function fetchContent() {
    const { data, error } = await supabase
      .from('wellbeing_content')
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

  async function fetchImages() {
    const { data, error } = await supabase
      .from('wellbeing_images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching images:', error);
      return;
    }

    setImages(data || []);
  }

  async function handleSaveContent() {
    if (!contentId) return;

    setSavingContent(true);

    try {
      const { error } = await supabase
        .from('wellbeing_content')
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

  async function handleUploadImage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please select an image');
      return;
    }

    setUploadingImage(true);

    try {
      // Generate unique file path
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('wellbeing')
        .upload(filePath, selectedImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('wellbeing_images')
        .insert({
          filename: selectedImage.name,
          file_path: filePath,
          file_size: selectedImage.size,
          file_type: selectedImage.type
        });

      if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from('wellbeing').remove([filePath]);
        throw dbError;
      }

      resetUploadForm();
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDeleteImage(image: WellbeingImage) {
    if (!confirm(`Are you sure you want to delete "${image.filename}"?`)) return;

    setLoading(true);

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('wellbeing')
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('wellbeing_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadImage(image: WellbeingImage) {
    try {
      const { data, error } = await supabase.storage
        .from('wellbeing')
        .download(image.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  function resetUploadForm() {
    setSelectedImage(null);
    setIsUploadFormOpen(false);
  }

  function getImageUrl(filePath: string) {
    const { data } = supabase.storage
      .from('wellbeing')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Wellbeing Hub - Admin</h1>
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
                placeholder="Write your wellbeing hub content here..."
              />
            </div>
            <Button onClick={handleSaveContent} disabled={savingContent}>
              {savingContent ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </div>

        {/* Image Gallery Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Image Gallery</h2>
            <Button onClick={() => setIsUploadFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>

          {isUploadFormOpen && (
            <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <h3 className="font-semibold mb-4">Upload New Image</h3>
              <form onSubmit={handleUploadImage} className="space-y-4">
                <ImageUpload
                  onFileSelect={setSelectedImage}
                  maxSizeMB={5}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploadingImage || !selectedImage}>
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetUploadForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Images Grid */}
          {images.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No images uploaded yet. Upload your first one!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow"
                >
                  <img
                    src={getImageUrl(image.file_path)}
                    alt={image.filename}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {image.filename}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(image.file_size)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadImage(image)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
