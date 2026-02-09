import { ReactNode, useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { ContentEditModal } from './ContentEditModal';
import { Edit2 } from 'lucide-react';

interface EditableContentProps {
  children: ReactNode;
  content: string;
  onSave: (newContent: string) => void;
  contentType?: 'text' | 'textarea';
  label: string;
  className?: string;
}

export function EditableContent({
  children,
  content,
  onSave,
  contentType = 'text',
  label,
  className = '',
}: EditableContentProps) {
  const { isEditMode } = useEditMode();
  const [modalOpen, setModalOpen] = useState(false);

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`relative group cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 rounded p-2 ${className}`}
        onClick={() => setModalOpen(true)}
      >
        {children}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-primary-foreground rounded-full p-1.5">
            <Edit2 className="h-3 w-3" />
          </div>
        </div>
      </div>
      <ContentEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={label}
        content={content}
        contentType={contentType}
        onSave={onSave}
      />
    </>
  );
}
