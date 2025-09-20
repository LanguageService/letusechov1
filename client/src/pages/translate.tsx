import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { LanguageToggle } from '@/components/language-toggle';
import { RecordingInterface } from '@/components/recording-interface';
import { TranslationResult } from '@/components/translation-result';
import { TranslationHistory } from '@/components/translation-history';
import { BottomNavigation } from '@/components/bottom-navigation';
import UsageLimitBanner from '@/components/usage-limit-banner';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { useSettings } from '@/contexts/settings-context';
import { useLocation } from 'wouter';
import type { TranslateResponse } from '@shared/schema';
import { localTranslationStorage } from '@/lib/local-storage';

interface SelectedLanguages {
  source: string;
  target: string;
}

export default function Translate() {
  const [, setLocation] = useLocation();
  const { settings, updateSettings } = useSettings();
  const [sourceLanguage, setSourceLanguage] = useState<string>('auto');
  const [currentTranslation, setCurrentTranslation] = useState<TranslateResponse | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<SelectedLanguages | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const feedbackShownForTranslation = useRef<string | null>(null);
  const hasShownNavigationFeedback = useRef(false);

  useEffect(() => {
    // Get selected languages from localStorage
    const stored = localStorage.getItem('selectedLanguages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SelectedLanguages;
        setSelectedLanguages(parsed);
        
        // Set source language based on settings.autoDetectLanguage
        setSourceLanguage(settings.autoDetectLanguage ? 'auto' : parsed.source);
      } catch (error) {
        console.error('Error parsing selected languages:', error);
        // Redirect back to language selection if no valid selection
        setLocation('/language-selection');
      }
    } else {
      // Redirect back to language selection if no selection found
      setLocation('/language-selection');
    }
  }, [setLocation]);

  // Update sourceLanguage when autoDetectLanguage setting changes
  useEffect(() => {
    if (selectedLanguages) {
      setSourceLanguage(settings.autoDetectLanguage ? 'auto' : selectedLanguages.source);
    }
  }, [settings.autoDetectLanguage, selectedLanguages]);

  // Handle browser navigation (refresh, close, back button)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check if we should show feedback before leaving
      if (currentTranslation && 
          feedbackShownForTranslation.current !== currentTranslation.id && 
          !hasShownNavigationFeedback.current) {
        // Prevent immediate navigation to show feedback dialog
        event.preventDefault();
        event.returnValue = ''; // Required for some browsers
        
        // Show feedback dialog
        hasShownNavigationFeedback.current = true;
        setShowFeedbackDialog(true);
        
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentTranslation]);

  // Handle SPA navigation within the app
  useEffect(() => {
    const handlePopState = () => {
      // User pressed back/forward button
      if (currentTranslation && 
          feedbackShownForTranslation.current !== currentTranslation.id && 
          !hasShownNavigationFeedback.current) {
        hasShownNavigationFeedback.current = true;
        setShowFeedbackDialog(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentTranslation]);

  const handleLanguageSwap = () => {
    // Swap the source and target languages
    if (selectedLanguages) {
      const newSelection = {
        source: selectedLanguages.target,
        target: selectedLanguages.source
      };
      setSelectedLanguages(newSelection);
      localStorage.setItem('selectedLanguages', JSON.stringify(newSelection));
    }
    setCurrentTranslation(null);
  };

  const handleAutoDetectToggle = () => {
    // Toggle the global auto-detect setting
    const newAutoDetectSetting = !settings.autoDetectLanguage;
    const newSourceLang = newAutoDetectSetting ? 'auto' : (selectedLanguages?.source || 'en');
    
    console.log('=== AUTO DETECT TOGGLE ===');
    console.log('Current settings.autoDetectLanguage:', settings.autoDetectLanguage);
    console.log('New autoDetectLanguage will be:', newAutoDetectSetting);
    console.log('New sourceLanguage will be:', newSourceLang);
    console.log('Full current settings:', settings);
    
    const newSettings = { ...settings, autoDetectLanguage: newAutoDetectSetting };
    console.log('New settings object:', newSettings);
    
    // Update global settings
    updateSettings(newSettings);
    setSourceLanguage(newSourceLang);
    
    setCurrentTranslation(null);
  };

  const handleTranslationComplete = (translation: TranslateResponse) => {
    // Save to localStorage
    localTranslationStorage.addTranslation(translation);
    
    // Update current translation
    setCurrentTranslation(translation);
    
    // Refresh translation history if the refresh function is available
    if ((window as any).refreshTranslationHistory) {
      (window as any).refreshTranslationHistory();
    }
    
    // Reset feedback tracking for new translation
    feedbackShownForTranslation.current = null;
  };

  const handleNewTranslation = () => {
    setCurrentTranslation(null);
    feedbackShownForTranslation.current = null;
  };



  const handleFeedbackDialogClose = () => {
    setShowFeedbackDialog(false);
    // Reset navigation feedback flag when dialog is dismissed without submission
    // This allows feedback to show again on subsequent navigation attempts
    hasShownNavigationFeedback.current = false;
  };

  const handlePendingNavigation = () => {
    // Check for pending navigation after feedback interaction
    const pendingPath = sessionStorage.getItem('pendingNavigation');
    if (pendingPath) {
      sessionStorage.removeItem('pendingNavigation');
      setLocation(pendingPath);
    }
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackDialog(false);
    
    // Mark feedback as shown for this translation
    if (currentTranslation) {
      feedbackShownForTranslation.current = currentTranslation.id;
    }
    
    handlePendingNavigation();
  };

  const handleFeedbackSkipped = () => {
    // Mark feedback as shown for this translation (user chose to skip)
    if (currentTranslation) {
      feedbackShownForTranslation.current = currentTranslation.id;
    }
    
    handlePendingNavigation();
  };

  // Guarded navigation function to check for feedback before navigating
  const guardedNavigate = (path: string) => {
    // Check if we should show feedback before navigating
    if (currentTranslation && 
        feedbackShownForTranslation.current !== currentTranslation.id && 
        !hasShownNavigationFeedback.current) {
      // Show feedback dialog instead of navigating immediately
      hasShownNavigationFeedback.current = true;
      setShowFeedbackDialog(true);
      
      // Store the intended destination for after feedback is submitted
      sessionStorage.setItem('pendingNavigation', path);
      return;
    }
    
    // No feedback needed, navigate normally
    setLocation(path);
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('selectedLanguages');
    guardedNavigate('/language-selection');
  };

  if (!selectedLanguages) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading...</p>
        </div>
      </div>
    );
  }

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

  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'ar': '🇸🇦',
      'hi': '🇮🇳',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'it': '🇮🇹',
      'rw': '🇷🇼',
      'sw': '🇹🇿',
      'am': '🇪🇹',
      'yo': '🇳🇬',
      'ha': '🇳🇬',
      'ig': '🇳🇬',
    };
    return flags[code] || '🌍';
  };

  return (
    <div className="min-h-screen african-waves-pattern pb-20 safe-area-bottom">
      <Header onNavigate={guardedNavigate} />
      
      <main className="max-w-md mx-auto mobile-container py-4 sm:py-6 mobile-spacing">
        {/* Usage Limit Banner */}
        <UsageLimitBanner />
        {/* Language Selection Display */}
        <div className="bg-gradient-to-r from-card via-card/95 to-card african-gradient rounded-xl p-3 sm:p-4 shadow-lg border-2 border-primary/10">
          <div className="flex flex-col space-y-3">
            {/* Language pairs row */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2 bg-white/50 dark:bg-black/50 rounded-lg p-1.5 flex-shrink-0">
                <span className="text-lg sm:text-xl">{getLanguageFlag(selectedLanguages.source)}</span>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">{getLanguageName(selectedLanguages.source)}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageSwap}
                className="p-1 h-auto min-h-0 hover:bg-primary/10 rounded-full transition-all duration-200 touch-feedback flex-shrink-0"
                data-testid="button-swap-languages"
              >
                <span className="text-primary text-lg">🔄</span>
              </Button>
              <div className="flex items-center space-x-1 sm:space-x-2 bg-white/50 dark:bg-black/50 rounded-lg p-1.5 flex-shrink-0">
                <span className="text-lg sm:text-xl">{getLanguageFlag(selectedLanguages.target)}</span>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">{getLanguageName(selectedLanguages.target)}</span>
              </div>
            </div>
            {/* Change button row */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="text-xs sm:text-sm px-3 sm:px-4"
                data-testid="button-change-languages"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="sm:hidden">Change</span>
                <span className="hidden sm:inline">Change Languages</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Language Toggle - Available for all language pairs */}
        <LanguageToggle 
          sourceLanguage={sourceLanguage}
          onSwap={handleLanguageSwap}
          onAutoDetectToggle={handleAutoDetectToggle}
          selectedLanguages={selectedLanguages}
        />

        <RecordingInterface 
          sourceLanguage={sourceLanguage}
          onTranslationComplete={handleTranslationComplete}
          selectedLanguages={selectedLanguages}
        />

        {currentTranslation && (
          <TranslationResult 
            translation={currentTranslation}
            sourceLanguage={sourceLanguage}
            onNewTranslation={handleNewTranslation}
          />
        )}

        <TranslationHistory />
      </main>

      <BottomNavigation onNavigate={guardedNavigate} />
      
      {/* Auto-prompt Feedback Dialog */}
      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={handleFeedbackDialogClose}
        onSubmit={handleFeedbackSubmitted}
        onSkip={handleFeedbackSkipped}
      />
    </div>
  );
}