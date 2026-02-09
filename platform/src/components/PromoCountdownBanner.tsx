import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromoCountdownBannerProps {
  message: string;
  ctaText?: string;
  ctaLink?: string;
  endDate: Date;
  onDismiss?: () => void;
}

export function PromoCountdownBanner({ 
  message, 
  ctaText = "Learn More", 
  ctaLink = "#",
  endDate,
  onDismiss 
}: PromoCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !timeLeft) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-3 px-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1">
          <span className="font-semibold text-lg">{message}</span>
          
          <div className="flex items-center gap-2 text-sm font-mono">
            <div className="flex flex-col items-center bg-background/10 rounded px-2 py-1">
              <span className="text-xl font-bold">{timeLeft.days}</span>
              <span className="text-xs opacity-80">days</span>
            </div>
            <span className="text-xl">:</span>
            <div className="flex flex-col items-center bg-background/10 rounded px-2 py-1">
              <span className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-xs opacity-80">hrs</span>
            </div>
            <span className="text-xl">:</span>
            <div className="flex flex-col items-center bg-background/10 rounded px-2 py-1">
              <span className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-xs opacity-80">min</span>
            </div>
            <span className="text-xl">:</span>
            <div className="flex flex-col items-center bg-background/10 rounded px-2 py-1">
              <span className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-xs opacity-80">sec</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ctaLink && (
            <Button 
              asChild
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              <a href={ctaLink}>{ctaText}</a>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="hover:bg-background/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
