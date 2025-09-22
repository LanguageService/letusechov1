import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'http';
import { speechService } from './services/speech';
import { translationService } from './services/translation';

/**
 * Type guard to check if a WebSocket message is a binary audio buffer.
 */
const isAudioBuffer = (message: Buffer | string): message is Buffer => {
  return Buffer.isBuffer(message);
};

export function setupWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🚀 WebSocket client connected');
    let audioBuffer: Buffer[] = [];

    ws.on('message', async (message: Buffer | string) => {
      if (isAudioBuffer(message)) {
        // This is an audio chunk, add it to our buffer for this connection
        audioBuffer.push(message);
        console.log(`Received and buffered audio chunk of size: ${message.length}`);
      } else if (typeof message === 'string') {
        // This is a control message from the client (e.g., to end the stream)
        try {
          const controlMessage = JSON.parse(message);
          console.log('Received control message:', controlMessage);

          // Check for the "End of Transmission" signal
          if (controlMessage.type === 'EOT') {
            if (audioBuffer.length === 0) {
              ws.send(JSON.stringify({ type: 'error', message: 'No audio data was received before EOT.' }));
              return;
            }

            console.log('End of transmission received. Processing buffered audio...');
            
            // 1. Concatenate all buffered chunks into a single audio buffer
            const completeAudio = Buffer.concat(audioBuffer);
            console.log(`Total audio size: ${completeAudio.length} bytes`);
            
            // 2. Clear the buffer for the next recording from this client
            audioBuffer = [];

            // 3. Process the complete audio using your existing services
            const { sourceLanguage, targetLanguage, selectedLanguages } = controlMessage.config;
            
            try {
              // This flow mirrors the logic in your HTTP route, but for a single client
              const sttResult = await speechService.speechToText(completeAudio, sourceLanguage, 'gemini-2.5-flash', selectedLanguages);
              const translatedText = await translationService.translateText(sttResult.text, sttResult.detectedLanguage || sourceLanguage, targetLanguage);
              
              // 4. Send the final result back to the client
              const response = {
                type: 'translation_result',
                originalText: sttResult.text,
                translatedText: translatedText,
                // A full implementation could also generate and send TTS audio data here
              };
              ws.send(JSON.stringify(response));
              console.log('Sent translation result to client via WebSocket.');

            } catch (error) {
              console.error('WebSocket audio processing error:', error);
              ws.send(JSON.stringify({ type: 'error', message: 'Failed to process audio.' }));
            }
          }
        } catch (e) {
          console.error('Invalid or non-JSON control message received:', message);
        }
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
      // Ensure the buffer is cleared if the client disconnects unexpectedly
      audioBuffer = [];
    });

    ws.on('error', console.error);

    ws.send(JSON.stringify({ type: 'connection_ack', message: 'Welcome to the ECHO WebSocket server!' }));
  });
}
