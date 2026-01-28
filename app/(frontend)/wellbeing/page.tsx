"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";

interface WellbeingContent {
  id: string;
  content: string;
  updated_at: string;
}

interface WellbeingImage {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export default function WellbeingPage() {
  const [content, setContent] = useState<WellbeingContent | null>(null);
  const [images, setImages] = useState<WellbeingImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch content
    const { data: contentData } = await supabase
      .from('wellbeing_content')
      .select('*')
      .limit(1)
      .single();

    if (contentData) {
      setContent(contentData);
    }

    // Fetch images
    const { data: imagesData } = await supabase
      .from('wellbeing_images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (imagesData) {
      setImages(imagesData);
    }

    setLoading(false);
  }

  function getImageUrl(filePath: string) {
    const { data } = supabase.storage
      .from('wellbeing')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleImageDownload(image: WellbeingImage) {
    try {
      const { data, error } = await supabase.storage
        .from('wellbeing')
        .download(image.file_path);

      if (error) throw error;

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

  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 sm:py-12 lg:py-20">
      {/* Page Header */}
      <div className="mb-12 sm:mb-16 lg:mb-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 pr-16 sm:pr-0">Wellbeing Hub</h1>
        <SearchBar />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading wellbeing content...</p>
        </div>
      ) : (
        <>
          {/* Content Section */}
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)] overflow-hidden mb-8 sm:mb-12 lg:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Content */}
              <div className="p-6 sm:p-8 lg:p-12">
                {content?.content ? (
                  <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    <p>No wellbeing content available yet.</p>
                  </div>
                )}
              </div>

              {/* Right: Image */}
              <div className="relative h-full min-h-[400px]">
                <img
                  src="/images/wellbeingfeature.jpeg"
                  alt="Wellbeing"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          {images.length > 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
              {images.map((image) => (
                <div key={image.id} className="break-inside-avoid mb-6">
                  <div className="bg-white rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)] overflow-hidden group">
                    <div className="relative">
                      <img
                        src={getImageUrl(image.file_path)}
                        alt={image.filename}
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <Button
                          variant="primary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={() => handleImageDownload(image)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
