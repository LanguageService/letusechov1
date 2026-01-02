// export class AudioRecorder {
//   private mediaRecorder: MediaRecorder | null = null;
//   private audioChunks: Blob[] = [];
//   private stream: MediaStream | null = null;

//   startRecording(onSuccess: () => void, onError: (error: Error) => void): void {
//     // Use a promise-based approach to handle the async nature of getUserMedia
//     navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 16000
//         }
//       })
//       .then(stream => {
//         this.stream = stream;
//         this.mediaRecorder = new MediaRecorder(this.stream, {
//           mimeType: 'audio/webm;codecs=opus'
//         });

//         this.audioChunks = [];

//         this.mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             this.audioChunks.push(event.data);
//           }
//         };

//         this.mediaRecorder.start();
//         onSuccess();
//       })
//       .catch(error => {
//         console.error('Error starting recording:', error);
//         onError(error);
//       });
//   }

//   async stopRecording(): Promise<Blob> {
//     return new Promise((resolve, reject) => {
//       if (!this.mediaRecorder) {
//         reject(new Error('No recording in progress'));
//         return;
//       }

//       this.mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
//         this.cleanup();
//         resolve(audioBlob);
//       };

//       this.mediaRecorder.onerror = (event) => {
//         this.cleanup();
//         reject(new Error('Recording failed'));
//       };

//       this.mediaRecorder.stop();
//     });
//   }

//   private cleanup(): void {
//     if (this.stream) {
//       this.stream.getTracks().forEach(track => track.stop());
//       this.stream = null;
//     }
//     this.mediaRecorder = null;
//     this.audioChunks = [];
//   }

//   isRecording(): boolean {
//     return this.mediaRecorder?.state === 'recording';
//   }
// }

// export async function blobToBase64(blob: Blob): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const result = reader.result as string;
//       // Remove data URL prefix to get just the base64 data
//       const base64 = result.split(',')[1];
//       resolve(base64);
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// }

// export class AudioPlayer {
//   private audio: HTMLAudioElement | null = null;

//   async playFromUrl(url: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       console.log('Attempting to play audio from:', url);

//       this.stop(); // Stop any existing audio
//       this.audio = new Audio(url);

//       this.audio.oncanplaythrough = () => {
//         console.log('Audio can play through');
//       };

//       this.audio.onloadeddata = () => {
//         console.log('Audio data loaded');
//       };

//       this.audio.onended = () => {
//         console.log('Audio playback ended');
//         resolve();
//       };

//       this.audio.onerror = (event) => {
//         console.error('Audio error:', event);
//         console.error('Audio error details:', this.audio?.error);
//         reject(new Error(`Failed to play audio: ${this.audio?.error?.message || 'Unknown error'}`));
//       };

//       this.audio.onloadstart = () => {
//         console.log('Audio load started');
//       };

//       // Try to play the audio
//       this.audio.play()
//         .then(() => {
//           console.log('Audio playback started successfully');
//         })
//         .catch((error) => {
//           console.error('Play promise rejected:', error);
//           reject(new Error(`Audio play failed: ${error.message}`));
//         });
//     });
//   }

//   stop(): void {
//     if (this.audio) {
//       this.audio.pause();
//       this.audio.currentTime = 0;
//       this.audio = null;
//     }
//   }
// }

// export class AudioRecorder {
//   private mediaRecorder: MediaRecorder | null = null;
//   private audioChunks: Blob[] = [];
//   private stream: MediaStream | null = null;

//   startRecording(onSuccess: () => void, onError: (error: Error) => void): void {
//     // Check for getUserMedia support (fallback for older browsers)
//     const getUserMedia =
//       navigator.mediaDevices?.getUserMedia ||
//       (navigator as any).getUserMedia ||
//       (navigator as any).webkitGetUserMedia ||
//       (navigator as any).mozGetUserMedia;

//     if (!getUserMedia) {
//       onError(new Error("getUserMedia not supported"));
//       return;
//     }

//     // Simplified audio constraints for older devices
//     const constraints = {
//       audio: {
//         echoCancellation: true,
//         noiseSuppression: true,
//         // Remove sampleRate constraint for compatibility
//       },
//     };

//     const handleStream = (stream: MediaStream) => {
//       this.stream = stream;

//       // Try different MIME types for compatibility
//       let mimeType = "audio/webm;codecs=opus";
//       if (!MediaRecorder.isTypeSupported(mimeType)) {
//         mimeType = "audio/webm";
//         if (!MediaRecorder.isTypeSupported(mimeType)) {
//           mimeType = "audio/mp4";
//           if (!MediaRecorder.isTypeSupported(mimeType)) {
//             mimeType = ""; // Let browser choose
//           }
//         }
//       }

//       try {
//         this.mediaRecorder = new MediaRecorder(
//           this.stream,
//           mimeType ? { mimeType } : undefined
//         );

//         this.audioChunks = [];

//         this.mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             this.audioChunks.push(event.data);
//           }
//         };

//         this.mediaRecorder.start();
//         onSuccess();
//       } catch (error) {
//         onError(new Error("MediaRecorder not supported"));
//       }
//     };

//     // Use promise-based or callback-based getUserMedia
//     // if (navigator.mediaDevices?.getUserMedia) {
//     //   navigator.mediaDevices
//     //     .getUserMedia(constraints)
//     //     .then(handleStream)
//     //     .catch(onError);
//     // } else {
//     //   // Fallback for older browsers
//     //   const legacyGetUserMedia = getUserMedia.bind(navigator);
//     //   legacyGetUserMedia(constraints, handleStream, onError);
//     // }
//     // Use promise-based or callback-based getUserMedia
//     if (navigator.mediaDevices?.getUserMedia) {
//       navigator.mediaDevices
//         .getUserMedia(constraints)
//         .then(handleStream)
//         .catch(onError);
//     } else {
//       // Fallback for older browsers
//       const legacyGetUserMedia =
//         (navigator as any).getUserMedia ||
//         (navigator as any).webkitGetUserMedia ||
//         (navigator as any).mozGetUserMedia;

//       if (legacyGetUserMedia) {
//         legacyGetUserMedia.call(navigator, constraints, handleStream, onError);
//       } else {
//         onError(new Error("getUserMedia not supported"));
//       }
//     }
//   }

//   async stopRecording(): Promise<Blob> {
//     return new Promise((resolve, reject) => {
//       if (!this.mediaRecorder) {
//         reject(new Error("No recording in progress"));
//         return;
//       }

//       this.mediaRecorder.onstop = () => {
//         // Use generic audio type for compatibility
//         const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
//         this.cleanup();
//         resolve(audioBlob);
//       };

//       this.mediaRecorder.onerror = (event) => {
//         this.cleanup();
//         reject(new Error("Recording failed"));
//       };

//       this.mediaRecorder.stop();
//     });
//   }

//   private cleanup(): void {
//     if (this.stream) {
//       this.stream.getTracks().forEach((track) => track.stop());
//       this.stream = null;
//     }
//     this.mediaRecorder = null;
//     this.audioChunks = [];
//   }

//   isRecording(): boolean {
//     return this.mediaRecorder?.state === "recording";
//   }
// }
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;

  async playFromUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.audio = new Audio(url);
      
      this.audio.onended = () => resolve();
      this.audio.onerror = () => reject(new Error('Failed to play audio'));
      
      this.audio.play().catch(reject);
    });
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  startRecording(onSuccess: () => void, onError: (error: Error) => void): void {
    // Check for getUserMedia support (fallback for older browsers)
    const getUserMedia =
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia;

    if (!getUserMedia) {
      onError(new Error("getUserMedia not supported"));
      return;
    }

    // Simplified audio constraints for older devices
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    };

    const handleStream = (stream: MediaStream) => {
      this.stream = stream;

      // Try different MIME types for compatibility
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""; // Let browser choose
          }
        }
      }

      try {
        this.mediaRecorder = new MediaRecorder(
          this.stream,
          mimeType ? { mimeType } : undefined
        );

        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start();
        onSuccess();
      } catch (error) {
        onError(new Error("MediaRecorder not supported"));
      }
    };

    // Use promise-based or callback-based getUserMedia
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleStream)
        .catch(onError);
    } else {
      // Fallback for older browsers
      const legacyGetUserMedia =
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia;

      if (legacyGetUserMedia) {
        legacyGetUserMedia.call(navigator, constraints, handleStream, onError);
      } else {
        onError(new Error("getUserMedia not supported"));
      }
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event) => {
        this.cleanup();
        reject(new Error("Recording failed"));
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:audio/wav;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

