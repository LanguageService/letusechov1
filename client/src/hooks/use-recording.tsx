import { useState, useCallback } from 'react';
import { AudioRecorder, blobToBase64 } from '@/lib/audio-utils';

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(() => new AudioRecorder());

  const startRecording = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      recorder.startRecording(
        () => {
          setIsRecording(true);
          resolve();
        },
        (error) => {
          setIsRecording(false);
          reject(error);
        }
      );
    });
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
