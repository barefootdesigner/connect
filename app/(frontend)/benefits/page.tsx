"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SearchBar } from "@/components/search/search-bar";

export default function BenefitsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    const { data, error } = await supabase
      .from('benefits_content')
      .select('content')
      .single();

    if (error) {
      console.error('Error fetching benefits content:', error);
    } else {
      setContent(data?.content || '');
    }
    setLoading(false);
  }

  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 sm:py-12 lg:py-20">
      {/* Page Header */}
      <div className="mb-12 sm:mb-16 lg:mb-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 pr-16 sm:pr-0">Employee Benefits</h1>
        <SearchBar />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading benefits information...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Content */}
            <div className="p-6 sm:p-8 lg:p-12">
              {content ? (
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <p>No benefits information available yet.</p>
                </div>
              )}
            </div>

            {/* Right: Image */}
            <div className="relative h-full min-h-[400px]">
              <img
                src="/images/staffbenfitfeature.jpeg"
                alt="Employee Benefits"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
