import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { SubmitFeedbackRequest } from '@shared/schema';

const feedbackFormSchema = z.object({
  starRating: z.number().int().min(1, "Please select a rating").max(5, "Rating cannot exceed 5 stars"),
  feedbackMessage: z.string().max(1000, "Feedback message must be less than 1000 characters").optional(),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: () => void;
  onSkip?: () => void;
}

export function FeedbackDialog({ open, onOpenChange, onSubmit, onSkip }: FeedbackDialogProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      starRating: 0,
      feedbackMessage: "",
    },
  });

  const starRating = watch('starRating');

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: SubmitFeedbackRequest) => {
      return apiRequest('POST', '/api/feedback', data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve ECHO.",
        variant: "default",
      });
      reset();
      onOpenChange(false);
      onSubmit?.();
    },
    onError: (error: any) => {
      console.error('Feedback submission error:', error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onFormSubmit = (data: FeedbackFormData) => {
    submitFeedbackMutation.mutate({
      starRating: data.starRating,
      feedbackMessage: data.feedbackMessage?.trim() || undefined,
    });
  };

  const handleStarClick = (rating: number) => {
    setValue('starRating', rating, { shouldValidate: true });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
    onSkip?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-2 border-amber-200 dark:border-amber-800">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-amber-800 dark:text-amber-200 font-medium">
              How would you rate your experience?
            </Label>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1" data-testid="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 rounded transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  data-testid={`button-star-${star}`}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredStar || starRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {errors.starRating && (
              <p className="text-sm text-red-600 dark:text-red-400" data-testid="error-star-rating">
                {errors.starRating.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedbackMessage" className="text-amber-800 dark:text-amber-200 font-medium">
              Tell us more (optional)
            </Label>
            <Textarea
              id="feedbackMessage"
              placeholder="What did you like? What could we improve? Share any thoughts..."
              className="min-h-[100px] border-amber-200 dark:border-amber-700 focus:border-amber-400 dark:focus:border-amber-500"
              data-testid="input-feedback-message"
              {...register('feedbackMessage')}
            />
            {errors.feedbackMessage && (
              <p className="text-sm text-red-600 dark:text-red-400" data-testid="error-feedback-message">
                {errors.feedbackMessage.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
              data-testid="button-skip-feedback"
              disabled={submitFeedbackMutation.isPending}
            >
              Skip
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
              data-testid="button-submit-feedback"
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}