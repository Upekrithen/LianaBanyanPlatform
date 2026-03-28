import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useShowcaseComment } from '@/hooks/useShowcaseMutations';

interface ShowcaseCommentFormProps {
  projectId: string;
}

export function ShowcaseCommentForm({ projectId }: ShowcaseCommentFormProps) {
  const [text, setText] = useState('');
  const comment = useShowcaseComment(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    comment.mutate({ text: text.trim() }, {
      onSuccess: () => setText(''),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Tell the creator why you want this..."
        rows={2}
        className="resize-none text-sm"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!text.trim() || comment.isPending}
        variant="outline"
        className="w-full"
      >
        {comment.isPending ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
}
