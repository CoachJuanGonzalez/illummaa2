// Blog Post Editor with Tiptap WYSIWYG
// Full-featured editor for creating and editing blog posts

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { useLocation } from "wouter";
import type { BlogPost } from "@db/schema";

interface BlogPostEditorProps {
  postId?: number;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function BlogPostEditor({ postId, onSave, onCancel }: BlogPostEditorProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4"
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80"
        }
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog post content..."
      })
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] max-w-none p-4"
      }
    }
  });

  // Load existing post if editing
  useEffect(() => {
    if (postId) {
      loadPost(postId);
    }
  }, [postId]);

  const loadPost = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blog/posts/${id}`);
      if (!response.ok) throw new Error("Failed to load post");

      const post: BlogPost = await response.json();
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setFeaturedImage(post.featuredImage || "");
      setLanguage(post.language);
      setStatus(post.status);
      editor?.commands.setContent(post.content);
    } catch (error) {
      console.error("Error loading post:", error);
      alert("Failed to load post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!postId) {
      // Only auto-generate slug for new posts
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(autoSlug);
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    // Validation
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!slug.trim()) {
      alert("Please enter a slug");
      return;
    }
    if (!excerpt.trim()) {
      alert("Please enter an excerpt");
      return;
    }

    const content = editor.getHTML();
    if (!content || content === "<p></p>") {
      alert("Please enter some content");
      return;
    }

    setIsSaving(true);

    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        featuredImage: featuredImage || null,
        language,
        status
      };

      const url = postId ? `/api/blog/posts/${postId}` : "/api/blog/posts";
      const method = postId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save post");
      }

      alert(`Post ${postId ? "updated" : "created"} successfully!`);

      if (onSave) {
        onSave();
      } else {
        setLocation("/admin/blog");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert(error instanceof Error ? error.message : "Failed to save post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toolbar actions
  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {postId ? "Edit Blog Post" : "Create New Blog Post"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel || (() => setLocation("/admin/blog"))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Title & Slug */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Input
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for listings and SEO"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 150-160 characters for optimal SEO
            </p>
          </div>

          {/* Featured Image */}
          <CloudinaryUpload
            currentImageUrl={featuredImage}
            onUploadComplete={setFeaturedImage}
          />

          {/* Language & Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "fr")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "draft" | "published")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Editor Toolbar */}
          {editor && (
            <div className="border rounded-lg">
              <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive("bold") ? "bg-muted" : ""}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive("italic") ? "bg-muted" : ""}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={editor.isActive("bulletList") ? "bg-muted" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={editor.isActive("orderedList") ? "bg-muted" : ""}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={editor.isActive("blockquote") ? "bg-muted" : ""}
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addLink}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addImage}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              {/* Editor Content */}
              <EditorContent editor={editor} />
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel || (() => setLocation("/admin/blog"))}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : postId ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
