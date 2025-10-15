import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  publishedAt: string;
  readingTime: number;
  viewCount: number;
  authorName: string;
  authorAvatar: string | null;
  categoryName: string;
  categorySlug: string;
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

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export default function BlogLanding() {
  const { lang } = useParams<{ lang: 'en' | 'fr' }>();
  const { t, i18n } = useTranslation();
  const currentLang = lang || (i18n.language as 'en' | 'fr') || 'en';

  // Fetch blog posts
  const { data, isLoading, error } = useQuery<BlogPostsResponse>({
    queryKey: ['blog-posts', currentLang, 1],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts?lang=${currentLang}&page=1&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['blog-categories', currentLang],
    queryFn: async () => {
      const response = await fetch(`/api/blog/categories?lang=${currentLang}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">Error loading blog posts. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('blog.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('blog.subtitle')}
        </p>
      </div>

      {/* Categories Filter */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Link href={`/${currentLang}/blog`}>
            <Button variant="outline">{t('blog.allPosts')}</Button>
          </Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/${currentLang}/blog/category/${category.slug}`}>
              <Button variant="outline">{category.name}</Button>
            </Link>
          ))}
        </div>
      )}

      {/* Blog Posts Grid */}
      {data && data.posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {data.posts.map((post) => (
            <Link key={post.id} href={`/${currentLang}/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.featuredImageAlt || post.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  {post.categoryName && (
                    <div className="text-sm text-primary font-medium mb-2">
                      {post.categoryName}
                    </div>
                  )}
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
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
                  {post.authorName && (
                    <div className="flex items-center gap-2 mt-4">
                      {post.authorAvatar && (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-4 h-4" />
                        <span>{post.authorName}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t('blog.noPosts')}</p>
        </div>
      )}

      {/* Pagination (TODO: Implement in future iterations) */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Button variant="outline">{t('blog.loadMore')}</Button>
        </div>
      )}
    </div>
  );
}
