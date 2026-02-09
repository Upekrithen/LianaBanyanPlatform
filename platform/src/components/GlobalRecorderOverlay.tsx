import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRecording } from "@/contexts/RecordingContext";
import { Circle, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";

export const GlobalRecorderOverlay = () => {
  const { isRecording, isCapturing, actionCount, begin, stop, record } = useRecording();
  const location = useLocation();

  useEffect(() => {
    if (!isRecording || !isCapturing) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-recording-controls]')) return;

      const elementText = target.textContent?.trim().slice(0, 50) || '';
      const elementTag = target.tagName.toLowerCase();
      const elementId = target.id ? `#${target.id}` : '';
      const elementClass = target.className ? `.${String(target.className).split(' ')[0]}` : '';
      const elementDescription = `${elementTag}${elementId}${elementClass}: "${elementText}"`;

      record({ element: elementDescription, action: 'click', route: location.pathname, timestamp: Date.now() });

      // subtle highlight
      const prevOutline = (target as any).style?.outline;
      (target as any).style.outline = '2px solid hsl(142 76% 36%)';
      setTimeout(() => { (target as any).style.outline = prevOutline || ''; }, 300);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isRecording, isCapturing, location.pathname, record]);

  if (!isRecording) return null;

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4"
      data-recording-controls
      style={{ pointerEvents: 'auto' }}
    >
      <Circle className={`w-3 h-3 fill-current ${isCapturing ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col">
        <span className="font-bold text-sm">
          {isCapturing ? 'RECORDING' : 'Record Mode Active'}
        </span>
        <span className="text-xs opacity-90">
          {isCapturing ? `${actionCount} actions captured` : 'Navigate to start page first'}
        </span>
      </div>
      <div className="flex gap-2" data-recording-controls>
        {!isCapturing && (
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => begin()}
            data-recording-controls
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Video className="w-4 h-4 mr-1" />
            Begin Capture
          </Button>
        )}
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => stop()}
          data-recording-controls
          className="bg-white text-red-600 hover:bg-gray-100"
        >
          <VideoOff className="w-4 h-4 mr-1" />
          {isCapturing ? 'Stop & Save' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
};