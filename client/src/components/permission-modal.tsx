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

  // macOS
  if (osLower.includes('mac') || osLower.includes('macos')) {
    if (browserLower.includes('safari')) {
      return [
        'Open Safari > Settings > Websites > Microphone.',
        'Find this site in the list and set its permission to "Allow".',
        'Then, check macOS System Settings > Privacy & Security > Microphone, and ensure Safari is enabled.',
      ];
    } else { // Chrome, Firefox, Edge, etc. on macOS
      return [
        `In ${browser}, go to Settings > Privacy and security > Site Settings > Microphone.`,
        'Find this site and change the permission to "Allow".',
        `Also, check macOS System Settings > Privacy & Security > Microphone, and ensure ${browser} has access.`,
      ];
    }
  }

  // Windows
  if (osLower.includes('windows')) {
    return [
      'Go to Windows Settings > Privacy & security > Microphone.',
      'Ensure "Microphone access" and "Let apps access your microphone" are turned on.',
      `In ${browser}'s settings, find Microphone permissions and allow this site.`,
    ];
  }

  // Android
  if (osLower.includes('android')) {
    if (browserLower.includes('chrome')) {
      return [
        `In Chrome, tap the three dots ⋮ > Settings > Site settings > Microphone.`,
        'Find this site and tap on it, then select "Allow".',
        'If it still fails, go to Android Settings > Apps > Chrome > Permissions > Microphone, and set to "Allow".',
      ];
    } else {
      return [
        `Go to Android Settings > Apps > ${browser} > Permissions > Microphone.`,
        'Set the permission to "Allow".',
      ];
    }
  }

  // iOS
  if (osLower.includes('ios')) {
    if (browserLower.includes('safari')) {
      return [
        'First, tap the "aA" icon in the address bar > Website Settings > Microphone, and select "Allow".',
        'If that doesn\'t work, go to iOS Settings > Safari > Microphone (under "Settings for Websites"), and set to "Allow".',
        'Finally, check iOS Settings > Privacy & Security > Microphone, and ensure Safari is enabled.',
      ];
    } else { // Chrome, Firefox, etc. on iOS
      return [
        'Go to iOS Settings > Privacy & Security > Microphone.',
        `Find ${browser} in the list and make sure the toggle is ON.`,
      ];
    }
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
