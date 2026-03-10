/**
 * AudioRecorder — Browser-based audio recording for name pronunciations
 * ====================================================================
 * Uses the MediaRecorder API to capture short audio clips.
 * Uploads to Supabase Storage bucket "aaron-audio".
 * Max recording duration: 10 seconds (name pronunciations are short).
 *
 * States: idle → recording → recorded → uploading → uploaded
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play, Trash2, Upload, Loader2, Volume2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_DURATION_MS = 10_000; // 10 seconds max
const BUCKET = "aaron-audio";

type RecorderState = "idle" | "recording" | "recorded" | "uploading" | "uploaded";

interface AudioRecorderProps {
  /** The authenticated user's ID (for storage path) */
  userId: string;
  /** Existing audio URL to display/replace */
  existingAudioUrl?: string;
  /** Called when upload succeeds with the public URL */
  onUploadComplete: (publicUrl: string) => void;
  /** Called when audio is deleted */
  onDelete?: () => void;
}

export function AudioRecorder({
  userId,
  existingAudioUrl,
  onUploadComplete,
  onDelete,
}: AudioRecorderProps) {
  const { toast } = useToast();
  const [state, setState] = useState<RecorderState>(
    existingAudioUrl ? "uploaded" : "idle"
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      // Revoke any object URLs we created (not Supabase URLs)
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks to release the mic
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);

        // Revoke previous blob URL if it exists
        if (audioUrl && audioUrl.startsWith("blob:")) {
          URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(url);
        setState("recorded");
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.start(100); // collect data every 100ms
      startTimeRef.current = Date.now();
      setDuration(0);
      setState("recording");

      // Timer for duration display
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(Math.floor(elapsed / 1000));

        // Auto-stop at max duration
        if (elapsed >= MAX_DURATION_MS) {
          mediaRecorder.stop();
        }
      }, 250);
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record your name pronunciation.",
        variant: "destructive",
      });
    }
  }, [audioUrl, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playAudio = useCallback(() => {
    if (!audioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, [audioUrl]);

  const discardRecording = useCallback(() => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    blobRef.current = null;
    setAudioUrl(null);
    setDuration(0);
    setState("idle");
  }, [audioUrl]);

  const uploadRecording = useCallback(async () => {
    if (!blobRef.current) return;

    setState("uploading");
    try {
      const filePath = `${userId}/pronunciation.webm`;

      // Upload (upsert to replace existing)
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, blobRef.current, {
          contentType: "audio/webm",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Revoke blob URL
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(publicUrl);
      setState("uploaded");
      onUploadComplete(publicUrl);
      toast({
        title: "Audio uploaded",
        description: "Your name pronunciation has been saved.",
      });
    } catch (err) {
      console.error("Upload error:", err);
      setState("recorded"); // allow retry
      toast({
        title: "Upload failed",
        description: "Could not save your audio clip. Please try again.",
        variant: "destructive",
      });
    }
  }, [userId, audioUrl, onUploadComplete, toast]);

  const deleteAudio = useCallback(async () => {
    try {
      const filePath = `${userId}/pronunciation.webm`;
      await supabase.storage.from(BUCKET).remove([filePath]);

      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(null);
      blobRef.current = null;
      setState("idle");
      onDelete?.();
      toast({
        title: "Audio removed",
        description: "Your pronunciation audio has been deleted.",
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  }, [userId, audioUrl, onDelete, toast]);

  // ── Render ──

  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Audio Pronunciation
        </span>
        {state === "uploaded" && (
          <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-600 gap-0.5">
            <Check className="h-2 w-2" /> Saved
          </Badge>
        )}
      </div>

      {/* IDLE — show record button */}
      {state === "idle" && (
        <div className="text-center space-y-2">
          <p className="text-[11px] text-slate-500">
            Record yourself saying your name (max 10 seconds).
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="gap-1.5"
            aria-label="Start recording your name pronunciation"
          >
            <Mic className="h-3.5 w-3.5 text-red-500" />
            Record
          </Button>
        </div>
      )}

      {/* RECORDING — show timer + stop */}
      {state === "recording" && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-sm font-mono text-red-600 dark:text-red-400">
              {duration}s / 10s
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-250"
              style={{ width: `${Math.min((duration / 10) * 100, 100)}%` }}
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            className="gap-1.5"
            aria-label="Stop recording"
          >
            <Square className="h-3 w-3" />
            Stop
          </Button>
        </div>
      )}

      {/* RECORDED — show playback + upload/discard */}
      {state === "recorded" && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={playAudio}
              disabled={isPlaying}
              className="gap-1.5"
              aria-label="Play back your recording"
            >
              <Play className="h-3.5 w-3.5" />
              {isPlaying ? "Playing..." : "Play"}
            </Button>
            <span className="text-xs text-slate-500">{duration}s</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={discardRecording}
              className="gap-1 text-slate-500"
              aria-label="Discard recording and start over"
            >
              <Trash2 className="h-3 w-3" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={uploadRecording}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700"
              aria-label="Save audio pronunciation"
            >
              <Upload className="h-3.5 w-3.5" />
              Save Audio
            </Button>
          </div>
        </div>
      )}

      {/* UPLOADING — show spinner */}
      {state === "uploading" && (
        <div className="text-center space-y-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto" />
          <p className="text-xs text-slate-500">Uploading...</p>
        </div>
      )}

      {/* UPLOADED — show playback + re-record/delete */}
      {state === "uploaded" && audioUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={playAudio}
              disabled={isPlaying}
              className="gap-1.5"
              aria-label="Play your saved pronunciation"
            >
              <Play className="h-3.5 w-3.5" />
              {isPlaying ? "Playing..." : "Listen"}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setState("idle");
                // Don't delete from storage yet — just allow re-record
              }}
              className="gap-1 text-slate-500 text-xs"
              aria-label="Record a new pronunciation"
            >
              <Mic className="h-3 w-3" />
              Re-record
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteAudio}
              className="gap-1 text-red-500 text-xs"
              aria-label="Delete pronunciation audio"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
