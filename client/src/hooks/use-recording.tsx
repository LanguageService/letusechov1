import { useState, useCallback } from 'react';
import { AudioRecorder, blobToBase64 } from '@/lib/audio-utils';

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(() => new AudioRecorder());

  const startRecording = useCallback(async () => {
    try {
      await recorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<string> => {
    try {
      const audioBlob = await recorder.stopRecording();
      setIsRecording(false);
      return await blobToBase64(audioBlob);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, [recorder]);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}
