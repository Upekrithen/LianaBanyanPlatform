import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileBox, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const STL_BUCKET = "stl-files";

interface STLFileUploadProps {
  initiativeSlug: string;
  onUploadComplete?: (result: { fileUrl: string; fileId: string }) => void;
}

interface UploadResult {
  fileUrl: string;
  fileId: string;
}

export function STLFileUpload({ initiativeSlug, onUploadComplete }: STLFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setError(null);
    if (file && !displayName) {
      setDisplayName(file.name.replace(/\.stl$/i, "").replace(/[-_]/g, " "));
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select an .stl file first.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter a display name.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      // Build deterministic storage path: initiatives/<slug>/<userId>/<filename>
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `initiatives/${initiativeSlug}/${user.id}/${Date.now()}_${safeName}`;

      // Upload to stl-files bucket
      const { error: uploadError } = await supabase.storage
        .from(STL_BUCKET)
        .upload(storagePath, selectedFile, {
          contentType: "application/octet-stream",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STL_BUCKET)
        .getPublicUrl(storagePath);
      const fileUrl = urlData.publicUrl;

      // Insert row into stl_files
      const { data: row, error: insertError } = await supabase
        .from("stl_files" as never)
        .insert({
          uploader_id: user.id,
          filename: selectedFile.name,
          display_name: displayName.trim(),
          file_url: fileUrl,
          file_size_bytes: selectedFile.size,
          is_public: true,
          storage_bucket: STL_BUCKET,
          initiative_slug: initiativeSlug,
          updated_at: new Date().toISOString(),
        } as never)
        .select("id")
        .single() as { data: { id: string } | null; error: unknown };

      if (insertError) throw insertError;

      const uploadResult: UploadResult = {
        fileUrl,
        fileId: (row as { id: string }).id,
      };

      setResult(uploadResult);
      onUploadComplete?.(uploadResult);
      setSelectedFile(null);
      setDisplayName("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 p-6">
      <div className="flex items-center gap-2">
        <FileBox className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Upload STL File</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="stl-file-input" className="text-xs text-muted-foreground mb-1 block">
            STL file (.stl)
          </Label>
          <Input
            id="stl-file-input"
            ref={inputRef}
            type="file"
            accept=".stl"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
        </div>

        {selectedFile && (
          <div>
            <Label htmlFor="stl-display-name" className="text-xs text-muted-foreground mb-1 block">
              Display name
            </Label>
            <Input
              id="stl-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Swan Neck Connector"
              disabled={uploading}
            />
          </div>
        )}

        {selectedFile && (
          <p className="text-xs text-muted-foreground">
            {selectedFile.name} &middot; {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full sm:w-auto"
          size="sm"
        >
          {uploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="mr-2 h-4 w-4" /> Upload STL</>
          )}
        </Button>
      </div>

      {result && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">Upload complete</p>
            <a
              href={result.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-xs underline opacity-80"
            >
              {result.fileUrl}
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
