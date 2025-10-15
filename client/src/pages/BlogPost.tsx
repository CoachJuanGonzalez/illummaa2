import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, Share2, Linkedin, Twitter } from 'lucide-react';
import { blogAnalytics } from '@/lib/blog-analytics';

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  ogImage: string | null;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  viewCount: number;
  authorId: string;
  authorName: string;
  authorBio: string;
  authorTitle: string;
  authorAvatar: string | null;
  authorLinkedIn: string | null;
  categoryName: string;
  categorySlug: string;
}

export default function BlogPost() {
  const { lang, slug } = useParams<{ lang: 'en' | 'fr'; slug: string }>();
  const { t, i18n } = useTranslation();
  const currentLang = lang || (i18n.language as 'en' | 'fr') || 'en';

  // Fetch blog post
  const { data: post, isLoading, error } = useQuery<BlogPostData>({
    queryKey: ['blog-post', slug, currentLang],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/${slug}?lang=${currentLang}`);
      if (!response.ok) {
        throw new Error('Blog post not found');
      }
      return response.json();
    },
    enabled: !!slug
  });

  // Track blog post view (fires once when post loads)
  useEffect(() => {
    if (post) {
      blogAnalytics.trackPostView({
        postId: post.id,
        postTitle: post.title,
        postSlug: post.slug,
        category: post.categoryName,
        author: post.authorName,
        language: currentLang,
        readingTime: post.readingTime
      });
    }
  }, [post, currentLang]);

  // Use reading progress hook for scroll tracking (25%, 50%, 75%, 100%)
  if (post) {
    blogAnalytics.useReadingProgress(post.id, post.slug);
  }

  // SEO Meta Tags (injected into document head via useEffect)
  useEffect(() => {
    if (post) {
      // Update document title
      document.title = post.metaTitle || post.title;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', post.metaDescription || post.excerpt);

      // Open Graph tags
      const updateMetaTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      updateMetaTag('og:title', post.metaTitle || post.title);
      updateMetaTag('og:description', post.metaDescription || post.excerpt);
      updateMetaTag('og:type', 'article');
      updateMetaTag('og:url', window.location.href);
      if (post.ogImage) {
        updateMetaTag('og:image', post.ogImage);
      }
      updateMetaTag('article:published_time', post.publishedAt);
      updateMetaTag('article:modified_time', post.updatedAt);
      updateMetaTag('article:author', post.authorName);

      // Twitter Card tags
      const updateTwitterTag = (name: string, content: string) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      updateTwitterTag('twitter:card', 'summary_large_image');
      updateTwitterTag('twitter:title', post.metaTitle || post.title);
      updateTwitterTag('twitter:description', post.metaDescription || post.excerpt);
      if (post.ogImage) {
        updateTwitterTag('twitter:image', post.ogImage);
      }

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', window.location.href);

      // Hreflang tags (bilingual)
      const updateHreflang = (hreflang: string, href: string) => {
        let tag = document.querySelector(`link[hreflang="${hreflang}"]`);
        if (!tag) {
          tag = document.createElement('link');
          tag.setAttribute('rel', 'alternate');
          tag.setAttribute('hreflang', hreflang);
          document.head.appendChild(tag);
        }
        tag.setAttribute('href', href);
      };

      updateHreflang('en', `https://illummaa.com/en/blog/${post.slug}`);
      updateHreflang('fr', `https://illummaa.com/fr/blog/${post.slug}`);
    }

    // Cleanup function to reset title on unmount
    return () => {
      document.title = 'ILLUMMAA - Modular Housing Solutions';
    };
  }, [post]);

  const handleShare = (platform: string) => {
    if (!post) return;

    blogAnalytics.trackSocialShare({
      postId: post.id,
      postTitle: post.title,
      platform: platform as any,
      language: currentLang
    });

    const url = window.location.href;
    const title = post.title;

    const shareUrls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    } else if (platform === 'copy_link') {
      navigator.clipboard.writeText(url);
      alert(t('blog.linkCopied'));
    }
  };

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

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">404 - Post Not Found</h1>
        <Link href={`/${currentLang}/blog`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.backToBlog')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Back Button */}
      <Link href={`/${currentLang}/blog`}>
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToBlog')}
        </Button>
      </Link>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video overflow-hidden rounded-lg mb-8">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Category Badge */}
      {post.categoryName && (
        <Link href={`/${currentLang}/blog/category/${post.categorySlug}`}>
          <Button variant="outline" size="sm" className="mb-4">
            {post.categoryName}
          </Button>
        </Link>
      )}

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b">
        <div className="flex items-center gap-2">
          {post.authorAvatar && (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
              <User className="w-4 h-4" />
              <span>{post.authorName}</span>
            </div>
            {post.authorTitle && (
              <div className="text-xs">{post.authorTitle}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(post.publishedAt).toLocaleDateString(
              currentLang === 'fr' ? 'fr-CA' : 'en-CA',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-4 h-4" />
          <span>{t('blog.readingTime', { minutes: post.readingTime })}</span>
        </div>
      </div>

      {/* Article Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Share Buttons */}
      <div className="flex items-center gap-4 py-8 border-t border-b">
        <span className="font-medium">{t('blog.share')}:</span>
        <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')}>
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleShare('copy_link')}>
          <Share2 className="w-4 h-4 mr-2" />
          {t('blog.copyLink')}
        </Button>
      </div>

      {/* Author Bio */}
      {post.authorBio && (
        <Card className="mt-12">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {post.authorAvatar && (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-16 h-16 rounded-full flex-shrink-0"
                />
              )}
              <div>
                <h3 className="font-bold text-lg mb-1">{post.authorName}</h3>
                {post.authorTitle && (
                  <p className="text-sm text-muted-foreground mb-2">{post.authorTitle}</p>
                )}
                <p className="text-sm mb-3">{post.authorBio}</p>
                {post.authorLinkedIn && (
                  <a
                    href={post.authorLinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Linkedin className="w-4 h-4" />
                    Connect on LinkedIn →
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </article>
  );
}
