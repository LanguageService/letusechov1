import { Mic, History, Bookmark, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface BottomNavigationProps {
  onNavigate?: (path: string) => void;
}

export function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();

  const navItems = [
    { 
      icon: Mic, 
      label: 'Translate', 
      path: '/translate',
      isActive: location === '/translate'
    },
    { 
      icon: History, 
      label: 'History', 
      path: '/history',
      isActive: location === '/history'
    },
    { 
      icon: Bookmark, 
      label: 'Saved', 
      path: '/saved',
      isActive: location === '/saved'
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      isActive: location === '/profile'
    },
    { 
      icon: Heart, 
      label: 'Credits', 
      path: '/credits',
      isActive: location === '/credits'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border african-gradient shadow-lg safe-area-bottom">
      <div className="max-w-md mx-auto mobile-container py-2 sm:py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => onNavigate ? onNavigate(item.path) : setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  item.isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="text-lg" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
