import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import type { Settings as SettingsType } from '@shared/schema';
import { voiceOptions } from '@shared/voice-mapping';


interface SettingsDialogProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  trigger?: React.ReactNode;
}

export function SettingsDialog({ settings, onSettingsChange, trigger }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setOpen(false);
  };

  const handleModelChange = (model: 'gemini-2.5-flash' | 'gemini-2.5-pro') => {
    setLocalSettings(prev => ({ ...prev, model }));
  };

  const handleVoiceChange = (voice: string) => {
    setLocalSettings(prev => ({ ...prev, voice: voice as SettingsType['voice'] }));
  };

  const handleAutoplayChange = (autoplay: boolean) => {
    setLocalSettings(prev => ({ ...prev, autoplay }));
  };

  const handleAutoDetectChange = (autoDetectLanguage: boolean) => {
    setLocalSettings(prev => ({ ...prev, autoDetectLanguage }));
  };

  const handleSuperFastModeChange = (superFastMode: boolean) => {
    setLocalSettings(prev => ({ ...prev, superFastMode }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-2 border-amber-200 dark:border-amber-800">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100">Translation Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="model" className="text-amber-800 dark:text-amber-200 font-medium">
              AI Model (Speed vs Quality)
            </Label>
            <Select value={localSettings.model} onValueChange={handleModelChange}>
              <SelectTrigger data-testid="select-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.5-flash">Faster, Good Quality</SelectItem>
                <SelectItem value="gemini-2.5-pro">High Quality, Slower</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice" className="text-amber-800 dark:text-amber-200 font-medium">
              Voice Style
            </Label>
            <Select value={localSettings.voice} onValueChange={handleVoiceChange}>
              <SelectTrigger data-testid="select-voice">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {voiceOptions.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay" className="text-amber-800 dark:text-amber-200 font-medium">
              Auto-play translated audio
            </Label>
            <Switch
              id="autoplay"
              checked={localSettings.autoplay}
              onCheckedChange={handleAutoplayChange}
              data-testid="switch-autoplay"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autodetect" className="text-amber-800 dark:text-amber-200 font-medium">
              Auto-detect language
            </Label>
            <Switch
              id="autodetect"
              checked={localSettings.autoDetectLanguage}
              onCheckedChange={handleAutoDetectChange}
              data-testid="switch-autodetect"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="superfast" className="text-amber-800 dark:text-amber-200 font-medium">
                Super Fast Mode
              </Label>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Direct audio translation (faster, skips transcription)
              </p>
            </div>
            <Switch
              id="superfast"
              checked={localSettings.superFastMode}
              onCheckedChange={handleSuperFastModeChange}
              data-testid="switch-superfast"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
              data-testid="button-save"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}