declare module "react-speech-recognition" {
  export interface UseSpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
    interimResults?: boolean;
  }

  export interface UseSpeechRecognitionReturn {
    transcript: string;
    interimTranscript: string;
    listening: boolean;
    isMicrophoneAvailable: boolean;
    isRecognitionAvailable: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
  }

  export function useSpeechRecognition(): UseSpeechRecognitionReturn;

  const SpeechRecognition: {
    startListening: (options?: UseSpeechRecognitionOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
  };

  export default SpeechRecognition;
}
