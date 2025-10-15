import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: string;
  readingTime: number;
  authorName: string;
}

interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BlogCategory() {
  const { lang, category } = useParams<{ lang: 'en' | 'fr'; category: string }>();
  const { t, i18n } = useTranslation();
  const currentLang = lang || (i18n.language as 'en' | 'fr') || 'en';

  const { data, isLoading } = useQuery<BlogPostsResponse>({
    queryKey: ['blog-category', category, currentLang],
    queryFn: async () => {
      const response = await fetch(
        `/api/blog/posts?lang=${currentLang}&category=${category}&page=1&limit=20`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
    enabled: !!category
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Link href={`/${currentLang}/blog`}>
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToBlog')}
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-12 capitalize">
        {category ? category.replace(/-/g, ' ') : ''}
      </h1>

      {data && data.posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.posts.map((post) => (
            <Link key={post.id} href={`/${currentLang}/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="aspect-video object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString(
                          currentLang === 'fr' ? 'fr-CA' : 'en-CA',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{t('blog.readingTime', { minutes: post.readingTime })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('blog.noPosts')}</p>
      )}
    </div>
  );
}
