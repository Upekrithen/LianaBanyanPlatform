/**
 * SOCIAL IMAGE UPLOAD — Store Images for Social Media Posts
 * =========================================================
 * Accepts an image (URL or base64) and stores it in Supabase Storage
 * bucket 'social-media-assets'. Returns a public URL for use in
 * social API calls (Twitter media upload, LinkedIn image shares, etc.).
 *
 * Request body:
 *   - imageUrl?: string (fetch from URL and store)
 *   - imageBase64?: string (raw base64 image data)
 *   - contentType?: string (default: 'image/png')
 *   - filename?: string (default: auto-generated timestamp)
 *   - caption?: string (stored as metadata, returned for convenience)
 *   - platform?: string (target platform — affects optimization)
 *
 * Returns:
 *   - success: boolean
 *   - publicUrl: string (Supabase Storage public URL)
 *   - path: string (storage path for reference)
 *   - caption?: string
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKET = 'social-media-assets';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface UploadRequest {
  imageUrl?: string;
  imageBase64?: string;
  contentType?: string;
  filename?: string;
  caption?: string;
  platform?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body: UploadRequest = await req.json();

    if (!body.imageUrl && !body.imageBase64) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Either imageUrl or imageBase64 is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let imageData: Uint8Array;
    let detectedContentType = body.contentType || 'image/png';

    if (body.imageUrl) {
      const response = await fetch(body.imageUrl);
      if (!response.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to fetch image: ${response.status} ${response.statusText}`,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const ct = response.headers.get('content-type');
      if (ct && ct.startsWith('image/')) {
        detectedContentType = ct.split(';')[0];
      }

      const arrayBuffer = await response.arrayBuffer();
      imageData = new Uint8Array(arrayBuffer);
    } else {
      const raw = body.imageBase64!.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(raw);
      imageData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageData[i] = binaryString.charCodeAt(i);
      }
    }

    if (imageData.byteLength > MAX_SIZE_BYTES) {
      return new Response(JSON.stringify({
        success: false,
        error: `Image exceeds ${MAX_SIZE_BYTES / 1024 / 1024}MB limit (got ${(imageData.byteLength / 1024 / 1024).toFixed(1)}MB)`,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ext = detectedContentType.split('/')[1] || 'png';
    const timestamp = Date.now();
    const platformPrefix = body.platform || 'general';
    const filename = body.filename || `${platformPrefix}-${timestamp}.${ext}`;
    const storagePath = `${platformPrefix}/${filename}`;

    // Ensure bucket exists (create if not — idempotent)
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === BUCKET);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE_BYTES,
      });
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, imageData, {
        contentType: detectedContentType,
        upsert: true,
      });

    if (uploadError) {
      return new Response(JSON.stringify({
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    // Log the upload for MoneyPenny awareness
    await supabase.from('moneypenny_actions').insert({
      title: `Image uploaded for ${platformPrefix} social post`,
      description: body.caption || `Stored at ${storagePath}`,
      source: 'auto',
      priority: 'low',
      status: 'done',
      completed_at: new Date().toISOString(),
    }).then(() => {}).catch(() => {});

    return new Response(JSON.stringify({
      success: true,
      publicUrl: publicUrlData.publicUrl,
      path: storagePath,
      contentType: detectedContentType,
      sizeBytes: imageData.byteLength,
      caption: body.caption || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
