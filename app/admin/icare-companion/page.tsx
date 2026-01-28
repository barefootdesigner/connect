'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';

export default function ICareCompanionAdmin() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [chatUrl, setChatUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('icare_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }

    if (data) {
      setSettingsId(data.id);
      setChatUrl(data.chat_url);
      setEnabled(data.enabled);
      setWelcomeMessage(data.welcome_message);
    }
  }

  async function handleSaveSettings() {
    if (!settingsId) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('icare_settings')
        .update({
          chat_url: chatUrl,
          enabled,
          welcome_message: welcomeMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', settingsId);

      if (error) throw error;

      alert('Settings saved successfully! Refresh the page to see the chat bubble update.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">iCare Companion - Admin</h1>
          <p className="text-slate-600 mt-2">Configure the AI chat assistant settings</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-orange-500" />
              Chat Bubble Configuration
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              The chat bubble will appear in the bottom-right corner of all pages when enabled.
            </p>
          </div>

          <div className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
              <input
                type="checkbox"
                id="enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <div>
                <Label htmlFor="enabled" className="text-base font-medium cursor-pointer">
                  Enable Chat Bubble
                </Label>
                <p className="text-sm text-slate-600">
                  Show the iCare Companion chat bubble to all users
                </p>
              </div>
            </div>

            {/* Chat URL */}
            <div>
              <Label htmlFor="chatUrl">Chat Server URL</Label>
              <Input
                id="chatUrl"
                value={chatUrl}
                onChange={(e) => setChatUrl(e.target.value)}
                placeholder="https://your-chat-server.up.railway.app"
              />
              <p className="text-xs text-slate-500 mt-1">
                Your Railway chatbot URL (without trailing slash)
              </p>
            </div>

            {/* Welcome Message */}
            <div>
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                placeholder="Hi! I'm iCare Companion. How can I help you today?"
              />
              <p className="text-xs text-slate-500 mt-1">
                The first message users see when they open the chat
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold mb-2">Preview</h3>
            <p className="text-sm text-slate-600 mb-4">
              The chat bubble will appear in the bottom-right corner like this:
            </p>
            <div className="relative h-32 bg-white rounded-lg border border-slate-200">
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center">
                <MessageCircle className="h-7 w-7" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {enabled ? '✅ Chat bubble is currently enabled' : '❌ Chat bubble is currently disabled'}
            </p>
          </div>

          {/* Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The chat bubble connects to your Railway chatbot API</li>
              <li>• Users can click the bubble to open the chat interface</li>
              <li>• Messages are sent to <code className="bg-blue-100 px-1 rounded">/api/nursery/chat</code> endpoint</li>
              <li>• Chat history is maintained during the session</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
