// Cloudinary Image Upload Component for Blog Admin
// Handles featured image uploads with progress tracking

import { useState } from "react";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CloudinaryUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
}

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export default function CloudinaryUpload({
  onUploadComplete,
  currentImageUrl,
  className = ""
}: CloudinaryUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0
  });
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadState({
        status: "error",
        progress: 0,
        error: "Please select an image file (JPG, PNG, WebP, etc.)"
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadState({
        status: "error",
        progress: 0,
        error: "Image size must be less than 10MB"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    await uploadToCloudinary(file);
  };

  const uploadToCloudinary = async (file: File) => {
    setUploadState({ status: "uploading", progress: 0 });

    try {
      // Get Cloudinary config from environment variables
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error(
          "Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables."
        );
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "illummaa-blog");

      // Upload to Cloudinary
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState({ status: "uploading", progress });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const imageUrl = response.secure_url;

          setUploadState({ status: "success", progress: 100 });
          onUploadComplete(imageUrl);

          // Reset to idle after 2 seconds
          setTimeout(() => {
            setUploadState({ status: "idle", progress: 0 });
          }, 2000);
        } else {
          throw new Error("Upload failed");
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Upload failed. Please try again.");
      });

      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);

    } catch (error) {
      setUploadState({
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Upload failed. Please try again."
      });
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onUploadComplete("");
    setUploadState({ status: "idle", progress: 0 });
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        Featured Image
      </label>

      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveImage}
                className="shadow-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {uploadState.status === "success" && (
              <div className="absolute bottom-2 left-2 bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span className="text-sm">Upload complete</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-8">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">
                Click to upload image
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP (max 10MB)
              </p>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadState.status === "uploading" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Uploading...</span>
            <span>{uploadState.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadState.status === "error" && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Upload Error</p>
            <p className="text-xs text-destructive/80 mt-1">
              {uploadState.error}
            </p>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {uploadState.status === "idle" && !previewUrl && (
        <p className="text-xs text-muted-foreground mt-2">
          Recommended: 1200×630px for optimal social media sharing (Open Graph)
        </p>
      )}
    </div>
  );
}
