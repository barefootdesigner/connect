import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getUpdate(id: string) {
  const { data, error } = await supabase
    .from('company_updates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const update = await getUpdate(id);

  if (!update) {
    notFound();
  }

  return (
    <div className="px-24 py-20">
      {/* Back Button */}
      <Link
        href="/updates"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Updates</span>
      </Link>

      {/* Article Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Badge variant="primary">Company Update</Badge>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {new Date(update.published_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {update.title}
        </h1>
      </div>

      {/* Article Content */}
      <Card variant="content" padding="lg" className="max-w-4xl">
        <div
          className="prose prose-slate prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: update.content }}
        />
      </Card>

      {/* Back Button at Bottom */}
      <div className="mt-12">
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Updates</span>
        </Link>
      </div>
    </div>
  );
}
