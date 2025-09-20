import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VoiceContextType {
  isVoiceEnabled: boolean;
  isSpeaking: boolean;
  toggleVoice: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
};

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceRate, setVoiceRateState] = useState(1);
  const [voicePitch, setVoicePitchState] = useState(1);
  const { currentLanguage } = useLanguage();

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => !prev);
    if (isSpeaking) {
      stopSpeaking();
    }
  }, [isSpeaking]);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled || !text.trim()) return;

    // Stop any current speech
    stopSpeaking();

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on current language
      const languageMap: Record<string, string> = {
        en: 'en-ZA', // South African English
        af: 'af-ZA', // Afrikaans
        zu: 'zu-ZA', // Zulu
        xh: 'xh-ZA', // Xhosa
        st: 'st-ZA', // Sesotho
        tn: 'tn-ZA', // Setswana
        ss: 'ss-ZA', // Swazi
        ve: 've-ZA', // Venda
        ts: 'ts-ZA', // Tsonga
        nr: 'nr-ZA', // Ndebele
        nso: 'nso-ZA' // Northern Sotho
      };

      utterance.lang = languageMap[currentLanguage] || 'en-ZA';
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Try to find a suitable voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(languageMap[currentLanguage]) ||
        voice.lang.startsWith('en-ZA') ||
        voice.lang.startsWith('en')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
    }
  }, [isVoiceEnabled, currentLanguage, voiceRate, voicePitch]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const setVoiceRate = useCallback((rate: number) => {
    setVoiceRateState(Math.max(0.1, Math.min(2, rate)));
  }, []);

  const setVoicePitch = useCallback((pitch: number) => {
    setVoicePitchState(Math.max(0, Math.min(2, pitch)));
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        isVoiceEnabled,
        isSpeaking,
        toggleVoice,
        speak,
        stopSpeaking,
        setVoiceRate,
        setVoicePitch,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};