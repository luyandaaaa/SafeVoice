import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, MicOff, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Function to handle recording start/stop
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };
        
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          await processAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    }
  };

  // Process recorded audio and extract keywords
  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio to text (you'll need a speech-to-text API)
      const text = await speechToText(audioBlob);
      
      // Extract keywords (simple implementation - you might want a better NLP approach)
      const keywords = extractKeywords(text);
      
      // Send to chatbot
      sendMessageToIframe(keywords);
      
      // Update UI
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `[Voice] ${keywords}`,
        sender: 'user',
        timestamp: new Date()
      }]);
      
      setInputText("");
    } catch (err) {
      console.error("Error processing audio:", err);
    }
  };

  // Mock speech-to-text function (replace with actual API call)
  const speechToText = async (audioBlob: Blob): Promise<string> => {
    // In a real implementation, you would call a speech-to-text API here
    // For example: Google Cloud Speech-to-Text, AWS Transcribe, etc.
    console.log("Processing audio...");
    return "This is a mock transcription of your voice recording";
  };

  // Simple keyword extraction
  const extractKeywords = (text: string): string => {
    // Remove common words and keep important ones
    const commonWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'is', 'are']);
    return text.split(' ')
      .filter(word => word.length > 3 && !commonWords.has(word.toLowerCase()))
      .join(' ');
  };

  // Send message to iframe
  const sendMessageToIframe = (message: string) => {
    if (iframeRef.current && message.trim()) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'userMessage',
        text: message
      }, "https://www.chatbase.co");
    }
  };

  // Handle text input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessageToIframe(inputText);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date()
      }]);
      setInputText("");
    }
  };

  // Download conversation
  const downloadConversation = () => {
    const conversation = messages.map(msg => {
      const sender = msg.sender === 'user' ? 'You' : 'Bot';
      const time = msg.timestamp.toLocaleTimeString();
      return `${sender} (${time}): ${msg.text}`;
    }).join('\n\n');

    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-conversation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={downloadConversation}
          disabled={messages.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button 
          variant={isRecording ? "destructive" : "outline"} 
          size="sm"
          onClick={toggleRecording}
        >
          {isRecording ? (
            <MicOff className="w-4 h-4 mr-2" />
          ) : (
            <Mic className="w-4 h-4 mr-2" />
          )}
          {isRecording ? "Stop" : "Record"}
        </Button>
      </div>

      <div
        className="h-full w-full border border-primary rounded-2xl overflow-hidden shadow-lg bg-white"
        style={{ minHeight: 400 }}
      >
        <iframe
          ref={iframeRef}
          src="https://www.chatbase.co/chatbot-iframe/CVMyQWDltcjo-Wp3GpthV"
          width="100%"
          height="100%"
          style={{ border: 'none', width: '100%', height: '100%' }}
          title="AI Support Chatbot"
          allow="clipboard-write"
        />
      </div>

    </div>
  );
};