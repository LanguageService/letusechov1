import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { FeedbackDialog } from './feedback-dialog';

interface FloatingFeedbackButtonProps {
  className?: string;
  onFeedbackSubmitted?: () => void;
}

export function FloatingFeedbackButton({ className, onFeedbackSubmitted }: FloatingFeedbackButtonProps) {
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const handleFeedbackSubmitted = () => {
    onFeedbackSubmitted?.();
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <Button
        onClick={() => setFeedbackDialogOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 
          h-14 w-14 rounded-full shadow-lg
          bg-amber-600 hover:bg-amber-700 
          text-white dark:bg-amber-500 dark:hover:bg-amber-600
          transition-all duration-200 hover:scale-110
          border-2 border-amber-400 dark:border-amber-300
          ${className}
        `}
        data-testid="button-feedback-floating"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Share feedback</span>
      </Button>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        onSubmit={handleFeedbackSubmitted}
      />
    </>
  );
}