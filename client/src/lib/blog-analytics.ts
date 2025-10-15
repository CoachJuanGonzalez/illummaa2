/**
 * Blog Analytics Extension
 * Created: 2025-10-14
 *
 * IMPORTANT: This file EXTENDS analytics.ts (391 lines) without modifying it.
 * Imports the existing analytics instance and adds blog-specific tracking.
 *
 * New GA4 Events (in addition to existing 8 events):
 * 9. blog_post_view - When user views a blog post
 * 10. blog_reading_progress - 25%, 50%, 75%, 100% scroll milestones
 * 11. blog_navigation - Category/tag clicks within blog
 * 12. blog_social_share - Social sharing button clicks
 */

import { analytics } from './analytics';
import { useEffect, useRef } from 'react';

// ============================================
// BLOG POST VIEW TRACKING
// ============================================

export interface BlogPostViewParams {
  postId: string;
  postTitle: string;
  postSlug: string;
  category: string;
  author: string;
  language: 'en' | 'fr';
  readingTime: number; // minutes
}

export function trackBlogPostView(params: BlogPostViewParams): void {
  analytics.track('blog_post_view', {
    post_id: params.postId,
    post_title: params.postTitle,
    post_slug: params.postSlug,
    category: params.category,
    author: params.author,
    language: params.language,
    reading_time: params.readingTime,
    page_path: window.location.pathname,
    page_url: window.location.href
  });
}

// ============================================
// READING PROGRESS TRACKING
// ============================================

export interface ReadingProgressParams {
  postId: string;
  postSlug: string;
  percentage: number; // 25, 50, 75, or 100
  timeSpent: number; // seconds since page load
}

export function trackReadingProgress(params: ReadingProgressParams): void {
  analytics.track('blog_reading_progress', {
    post_id: params.postId,
    post_slug: params.postSlug,
    progress_percentage: params.percentage,
    time_spent_seconds: params.timeSpent,
    page_path: window.location.pathname
  });
}

// ============================================
// BLOG NAVIGATION TRACKING
// ============================================

export interface BlogNavigationParams {
  actionType: 'category_click' | 'tag_click' | 'related_post_click' | 'author_click';
  targetLabel: string; // Category name, tag name, or post title
  targetUrl: string;
  sourceLocation: 'sidebar' | 'post_header' | 'post_footer' | 'related_posts';
}

export function trackBlogNavigation(params: BlogNavigationParams): void {
  analytics.track('blog_navigation', {
    action_type: params.actionType,
    target_label: params.targetLabel,
    target_url: params.targetUrl,
    source_location: params.sourceLocation,
    page_path: window.location.pathname
  });
}

// ============================================
// SOCIAL SHARING TRACKING
// ============================================

export interface SocialShareParams {
  postId: string;
  postTitle: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'email' | 'copy_link';
  language: 'en' | 'fr';
}

export function trackSocialShare(params: SocialShareParams): void {
  analytics.track('blog_social_share', {
    post_id: params.postId,
    post_title: params.postTitle,
    platform: params.platform,
    language: params.language,
    page_path: window.location.pathname
  });
}

// ============================================
// READING PROGRESS HOOK (React Hook for Auto-Tracking)
// ============================================

export function useReadingProgress(postId: string, postSlug: string) {
  const milestones = useRef<Set<number>>(new Set()); // Track which milestones hit
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate scroll percentage
      const scrollPercentage = Math.round(
        (scrollTop / (documentHeight - windowHeight)) * 100
      );

      // Check milestones: 25%, 50%, 75%, 100%
      const checkpoints = [25, 50, 75, 100];
      checkpoints.forEach(checkpoint => {
        if (scrollPercentage >= checkpoint && !milestones.current.has(checkpoint)) {
          milestones.current.add(checkpoint);

          const timeSpent = Math.round((Date.now() - startTime.current) / 1000);

          trackReadingProgress({
            postId,
            postSlug,
            percentage: checkpoint,
            timeSpent
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [postId, postSlug]);
}

// ============================================
// BLOG ANALYTICS EXPORT (Consolidated)
// ============================================

export const blogAnalytics = {
  trackPostView: trackBlogPostView,
  trackReadingProgress: trackReadingProgress,
  trackNavigation: trackBlogNavigation,
  trackSocialShare: trackSocialShare,
  useReadingProgress
};
