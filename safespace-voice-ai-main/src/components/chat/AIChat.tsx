import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, MicOff, Volume2 } from "lucide-react";
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
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  
  const { t, currentLanguage } = useLanguage();
  const { speak, isVoiceEnabled } = useVoice();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = currentLanguage === 'en' ? 'en-ZA' : `${currentLanguage}-ZA`;

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [currentLanguage]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: t('ai_welcome_message'),
        sender: 'bot',
        timestamp: new Date(),
        language: currentLanguage
      };
      setMessages([welcomeMessage]);
      
      if (isVoiceEnabled) {
        speak(welcomeMessage.text);
      }
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      language: currentLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateAIResponse(inputMessage, currentLanguage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      if (isVoiceEnabled) {
        speak(botResponse);
      }
    }, 1500);
  };

  const startVoiceInput = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognition.current && isListening) {
      setIsListening(false);
      recognition.current.stop();
    }
  };

  const generateAIResponse = (userInput: string, language: string): string => {
    const input = userInput.toLowerCase();

    // Emergency keywords
    if (input.includes('emergency') || input.includes('help') || input.includes('danger')) {
      return t('ai_emergency_response');
    }

    // Legal questions
    if (input.includes('legal') || input.includes('rights') || input.includes('law')) {
      return t('ai_legal_response');
    }

    // Reporting questions
    if (input.includes('report') || input.includes('incident') || input.includes('complaint')) {
      return t('ai_report_response');
    }

    // Safety questions
    if (input.includes('safe') || input.includes('protection') || input.includes('security')) {
      return t('ai_safety_response');
    }

    // Support questions
    if (input.includes('support') || input.includes('counseling') || input.includes('therapy')) {
      return t('ai_support_response');
    }

    // Default response
    return t('ai_default_response');
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          {t('ai_assistant')}
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">{t('online')}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.sender === 'bot' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-8 w-8"
                    onClick={() => speak(message.text)}
                    title={t('read_aloud')}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}

                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('type_message')}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                title={isListening ? t('stop_listening') : t('start_voice_input')}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-destructive animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {isListening && (
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-destructive rounded-full animate-ping" />
                {t('listening')}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};