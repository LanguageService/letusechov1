import { ArrowLeft, Linkedin, Heart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { BottomNavigation } from '@/components/bottom-navigation';

export default function Credits() {
  const goBack = () => {
    window.history.back();
  };

  const creators = [
    {
      name: "Sunday Iyanu Ajayi",
      role: "Co-Creator & Developer",
      linkedin: "https://www.linkedin.com/in/sunday-ajayi",
      description: "Passionate about bridging communication gaps through technology"
    },
    {
      name: "Olufemi Victor Tolulope",
      role: "Co-Creator & Developer", 
      linkedin: "https://www.linkedin.com/in/olufemi-victor-tolulope/",
      description: "Building solutions to connect cultures and communities"
    }
  ];

  return (
    <div className="min-h-screen african-waves-pattern pb-20 safe-area-bottom">
      <Header />

      <main className="max-w-md mx-auto mobile-container py-4 sm:py-6 mobile-spacing">
        {/* Project Story */}
        <Card className="mb-6 bg-gradient-to-r from-card via-card/95 to-card african-gradient border-2 border-primary/10">
          <CardHeader className="text-center pb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-3xl">🌍</span>
            </div>
            <CardTitle className="text-xl font-bold echo-text flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              Our Story
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              We built <strong className="text-primary">ECHO</strong> to help bridge the gap in language communication 
              as we've been facing lots of challenges communicating since we moved to Kigali to start our masters at 
              <strong className="text-accent"> CMU Africa</strong>.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This project represents our commitment to breaking down language barriers and fostering 
              better communication between cultures.
            </p>
          </CardContent>
        </Card>

        {/* Creators */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Meet the Creators
          </h2>
          
          {creators.map((creator, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {creator.name === "Olufemi Victor Tolulope" ? "OV" : 
                       creator.name === "Sunday Iyanu Ajayi" ? "SA" : 
                       creator.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {creator.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="p-1 h-auto min-h-0 hover:bg-primary/10 rounded-full"
                        data-testid={`link-linkedin-${index}`}
                      >
                        <a
                          href={creator.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${creator.name}'s LinkedIn profile`}
                        >
                          <Linkedin className="w-5 h-5 text-blue-600" />
                        </a>
                      </Button>
                    </div>
                    
                    <p className="text-sm text-primary font-medium mb-2">
                      {creator.role}
                    </p>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {creator.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Thank you message */}
        <Card className="mt-6 bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 border border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🙏</div>
            <p className="text-sm text-muted-foreground">
              Thank you for using <strong className="text-primary">ECHO</strong> to connect across languages and cultures!
            </p>
          </CardContent>
        </Card>

      </main>

      <BottomNavigation />
    </div>
  );
}