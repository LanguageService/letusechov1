import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Header } from '@/components/header';

export default function Saved() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-120px)]">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Coming Soon</h1>
        <p className="text-muted-foreground">
          The saved translations feature is currently under development.
        </p>
        <Button 
          onClick={() => setLocation('/translate')}
          className="flex items-center space-x-2"
          data-testid="button-go-back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </Button>
      </div>
      </div>
    </div>
  );
}