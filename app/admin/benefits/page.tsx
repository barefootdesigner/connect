'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/rich-text-editor';

export default function BenefitsAdmin() {
  const [content, setContent] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    const { data, error } = await supabase
      .from('benefits_content')
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

  async function handleSaveContent() {
    if (!contentId) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('benefits_content')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', contentId);

      if (error) throw error;

      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Benefits - Admin</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Page Content</h2>
          <div className="space-y-4">
            <div>
              <Label>Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your benefits content here..."
              />
            </div>
            <Button onClick={handleSaveContent} disabled={saving}>
              {saving ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
