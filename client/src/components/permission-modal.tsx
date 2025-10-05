import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: string;
  browser: string;
}

const getInstructions = (os: string, browser: string) => {
  const osLower = os.toLowerCase();
  const browserLower = browser.toLowerCase();

  if (osLower.includes('mac')) {
    if (browserLower.includes('chrome')) {
      return [
        'Open Chrome Preferences > Privacy and security > Site Settings > Microphone.',
        'Find this site and set to "Allow".',
        'Also, check macOS System Settings > Privacy & Security > Microphone, and ensure Chrome is enabled.',
      ];
    }
    if (browserLower.includes('safari')) {
      return [
        'Open Safari > Settings > Websites > Microphone.',
        'Find this site and set to "Allow".',
        'Also, check macOS System Settings > Privacy & Security > Microphone, and ensure Safari is enabled.',
      ];
    }
  }

  if (osLower.includes('windows')) {
    return [
      'Go to Windows Settings > Privacy & security > Microphone.',
      'Ensure "Microphone access" and "Let apps access your microphone" are turned on.',
      `In your browser settings, find Microphone permissions and allow this site.`,
    ];
  }

  if (osLower.includes('android')) {
    return [
      'Go to Settings > Apps > [Your Browser] > Permissions > Microphone.',
      'Set to "Allow".',
    ];
  }

  if (osLower.includes('ios')) {
    return [
      'Go to iOS Settings > Privacy & Security > Microphone.',
      'Find your browser in the list and turn the toggle on.',
    ];
  }

  return [
    'Please go to your browser and system settings to allow microphone access for this site.',
  ];
};

export function PermissionModal({ isOpen, onClose, os, browser }: PermissionModalProps) {
  const instructions = getInstructions(os, browser);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Microphone Access Denied</DialogTitle>
          <DialogDescription>
            To use voice translation, please allow microphone access in your browser and system settings.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="font-semibold mb-2">Instructions for {os} ({browser}):</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
