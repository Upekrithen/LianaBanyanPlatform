import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToggleWant } from '@/hooks/useShowcaseMutations';

interface WantThisButtonProps {
  projectId: string;
  currentlyWanted: boolean;
  compact?: boolean;
}

export function WantThisButton({ projectId, currentlyWanted, compact }: WantThisButtonProps) {
  const [wanted, setWanted] = useState(currentlyWanted);
  const toggle = useToggleWant(projectId);

  const handleClick = () => {
    toggle.mutate({ wanted }, {
      onSuccess: () => setWanted(prev => !prev),
    });
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={toggle.isPending}
        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
          wanted
            ? 'text-amber-600'
            : 'text-muted-foreground hover:text-amber-500'
        }`}
      >
        <Star className={`w-4 h-4 ${wanted ? 'fill-amber-500 text-amber-500' : ''}`} />
        {wanted ? 'Wanted!' : 'I Want This'}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={toggle.isPending}
      variant={wanted ? 'default' : 'outline'}
      className={wanted ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'border-amber-400 text-amber-700 hover:bg-amber-50'}
    >
      <Star className={`w-4 h-4 mr-2 ${wanted ? 'fill-white' : ''}`} />
      {wanted ? 'Wanted!' : 'I Want This'}
    </Button>
  );
}
