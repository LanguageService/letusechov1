# Speech Processing Flow

Based on the `server/services/speech.ts` file, here is a breakdown of the process from speech input to the final output.

The system uses Google's Gemini models for its speech processing capabilities. The core logic is encapsulated within the `SpeechService` class, which has methods for speech-to-text, direct audio-to-translation, and text-to-speech.

Here is a step-by-step overview of the process:

### 1. Speech Input to Text (Transcription or Translation)

When you provide speech input, the system can take one of two paths depending on the application's mode:

#### Path A: Direct Audio-to-Translated-Text (`audioToTranslatedText` method)

This is the most direct path for translation.

1.  **Audio Preparation**: The incoming audio (as a `Buffer`) is converted into a Base64 encoded string.
2.  **Prompt Engineering**: A specific instruction (a prompt) is crafted for the Gemini model.
    *   If you've selected a specific input language (e.g., "English"), the prompt will be direct, like: *"Translate this English audio directly to Kinyarwanda."*
    *   In "Auto-Detect" mode, the prompt is more dynamic: *"Listen to this audio. If the speech is English, output the Kinyarwanda translation. If the speech is Kinyarwanda, output the English translation."*
3.  **API Call**: The audio data and the prompt are sent to the Gemini model (`gemini-2.5-flash`).
4.  **Output**: The model processes the audio directly and returns the translated text.

#### Path B: Speech-to-Text (`speechToText` method) followed by Translation

This is a two-step process that first transcribes and then translates.

1.  **Transcription**:
    *   The `speechToText` method sends the audio to Gemini with a prompt asking it to transcribe the speech into text.
    *   If "Auto-Detect" is on, it also uses a helper method (`detectLanguage`) which makes another small call to Gemini to determine which of the two selected languages was spoken in the transcribed text.
2.  **Translation**:
    *   The transcribed text from step 1 would then be sent to a translation service. While there isn't a separate `translateText` method in this file, the logic from `audioToTranslatedText` shows how a text prompt can be used to ask the model for a translation.

### 2. Text to Speech Output (`textToSpeech` method)

Once the system has the final text (either from direct translation or transcription/translation), it converts it back into speech.

1.  **API Configuration**: The system configures its request to Gemini to ask for an audio response by setting `responseModalities: ['audio']`. It also specifies which voice to use (e.g., 'Serene', which is mapped to a Gemini-specific voice name).
2.  **API Call**: The text is sent to the `gemini-2.5-flash-preview-tts` model.
3.  **Audio Processing**:
    *   Gemini returns the audio data, often in a raw format like PCM (`audio/L16`).
    *   The `convertToWav` function in the service then takes this raw audio data, constructs a standard WAV header with the correct sample rate and channel information, and combines them.
4.  **Final Output**: The result is a complete WAV audio `Buffer` that can be played back to the user.

In summary, the process leverages the multi-modal capabilities of the Gemini models to handle complex tasks like direct audio translation and speech synthesis within a single, powerful API.
