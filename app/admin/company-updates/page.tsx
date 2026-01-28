'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface CompanyUpdate {
  id: string;
  title: string;
  content: string;
  published_at: string;
}

export default function CompanyUpdatesAdmin() {
  const [updates, setUpdates] = useState<CompanyUpdate[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, []);

  async function fetchUpdates() {
    const { data, error } = await supabase
      .from('company_updates')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching updates:', error);
      return;
    }

    setUpdates(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('company_updates')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('company_updates')
          .insert({ title, content });

        if (error) throw error;
      }

      resetForm();
      fetchUpdates();
    } catch (error) {
      console.error('Error saving update:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this update?')) return;

    const { error } = await supabase
      .from('company_updates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting update:', error);
      return;
    }

    fetchUpdates();
  }

  function handleEdit(update: CompanyUpdate) {
    setEditingId(update.id);
    setTitle(update.title);
    setContent(update.content);
    setIsFormOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsFormOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Company Updates - Admin</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Update
          </Button>
        </div>

        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Update' : 'Create New Update'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter update title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your company update here..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
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
            <h2 className="text-xl font-semibold">All Updates</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {updates.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No updates yet. Create your first one!
              </div>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="p-6 hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {update.title}
                      </h3>
                      <div
                        className="prose prose-sm max-w-none text-slate-600 mb-2"
                        dangerouslySetInnerHTML={{ __html: update.content }}
                      />
                      <p className="text-sm text-slate-400">
                        {new Date(update.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(update)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(update.id)}
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
