import { useState, useEffect } from 'react';
import { ArrowRight, Globe, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Header } from '@/components/header';
import { PermissionModal } from '@/components/permission-modal';

// Popular language pairs with their language codes and display names
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
];

const pilotLanguages = LANGUAGES.filter(lang => ['en', 'rw', 'sw'].includes(lang.code));
const comingSoonLanguages = LANGUAGES.filter(lang => !['en', 'rw', 'sw'].includes(lang.code));

export default function LanguageSelection() {
  const [, setLocation] = useLocation();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [osInfo, setOsInfo] = useState({ os: 'Unknown', browser: 'Unknown' });

  useEffect(() => {
    const getOSAndBrowser = () => {
      const userAgent = window.navigator.userAgent;
      let os = 'Unknown';
      let browser = 'Unknown';

      if (/Mac/i.test(userAgent)) os = 'macOS';
      else if (/Win/i.test(userAgent)) os = 'Windows';
      else if (/Android/i.test(userAgent)) os = 'Android';
      else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';

      if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("SamsungBrowser")) browser = "Samsung Internet";
      else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browser = "Opera";
      else if (userAgent.includes("Edge")) browser = "Edge";
      else if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Safari")) browser = "Safari";

      setOsInfo({ os, browser });
    };
    getOSAndBrowser();
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      // Remove if already selected
      setSelectedLanguages(selectedLanguages.filter(code => code !== languageCode));
    } else if (selectedLanguages.length < 2) {
      // Add if less than 2 selected
      setSelectedLanguages([...selectedLanguages, languageCode]);
    } else {
      // Replace the first one if 2 already selected
      setSelectedLanguages([selectedLanguages[1], languageCode]);
    }
  };

  const handleContinue = () => {
    if (selectedLanguages.length !== 2) return;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Permission granted, we can stop the track immediately as we don't need it here.
        stream.getTracks().forEach(track => track.stop());

        // Store language selection and navigate
        localStorage.setItem('selectedLanguages', JSON.stringify({
          source: selectedLanguages[0],
          target: selectedLanguages[1]
        }));
        setLocation('/translate');
      })
      .catch(err => {
        console.error('Microphone access denied:', err);
        // Show instructions on how to grant permission
        setShowPermissionModal(true);
      });
  };

  const handleLanguageSwap = () => {
    if (selectedLanguages.length === 2) {
      // Swap the order of the selected languages
      setSelectedLanguages([selectedLanguages[1], selectedLanguages[0]]);
    }
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.flag || '🌍';
  };

  return (
    <div className="min-h-screen african-geometric-pattern bg-background">
      <Header />
      
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl world-logo">🌍</span>
          </div>
          <h1 className="text-2xl font-bold echo-text mb-2">✨ ECHO ✨</h1>
          <p className="text-muted-foreground">Connecting cultures through language</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto mobile-container py-4 sm:py-8">
        <div className="mobile-spacing">
          {/* Language Selection */}
          <Card className="p-6 african-waves-pattern border-2 border-primary/10 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mb-2">
                <span className="text-2xl mb-1 block">🎯</span>
                <h2 className="text-lg font-semibold text-foreground">Choose Two Languages</h2>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Select any two languages you want to translate between. You can swap the direction later.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
              {pilotLanguages.map((language) => {
                const isSelected = selectedLanguages.includes(language.code);
                const selectionOrder = selectedLanguages.indexOf(language.code) + 1;
                
                return (
                  <Button
                    key={language.code}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto p-3 flex flex-col items-center space-y-1 relative ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    onClick={() => handleLanguageSelect(language.code)}
                    data-testid={`button-language-${language.code}`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {selectionOrder}
                      </div>
                    )}
                    <span className="text-xl">{language.flag}</span>
                    <span className="text-xs font-medium">{language.name}</span>
                  </Button>
                );
              })}
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="coming-soon">
                <AccordionTrigger>More Languages (Coming Soon)</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-4">
                    {comingSoonLanguages.map((language) => (
                      <Button key={language.code} variant="outline" disabled className="h-auto p-3 flex flex-col items-center space-y-1 opacity-50">
                        <span className="text-xl">{language.flag}</span>
                        <span className="text-xs font-medium">{language.name}</span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {selectedLanguages.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mb-4">
                {selectedLanguages.length === 1 ? (
                  "Select one more language"
                ) : (
                  "Perfect! Ready to translate"
                )}
              </div>
            )}
          </Card>

          {/* Selection Summary & Continue */}
          {selectedLanguages.length === 2 && (
            <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/30 african-gradient shadow-xl">
              <div className="text-center space-y-4">
                <div className="mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLanguageSwap}
                    className="p-2 h-auto min-h-0 hover:bg-primary/20 rounded-full transition-all duration-200 touch-feedback"
                    data-testid="button-swap-selected-languages"
                  >
                    <span className="text-2xl">🔄</span>
                  </Button>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/80 dark:bg-black/80 rounded-lg p-2 shadow-md">
                    <span className="text-2xl">{getLanguageFlag(selectedLanguages[0])}</span>
                    <span className="font-medium">{getLanguageName(selectedLanguages[0])}</span>
                  </div>
                  <div className="flex space-x-1">
                    <ArrowRight className="text-primary animate-bounce" />
                    <ArrowRight className="text-primary transform rotate-180 animate-bounce" />
                  </div>
                  <div className="flex items-center space-x-2 bg-white/80 dark:bg-black/80 rounded-lg p-2 shadow-md">
                    <span className="text-2xl">{getLanguageFlag(selectedLanguages[1])}</span>
                    <span className="font-medium">{getLanguageName(selectedLanguages[1])}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleContinue}
                  size="lg"
                  className="mx-auto flex items-center justify-center space-x-2 px-8"
                  data-testid="button-continue"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Translating</span>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      <PermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        os={osInfo.os}
        browser={osInfo.browser}
      />
    </div>
  );
}
