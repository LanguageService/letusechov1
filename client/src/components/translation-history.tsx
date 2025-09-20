import { useState, useEffect } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/hooks/use-audio';
import type { Translation } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { localTranslationStorage } from '@/lib/local-storage';
import { useLocation } from 'wouter';

export function TranslationHistory() {
  const { isPlaying, playAudio } = useAudio();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Load translations from localStorage
  useEffect(() => {
    const loadTranslations = () => {
      setIsLoading(true);
      const stored = localTranslationStorage.getTranslations();
      setTranslations(stored);
      setIsLoading(false);
    };

    loadTranslations();
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'speak-africa-translations') {
        loadTranslations();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Function to refresh translations (to be called when new translations are added)
  const refreshTranslations = () => {
    const stored = localTranslationStorage.getTranslations();
    setTranslations(stored);
  };

  // Expose refresh function globally for other components
  useEffect(() => {
    (window as any).refreshTranslationHistory = refreshTranslations;
    return () => {
      delete (window as any).refreshTranslationHistory;
    };
  }, []);

  const handlePlayTranslation = (translation: Translation) => {
    if (translation.translatedAudioUrl) {
      playAudio(translation.translatedAudioUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Translations</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="translation-card rounded-xl p-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="ml-3 w-8 h-8 bg-muted rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!translations || translations.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Translations</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No translations yet</p>
          <p className="text-xs text-muted-foreground">Start by recording your first message above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Translations</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-primary hover:text-primary/80"
          onClick={() => setLocation('/history')}
          data-testid="button-view-all"
        >
          View All
        </Button>
      </div>

      <div className="space-y-2">
        {translations.slice(0, 3).map((translation) => {
          const isEnglishSource = translation.originalLanguage === 'en';
          
          return (
            <div 
              key={translation.id} 
              className="translation-card rounded-xl p-4"
              data-testid={`translation-item-${translation.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      isEnglishSource ? 'bg-primary' : 'bg-secondary'
                    }`}></span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(translation.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {translation.originalLanguage.toUpperCase()} → {translation.targetLanguage.toUpperCase()}
                  </div>
                  <p className="text-sm text-foreground font-medium" data-testid="text-original">
                    {translation.originalText}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-translated">
                    {translation.translatedText}
                  </p>
                </div>
                {translation.translatedAudioUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayTranslation(translation)}
                    disabled={isPlaying}
                    className="ml-3 w-8 h-8 bg-muted/50 hover:bg-muted rounded-full"
                    data-testid={`button-play-${translation.id}`}
                  >
                    <Play className="w-3 h-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
