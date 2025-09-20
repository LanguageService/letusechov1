import { Settings, LogIn, UserPlus, User, LogOut, ChevronDown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SettingsDialog } from './settings-dialog';
import { useSettings } from '@/contexts/settings-context';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onNavigate?: (path: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const { settings, updateSettings } = useSettings();
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const navigate = onNavigate || setLocation;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Generate user initials
  const getUserInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName?.trim() || '');
    const l = (lastName?.trim() || '');
    
    if (!f && !l) return 'U';
    
    // Get first initial from first name
    const firstInitial = f[0] || '';
    
    // Get last initial from last word of last name, handling multi-word and hyphenated surnames
    let lastInitial = '';
    if (l) {
      const lastNameTokens = l.split(/\s+|-/).filter(token => token.length > 0);
      if (lastNameTokens.length > 0) {
        lastInitial = lastNameTokens[lastNameTokens.length - 1][0] || '';
      }
    }
    
    // If no last name, use second character of first name if available
    if (!lastInitial && f.length > 1) {
      lastInitial = f[1] || '';
    }
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <header className="bg-card/90 backdrop-blur-sm border-b border-border sticky top-0 z-50 african-gradient">
      <div className="w-full px-4 py-3 sm:py-4 md:max-w-none md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Home icon at top left */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHomeClick}
            className="text-foreground hover:text-primary hover:bg-primary/10"
            data-testid="button-home"
          >
            <Home className="w-5 h-5" />
          </Button>

          {/* User profile/auth section - mobile friendly sizing, extreme right on desktop */}
          <div className="flex items-center ml-auto">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2 hover:bg-white/10 dark:hover:bg-black/10 md:pr-0"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-amber-600 text-white text-sm font-medium">
                        {getUserInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Hide user details on small screens, show on medium+ */}
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-sm font-medium text-foreground">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} data-testid="menu-item-profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} data-testid="menu-item-settings">
                  <SettingsDialog 
                    settings={settings} 
                    onSettingsChange={updateSettings} 
                    trigger={
                      <button className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </button>
                    } 
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="menu-item-logout"
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : location === '/translate' ? (
              <SettingsDialog settings={settings} onSettingsChange={updateSettings} />
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoginClick}
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-300 dark:hover:text-amber-200 dark:hover:bg-amber-900/20 text-xs md:text-sm px-2 md:px-3"
                  data-testid="button-header-login"
                >
                  <LogIn className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Login
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSignupClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 text-xs md:text-sm px-2 md:px-3"
                  data-testid="button-header-signup"
                >
                  <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
