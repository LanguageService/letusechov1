import { ArrowLeftRight, Flag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';

const getLanguageName = (code: string) => {
  const languages: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish', 
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'it': 'Italian',
    'rw': 'Kinyarwanda',
    'sw': 'Swahili',
    'am': 'Amharic',
    'yo': 'Yoruba',
    'ha': 'Hausa',
    'ig': 'Igbo',
  };
  return languages[code] || code;
};

interface LanguageToggleProps {
  sourceLanguage: string;
  onSwap: () => void;
  onAutoDetectToggle: () => void;
  selectedLanguages?: { source: string; target: string };
}

export function LanguageToggle({ sourceLanguage, onSwap, onAutoDetectToggle, selectedLanguages }: LanguageToggleProps) {
  const { settings } = useSettings();
  const isAutoMode = sourceLanguage === 'auto';
  const isEnglishSource = sourceLanguage === 'en';
  
  console.log('=== LANGUAGE TOGGLE RENDER ===');
  console.log('settings.autoDetectLanguage:', settings.autoDetectLanguage);
  console.log('sourceLanguage:', sourceLanguage);
  console.log('isAutoMode:', isAutoMode);
  console.log('Will show auto-detect UI:', settings.autoDetectLanguage && isAutoMode);
  
  if (settings.autoDetectLanguage && isAutoMode) {
    // Show auto-detect mode display
    return (
      <div className="bg-gradient-to-br from-card via-card/95 to-card african-gradient rounded-xl p-4 sm:p-6 shadow-xl border-2 border-primary/10">
        <div className="text-center mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {isAutoMode ? 'Auto-Detect Mode' : 'Manual Mode'}
          </h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-2 mx-auto">
              <Zap className="text-accent text-xl" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {isAutoMode ? 'Auto-Detect' : 'Manual Select'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAutoMode ? 'Detects any language automatically' : 'Choose your language'}
            </p>
          </div>
          
          <Button
            onClick={() => {
              console.log('BUTTON CLICKED - Switch to Manual');
              onAutoDetectToggle();
            }}
            variant="outline"
            size="sm"
            className="text-xs"
            data-testid="button-toggle-mode"
          >
            Switch to Manual
          </Button>
        </div>
      </div>
    );
  }
  
  // Show manual language selection
  return (
    <div className="bg-gradient-to-br from-card via-card/95 to-card african-gradient rounded-xl p-4 sm:p-6 shadow-xl border-2 border-primary/10">
      <div className="text-center mb-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Translation Direction
        </h2>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 mx-auto">
            <Flag className="text-primary text-xl" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {selectedLanguages ? getLanguageName(selectedLanguages.source) : 'English'}
          </p>
          <p className="text-xs text-muted-foreground">Input</p>
        </div>
        
        <Button
          onClick={onSwap}
          className="language-toggle w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          data-testid="button-toggle-language"
        >
          <ArrowLeftRight className="text-lg" />
        </Button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2 mx-auto">
            <Flag className="text-secondary text-xl" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {selectedLanguages ? getLanguageName(selectedLanguages.target) : 'Kinyarwanda'}
          </p>
          <p className="text-xs text-muted-foreground">Output</p>
        </div>
      </div>
      
      {settings.autoDetectLanguage && (
        <div className="text-center mt-4">
          <Button
            onClick={() => {
              console.log('BUTTON CLICKED - Switch to Auto-Detect');
              onAutoDetectToggle();
            }}
            variant="outline"
            size="sm"
            className="text-xs"
            data-testid="button-switch-auto"
          >
            Switch to Auto-Detect
          </Button>
        </div>
      )}
    </div>
  );
}
