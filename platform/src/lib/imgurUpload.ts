/**
 * IMGUR UPLOAD UTILITY
 * ====================
 * Handles image uploads to Imgur via their API.
 * Used for Deck Card exports, Cue Card distribution, and gallery posts.
 *
 * API docs: https://apidocs.imgur.com/
 * Upload endpoint: POST https://api.imgur.com/3/image
 * Gallery post: POST https://api.imgur.com/3/gallery/{galleryHash}
 *
 * Authentication:
 *   - Anonymous uploads use client_id header (VITE_IMGUR_CLIENT_ID)
 *   - Authenticated uploads use OAuth bearer token (from user's connected account)
 */

import { supabase } from "@/integrations/supabase/client";

const IMGUR_API_BASE = "https://api.imgur.com/3";

interface ImgurUploadResult {
  success: boolean;
  imageUrl?: string;
  deleteHash?: string;
  imgurId?: string;
  link?: string;
  error?: string;
}

interface ImgurGalleryResult {
  success: boolean;
  galleryUrl?: string;
  error?: string;
}

/**
 * Get the Imgur client ID from environment
 */
function getClientId(): string {
  return import.meta.env.VITE_IMGUR_CLIENT_ID || "";
}

/**
 * Get the user's Imgur OAuth token (if connected via social plug)
 */
async function getUserImgurToken(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("member_social_accounts")
    .select("access_token")
    .eq("user_id", user.id)
    .eq("platform", "imgur")
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .limit(1)
    .single();

  return data?.access_token || null;
}

/**
 * Upload an image to Imgur
 *
 * @param imageData — Base64-encoded image data (without data:image prefix) or a URL
 * @param options — title, description, and optional album hash
 * @returns Upload result with image URL and metadata
 */
export async function uploadToImgur(
  imageData: string,
  options?: {
    title?: string;
    description?: string;
    albumHash?: string;
    type?: "base64" | "url";
  }
): Promise<ImgurUploadResult> {
  const clientId = getClientId();
  if (!clientId) {
    return { success: false, error: "Imgur client ID not configured" };
  }

  // Try authenticated upload first, fall back to anonymous
  const token = await getUserImgurToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["Authorization"] = `Client-ID ${clientId}`;
  }

  try {
    // Strip data:image prefix if present
    let cleanData = imageData;
    if (cleanData.startsWith("data:")) {
      cleanData = cleanData.split(",")[1];
    }

    const body: Record<string, string> = {
      image: cleanData,
      type: options?.type || "base64",
    };

    if (options?.title) body.title = options.title;
    if (options?.description) body.description = options.description;
    if (options?.albumHash) body.album = options.albumHash;

    const response = await fetch(`${IMGUR_API_BASE}/image`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.data?.error || "Upload failed",
      };
    }

    return {
      success: true,
      imageUrl: result.data.link,
      deleteHash: result.data.deletehash,
      imgurId: result.data.id,
      link: result.data.link,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}

/**
 * Upload a canvas element to Imgur
 * Useful for DeckCardStudio export
 */
export async function uploadCanvasToImgur(
  canvas: HTMLCanvasElement,
  options?: {
    title?: string;
    description?: string;
    quality?: number;
  }
): Promise<ImgurUploadResult> {
  const dataUrl = canvas.toDataURL("image/png", options?.quality || 0.92);
  const base64 = dataUrl.split(",")[1];

  return uploadToImgur(base64, {
    title: options?.title,
    description: options?.description,
    type: "base64",
  });
}

/**
 * Upload a Blob/File to Imgur
 */
export async function uploadBlobToImgur(
  blob: Blob,
  options?: {
    title?: string;
    description?: string;
  }
): Promise<ImgurUploadResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const result = await uploadToImgur(base64, {
        title: options?.title,
        description: options?.description,
        type: "base64",
      });
      resolve(result);
    };
    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read file" });
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Post an uploaded image to the Imgur gallery (community)
 * Requires authenticated user
 */
export async function postToGallery(
  imgurId: string,
  options: {
    title: string;
    tags?: string[];
    topic?: string;
    mature?: boolean;
  }
): Promise<ImgurGalleryResult> {
  const token = await getUserImgurToken();
  if (!token) {
    return { success: false, error: "Must be connected to Imgur to post to gallery" };
  }

  try {
    const response = await fetch(`${IMGUR_API_BASE}/gallery/image/${imgurId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: options.title,
        tags: options.tags?.join(",") || "lianabanyan",
        topic: options.topic || "Share",
        mature: options.mature ? 1 : 0,
        terms: 1, // Accept Imgur terms
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.data?.error || "Gallery post failed",
      };
    }

    return {
      success: true,
      galleryUrl: `https://imgur.com/gallery/${imgurId}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gallery post failed",
    };
  }
}

export default {
  uploadToImgur,
  uploadCanvasToImgur,
  uploadBlobToImgur,
  postToGallery,
};
