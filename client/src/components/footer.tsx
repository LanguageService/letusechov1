import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export function Footer() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleCreditsClick = () => {
    setLocation('/credits');
  };

  return (
    <footer className="mt-auto bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-md mx-auto mobile-container py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © 2025 ECHO. Built with ❤️ for bridging cultures through voice.
          </p>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreditsClick}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20 px-2 py-1 text-xs"
              data-testid="button-footer-credits"
            >
              Credits
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}