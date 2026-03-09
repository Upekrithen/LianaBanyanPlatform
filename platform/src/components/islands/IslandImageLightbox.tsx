import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface IslandImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  islandName: string;
  description?: string;
}

export const IslandImageLightbox = ({
  isOpen,
  onClose,
  imageUrl,
  islandName,
  description,
}: IslandImageLightboxProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{islandName}</DialogTitle>
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={imageUrl}
            alt={islandName}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{islandName}</h2>
            {description && (
              <p className="text-white/90 text-lg">{description}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
