import { Play, Save, Share, RotateCcw, ArrowDown, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/hooks/use-audio';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import type { TranslateResponse } from '@shared/schema';

interface TranslationResultProps {
  translation: TranslateResponse;
  sourceLanguage: string;
  onNewTranslation: () => void;
}

export function TranslationResult({ 
  translation, 
  sourceLanguage, 
  onNewTranslation
}: TranslationResultProps) {
  const { isPlaying, playAudio } = useAudio();
  const { settings } = useSettings();
  const { toast } = useToast();
  const lastPlayedId = useRef<string | null>(null);
  
  // Auto-play translated audio when a new translation arrives
  useEffect(() => {
    if (
      settings.autoplay &&
      translation.translatedAudioUrl &&
      !isPlaying &&
      translation.id !== lastPlayedId.current
    ) {
      // Mark this translation ID as played to prevent re-playing on re-renders
      lastPlayedId.current = translation.id;
      
      const timer = setTimeout(() => {
        playAudio(translation.translatedAudioUrl!).catch(error => {
          console.log('Auto-play failed, audio may not be available:', error);
        });
      }, 100); // Reduced delay for faster perceived response
      
      return () => clearTimeout(timer);
    }
  }, [translation.id, translation.translatedAudioUrl, settings.autoplay, playAudio, isPlaying]);
  
  const isAutoDetect = sourceLanguage === 'auto';
  const isEnglishSource = sourceLanguage === 'en';
  
  // For auto-detect, determine source language from translation
  const sourceLangName = isAutoDetect 
    ? 'Auto-Detected' 
    : isEnglishSource ? 'English' : 'Kinyarwanda';
  const targetLangName = isAutoDetect 
    ? 'Auto-Translated' 
    : isEnglishSource ? 'Kinyarwanda' : 'English';

  const handlePlayOriginal = () => {
    if (translation.originalAudioUrl) {
      playAudio(translation.originalAudioUrl);
    }
  };

  const handlePlayTranslation = () => {
    if (translation.translatedAudioUrl) {
      playAudio(translation.translatedAudioUrl);
    } else if (!translation.ttsAvailable) {
      toast({
        title: "Audio Not Available",
        description: translation.ttsError || "Speech synthesis is not supported for this language.",
        variant: "default",
      });
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving translation:', translation.id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Translation',
        text: `${translation.originalText} → ${translation.translatedText}`,
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-card via-card/95 to-card african-gradient rounded-xl p-4 sm:p-6 shadow-xl border-2 border-primary/10 transition-all duration-300 animate-in slide-in-from-bottom-4" data-testid="translation-result">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Original ({sourceLangName})
            </span>
            {translation.originalAudioUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayOriginal}
                disabled={isPlaying}
                className="text-xs text-primary hover:text-primary/80"
                data-testid="button-play-original"
              >
                <Play className="w-3 h-3 mr-1" />
                Play
              </Button>
            )}
          </div>
          <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 border border-primary/10 mobile-text" data-testid="text-original">
            {translation.originalText}
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-primary via-accent to-secondary rounded-full p-2">
            <ArrowDown className="text-white text-lg" />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Translation ({targetLangName})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayTranslation}
              disabled={isPlaying}
              className={`text-xs ${
                translation.translatedAudioUrl 
                  ? 'text-secondary hover:text-secondary/80' 
                  : 'text-muted-foreground hover:text-muted-foreground/80'
              }`}
              data-testid="button-play-translation"
            >
              {translation.translatedAudioUrl ? (
                <Play className="w-3 h-3 mr-1" />
              ) : (
                <VolumeX className="w-3 h-3 mr-1" />
              )}
              {translation.translatedAudioUrl ? 'Play' : 'Audio N/A'}
            </Button>
          </div>
          <p className="text-sm text-foreground bg-secondary/10 rounded-lg p-3" data-testid="text-translation">
            {translation.translatedText}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground text-xs py-2 px-4"
          data-testid="button-save"
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground text-xs py-2 px-4"
          data-testid="button-share"
        >
          <Share className="w-3 h-3 mr-1" />
          Share
        </Button>
        <Button
          onClick={onNewTranslation}
          size="sm"
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-xs py-2 px-4"
          data-testid="button-new"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>
    </div>
  );
}
