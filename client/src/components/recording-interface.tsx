import { useState } from "react";
import { Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecording } from "@/hooks/use-recording";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";
import { PermissionModal } from "@/components/permission-modal";
import { UAParser } from "ua-parser-js";
import type {
  TranslateRequest,
  TranslateResponse,
  UsageLimitResponse,
} from "@shared/schema";

interface RecordingInterfaceProps {
  sourceLanguage: string;
  onTranslationComplete: (translation: TranslateResponse) => void;
  selectedLanguages?: { source: string; target: string };
}

export function RecordingInterface({
  sourceLanguage,
  onTranslationComplete,
  selectedLanguages,
}: RecordingInterfaceProps) {
  const { isRecording, startRecording, stopRecording } = useRecording();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ os: "", browser: "" });
  const queryClient = useQueryClient();

  const translateMutation = useMutation({
    mutationFn: async (data: TranslateRequest) => {
      const response = await apiRequest("POST", "/api/translate", data);
      return response.json() as Promise<TranslateResponse>;
    },
    onSuccess: (translation) => {
      onTranslationComplete(translation);
      toast({
        title: "Translation Complete",
        description: "Your message has been translated successfully.",
      });
    },
    onError: async (error) => {
      console.error("Translation failed:", error);

      // Check if this is a usage limit error (429)
      if (error instanceof Error && error.message.includes("429:")) {
        try {
          // Try to parse the error message to get limit info
          const match = error.message.match(/429: (.+)/);
          if (match) {
            const errorData = JSON.parse(match[1]);

            toast({
              title: errorData.isAuthenticated
                ? "Processing Error"
                : "Daily Limit Reached",
              description:
                errorData.message ||
                "You've reached your daily limit. Sign up for more translations!",
              variant: "destructive",
            });

            // Refresh usage limit data to update the banner
            await queryClient.invalidateQueries({
              queryKey: ["/api/usage-limit"],
            });
            return;
          }
        } catch (parseError) {
          console.error("Failed to parse usage limit error:", parseError);
        }
      }

      // Generic error handling for non-limit errors
      toast({
        title: "Translation Failed",
        description: "Please try again. Check your internet connection.",
        variant: "destructive",
      });
    },
  });

  const handleDiscard = () => {
    translateMutation.reset();
    toast({
      title: "Processing Cancelled",
      description: "Translation processing has been cancelled.",
    });
  };

  const handleRecordingToggle = async () => {
    if (!isRecording) {
      try {
        await startRecording();
      } catch (error: any) {
        console.error("Microphone access error:", error.name, error.message);

        if (error.name === "NotAllowedError") {
          const parser = new UAParser();
          const result = parser.getResult();
          setDeviceInfo({
            os: result.os.name || "Unknown OS",
            browser: result.browser.name || "Unknown Browser",
          });
          setShowPermissionModal(true);
        } else {
          const description = "Could not access the microphone. Please ensure it's not in use by another app and check permissions.";
          toast({ title: "Recording Failed", description, variant: "destructive" });
        }
      }
    } else {
      try {
        const audioData = await stopRecording();

        // Determine target language based on selected languages
        let targetLanguage:
          | "en"
          | "rw"
          | "es"
          | "fr"
          | "de"
          | "zh"
          | "ja"
          | "ko"
          | "ar"
          | "hi"
          | "pt"
          | "ru"
          | "it"
          | "sw"
          | "am"
          | "yo"
          | "ha"
          | "ig";
        if (sourceLanguage === "auto") {
          // For auto mode, use the target from selected languages or default to English
          targetLanguage =
            (selectedLanguages?.target as typeof targetLanguage) || "en";
        } else if (selectedLanguages) {
          // Use the opposite of current source language from selected pair
          targetLanguage = (
            sourceLanguage === selectedLanguages.source
              ? selectedLanguages.target
              : selectedLanguages.source
          ) as typeof targetLanguage;
        } else {
          // Fallback to old behavior
          targetLanguage = sourceLanguage === "en" ? "rw" : "en";
        }

        // Only proceed if we have a valid target language
        if (targetLanguage) {
          translateMutation.mutate({
            audioData,
            sourceLanguage: sourceLanguage as any,
            targetLanguage,
            settings,
            selectedLanguages: selectedLanguages
              ? {
                  source: selectedLanguages.source as any,
                  target: selectedLanguages.target as any,
                }
              : undefined,
          });
        } else {
          toast({
            title: "Configuration Error",
            description: "Please select both source and target languages.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Recording Failed",
          description: "Failed to process recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const isTranslating = translateMutation.isPending;

  return (
    <>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 flex items-center justify-center mobile-text">
          <span className="mr-2 text-xl sm:text-2xl">
            {isRecording ? "🎤" : isTranslating ? "⚡" : "🌟"}
          </span>
          {isRecording
            ? "Recording..."
            : isTranslating
              ? "Translating..."
              : "Ready to Translate"}
        </h3>
        <p className="text-sm text-muted-foreground px-2">
          {isRecording
            ? "Release to translate your voice"
            : isTranslating
              ? "Working our African magic..."
              : "Tap and hold the button to start recording"}
        </p>
      </div>

      {/* Recording Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleRecordingToggle}
          disabled={isTranslating}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 border-4 mobile-touch-target ${
            isRecording
              ? "bg-gradient-to-br from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 recording-pulse border-destructive/30 shadow-destructive/20 focus:ring-destructive/30"
              : "bg-gradient-to-br from-primary via-accent/30 to-secondary hover:from-primary/90 hover:to-secondary/90 border-primary/30 shadow-primary/20 focus:ring-accent/30 active:scale-95"
          }`}
          data-testid="button-record"
        >
          {isRecording ? (
            <Square className="text-2xl sm:text-3xl" />
          ) : isTranslating ? (
            <div className="animate-spin">
              <span className="text-2xl sm:text-3xl">⚡</span>
            </div>
          ) : (
            <Mic className="text-2xl sm:text-3xl" />
          )}
        </Button>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div data-testid="recording-status">
          <div className="waveform mb-3">
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
          </div>
          <p className="text-sm font-medium text-accent">
            Recording... Release to translate
          </p>
        </div>
      )}

      {/* Translation Status */}
      {isTranslating && (
        <div data-testid="translation-status">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-sm font-medium text-primary mb-4">
            Translating your message...
          </p>
          <Button
            onClick={handleDiscard}
            variant="outline"
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            data-testid="button-discard"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      <PermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        os={deviceInfo.os}
        browser={deviceInfo.browser}
      />
    </>
  );
}
