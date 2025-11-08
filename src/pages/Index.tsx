import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Welcome conversation",
      timestamp: "Just now",
      messages: [
        {
          id: "m1",
          role: "assistant",
          content: "Hello! I'm your AI assistant. How can I help you today?",
        },
      ],
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>("1");

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New conversation",
      timestamp: "Just now",
      messages: [
        {
          id: `m${Date.now()}`,
          role: "assistant",
          content: "Hello! I'm your AI assistant. How can I help you today?",
        },
      ],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;

    const userMessage: Message = {
      id: `m${Date.now()}`,
      role: "user",
      content,
    };

    // Add user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              title: conv.messages.length === 1 ? content.slice(0, 30) : conv.title,
            }
          : conv
      )
    );

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `m${Date.now()}`,
        role: "assistant",
        content:
          "I'm a demo assistant interface. In a real implementation, I would process your message and provide a helpful response. You can integrate this with an AI API to get actual responses!",
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      );
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-chat-bg">
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectChat={setActiveConversationId}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ScrollArea className="flex-1">
          {activeConversation?.messages.map((message) => (
            <ChatMessage key={message.id} role={message.role} content={message.content} />
          ))}
        </ScrollArea>

        <ChatInput onSend={handleSendMessage} />
      </main>
    </div>
  );
};

export default Index;
