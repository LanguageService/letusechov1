import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Globe, Zap, Users, Check, Star } from "lucide-react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleSignup = () => {
    setLocation("/signup");
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  const handleTryDemo = () => {
    // Navigate to language selection for guest access
    setLocation("/language-selection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center mr-3 shadow-lg">
              <span className="text-xl world-logo">🌍</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white echo-text">
              ✨ ECHO ✨
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Speak in any language, hear it in another. Real-time voice
            translation powered by AI.
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center p-6">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Mic className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Speak Naturally
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Just record your voice in any supported language
              </p>
            </div>

            <div className="flex flex-col items-center p-6">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Instant Translation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Get accurate translations in seconds with AI
              </p>
            </div>

            <div className="flex flex-col items-center p-6">
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Hear It Back
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Listen to natural-sounding voice in the target language
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="relative">
              <Badge variant="secondary" className="absolute -top-2 -right-2 z-10">3 Free</Badge>
              <Button
              size="lg"
              variant="default"
              className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700 text-white"
              onClick={handleTryDemo}
              data-testid="button-try-demo"
            >
              Try Demo (3 free translations)
              </Button>
            </div>
            <div className="relative">
              <Button
                size="lg"
                className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={handleSignup}
                data-testid="button-signup"
              >
                <Users className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </div>
          </div>

          <div className="text-center mb-12">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
                onClick={handleLogin}
                data-testid="link-login"
              >
                Sign in here
              </Button>
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Guest Access */}
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  Guest
                </Badge>
                Free Demo
              </CardTitle>
              <CardDescription>
                Try our service with no commitment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">Free</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />3
                  translations per day
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  All supported languages
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Voice-to-voice translation
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Authenticated Users */}
          <Card className="border-2 border-blue-500 dark:border-blue-400 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 hover:bg-blue-700">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="mr-2 bg-blue-600">Bronze</Badge>
                limited Access
              </CardTitle>
              <CardDescription>Full access to all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">Free</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Currently free during beta
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  more translations
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  All supported languages
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Voice-to-voice translation
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Translation history (coming soon)
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  Save favorites (coming soon)
                </li>
              </ul>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSignup}
                data-testid="button-signup-premium"
              >
                Sign Up Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            Supported Languages
          </h2>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {[
              "English",
              "Spanish",
              "French",
              "German",
              "Chinese",
              "Japanese",
              "Korean",
              "Arabic",
              "Hindi",
              "Portuguese",
              "Russian",
              "Italian",
              "Kinyarwanda",
              "Swahili",
              "Amharic",
              "Yoruba",
              "Hausa",
              "Igbo",
            ].map((lang) => (
              <Badge key={lang} variant="outline" className="px-3 py-1">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
