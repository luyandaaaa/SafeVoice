import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'survivor' | 'responder';
}

interface Chat {
  id: string;
  survivorId: string;
  lastMessage: string;
  timestamp: string;
  status: string;
}

export const ChatSection = () => {
  const [activeChat, setActiveChat] = useState<string>("1");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats] = useState<Chat[]>([
    { id: "1", survivorId: "GBV-2023-0012", lastMessage: "I need help. I'm not safe.", timestamp: "15 Oct, 14:35", status: "new" },
    { id: "2", survivorId: "GBV-2023-0011", lastMessage: "Thank you for your help", timestamp: "14 Oct, 16:20", status: "in-progress" },
    { id: "3", survivorId: "GBV-2023-0010", lastMessage: "I'm feeling better now", timestamp: "13 Oct, 09:45", status: "resolved" },
  ]);

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem(`gbv-chat-${activeChat}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Sample messages for active chat
      const sampleMessages: Message[] = [
        {
          id: "1",
          content: "Hello, I need help. I'm not safe.",
          timestamp: "15 Oct, 14:30",
          sender: "survivor"
        },
        {
          id: "2",
          content: "I'm here to help. Can you tell me what's happening?",
          timestamp: "15 Oct, 14:32",
          sender: "responder"
        },
        {
          id: "3",
          content: "My partner has been physically abusive. I have photos of my injuries.",
          timestamp: "15 Oct, 14:35",
          sender: "survivor"
        }
      ];
      setMessages(sampleMessages);
      localStorage.setItem(`gbv-chat-${activeChat}`, JSON.stringify(sampleMessages));
    }
  }, [activeChat]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      sender: "responder"
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`gbv-chat-${activeChat}`, JSON.stringify(updatedMessages));
    setMessage("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className="bg-card rounded-lg shadow-custom p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Secure Chat</h2>
        <Button variant="default">
          <MessageSquare className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <div className="bg-muted rounded-lg">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Active Conversations</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer transition-smooth hover:bg-accent",
                  activeChat === chat.id && "bg-accent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground">Survivor #{chat.survivorId}</h4>
                  {getStatusBadge(chat.status)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                <p className="text-xs text-muted-foreground mt-1">{chat.timestamp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 flex flex-col bg-muted rounded-lg">
          <div className="p-4 border-b border-border bg-card rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">
                Survivor #{currentChat?.survivorId}
              </h3>
              {currentChat && getStatusBadge(currentChat.status)}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  msg.sender === "survivor"
                    ? "bg-card text-foreground mr-auto"
                    : "bg-primary text-primary-foreground ml-auto"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-card rounded-b-lg">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};