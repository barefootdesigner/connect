import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";

async function getUpdates() {
  const { data, error } = await supabase
    .from('company_updates')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching updates:', error);
    return [];
  }

  return data || [];
}

// Helper function to extract plain text excerpt from HTML
function getExcerpt(html: string, maxLength: number = 200): string {
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export default async function UpdatesPage() {
  const updates = await getUpdates();
  const featuredUpdate = updates[0]; // First one is featured
  const recentUpdates = updates.slice(1);

  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 sm:py-12 lg:py-20">
      {/* Page Header */}
      <div className="mb-12 sm:mb-16 lg:mb-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 pr-16 sm:pr-0">Company Updates</h1>
        <SearchBar />
      </div>

      {updates.length === 0 ? (
        <Card variant="content" padding="lg">
          <div className="text-center text-slate-500 py-8">
            <p>No updates available yet. Please check back later.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Featured Update */}
          {featuredUpdate && (
            <Card variant="elevated" className="mb-8 sm:mb-12 lg:mb-16 border-primary-500 border-2 rounded-3xl shadow-[8px_8px_24px_0px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary">Featured</Badge>
                  <span className="text-sm text-slate-500">
                    {new Date(featuredUpdate.published_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <CardTitle className="text-2xl">{featuredUpdate.title}</CardTitle>
                <CardDescription className="text-base">
                  {getExcerpt(featuredUpdate.content, 250)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/updates/${featuredUpdate.id}`}
                  className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium"
                >
                  Read more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Updates Grid */}
          {recentUpdates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
              {recentUpdates.map((update) => (
                <Card key={update.id} variant="content" className="hover:shadow-[10px_10px_28px_0px_rgba(0,0,0,0.15)] transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">
                        {new Date(update.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <CardTitle>{update.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {getExcerpt(update.content, 150)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/updates/${update.id}`}
                      className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium"
                    >
                      Read more <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
