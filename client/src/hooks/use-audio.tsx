import { useState, useCallback } from 'react';
import { AudioPlayer } from '@/lib/audio-utils';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [player] = useState(() => new AudioPlayer());

  const playAudio = useCallback(async (url: string) => {
    try {
      setIsPlaying(true);
      await player.playFromUrl(url);
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
      throw error;
    }
  }, [player]);

  const stopAudio = useCallback(() => {
    player.stop();
    setIsPlaying(false);
  }, [player]);

  return {
    isPlaying,
    playAudio,
    stopAudio,
  };
}
