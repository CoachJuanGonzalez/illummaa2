// Admin Route Wrappers with Authentication Guard
// Wraps admin pages with authentication protection

import AdminGuard from "@/components/AdminGuard";
import BlogAdmin from "./BlogAdmin";
import BlogPostEditor from "./BlogPostEditor";
import { useRoute } from "wouter";

// Wrapper for Blog Admin Dashboard
export function ProtectedBlogAdmin() {
  return (
    <AdminGuard>
      <BlogAdmin />
    </AdminGuard>
  );
}

// Wrapper for New Blog Post
export function ProtectedBlogPostNew() {
  return (
    <AdminGuard>
      <BlogPostEditor />
    </AdminGuard>
  );
}

// Wrapper for Edit Blog Post
export function ProtectedBlogPostEdit() {
  const [match, params] = useRoute("/admin/blog/edit/:id");

  return (
    <AdminGuard>
      <BlogPostEditor
        postId={params?.id ? parseInt(params.id) : undefined}
      />
    </AdminGuard>
  );
}
