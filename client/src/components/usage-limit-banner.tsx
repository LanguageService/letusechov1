import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { AlertTriangle, Infinity, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function UsageLimitBanner() {
  const { usageInfo, isLoading } = useUsageLimit();
  const [, setLocation] = useLocation();

  if (isLoading || !usageInfo) {
    return null;
  }

  const handleSignup = () => {
    setLocation("/signup");
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  const { isAuthenticated, remainingTranslations, limitMessage } = usageInfo;

  if (isAuthenticated) {
    // Show bronze badge for authenticated users
    return (
      <div className="mb-4">
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <Infinity className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-green-800 dark:text-green-200 mr-2">
                You are now on bronze tier!
              </span>
              <Badge className="bg-green-600">Bronze</Badge>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show limit information for guest users
  const isLowOnTranslations =
    remainingTranslations <= 1 && remainingTranslations > 0;
  const isAtLimit = remainingTranslations === 0;

  if (remainingTranslations > 1) {
    // Show remaining count when user has multiple translations left
    return (
      <div className="mb-4">
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="text-blue-800 dark:text-blue-200">
                You have{" "}
                <strong>{remainingTranslations} free translations</strong>{" "}
                remaining today.
              </span>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleLogin}
              data-testid="button-upgrade-banner"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              <Users className="w-4 h-4 mr-1" />
              Get more
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLowOnTranslations) {
    // Show warning when down to last translation
    return (
      <div className="mb-4">
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="text-orange-800 dark:text-orange-200 font-medium">
                Last free translation!
              </span>
              <span className="text-orange-700 dark:text-orange-300 ml-2">
                Sign up for bronze access.
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleSignup}
              data-testid="button-upgrade-last"
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Users className="w-4 h-4 mr-1" />
              Sign Up Now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isAtLimit) {
    // Show limit reached message
    return (
      <div className="mb-4">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-red-800 dark:text-red-200 font-medium mb-1">
                Daily limit reached
              </div>
              <div className="text-red-700 dark:text-red-300 text-sm">
                {limitMessage}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                onClick={handleLogin}
                data-testid="button-login-limit"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900"
              >
                Login
              </Button>
              <Button
                onClick={handleSignup}
                data-testid="button-signup-limit"
                className="bg-red-600 hover:bg-red-700"
              >
                <Users className="w-4 h-4 mr-1" />
                Sign Up
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
