import { Search, Filter, Play } from 'lucide-react';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAudio } from '@/hooks/use-audio';
import type { Translation } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

export default function History() {
  const { isPlaying, playAudio } = useAudio();
  
  const { data: translations, isLoading } = useQuery<Translation[]>({
    queryKey: ['/api/translations'],
  });

  const handlePlayTranslation = (translation: Translation) => {
    if (translation.translatedAudioUrl) {
      playAudio(translation.translatedAudioUrl);
    }
  };

  return (
    <div className="min-h-screen african-pattern pb-20">
      <Header />
      
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Translation History</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              data-testid="button-filter"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search translations..."
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="translation-card rounded-xl p-4 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                  <div className="ml-3 w-8 h-8 bg-muted rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !translations || translations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No translations yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start translating to see your history here
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              data-testid="button-start-translating"
            >
              Start Translating
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {translations.map((translation) => {
              const isEnglishSource = translation.originalLanguage === 'en';
              
              return (
                <div 
                  key={translation.id} 
                  className="translation-card rounded-xl p-4"
                  data-testid={`history-item-${translation.id}`}
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
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {translation.originalLanguage.toUpperCase()} → {translation.targetLanguage.toUpperCase()}
                        </span>
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
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
