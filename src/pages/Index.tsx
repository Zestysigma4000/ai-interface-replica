import { useState, useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { StopGenerationButton } from "@/components/StopGenerationButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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
          content: "Hello! I'm powered by DeepSeek v3.1 running on Ollama. How can I help you today?",
        },
      ],
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New conversation",
      timestamp: "Just now",
      messages: [
        {
          id: `m${Date.now()}`,
          role: "assistant",
          content: "Hello! I'm powered by DeepSeek v3.1 running on Ollama. How can I help you today?",
        },
      ],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return;

    const ollamaUrl = localStorage.getItem("ollamaUrl");
    if (!ollamaUrl) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Ollama URL in settings first.",
        variant: "destructive",
      });
      return;
    }

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

    // Create empty assistant message
    const assistantMessageId = `m${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      )
    );

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const allMessages = activeConversation?.messages || [];
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ollama-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...allMessages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            ollamaUrl,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response from Ollama");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              accumulatedContent += json.message.content;
              
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === activeConversationId
                    ? {
                        ...conv,
                        messages: conv.messages.map((msg) =>
                          msg.id === assistantMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                        ),
                      }
                    : conv
                )
              );
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Generation stopped by user");
      } else {
        console.error("Error calling Ollama:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to connect to Ollama",
          variant: "destructive",
        });
        
        // Remove the empty assistant message on error
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.filter((msg) => msg.id !== assistantMessageId),
                }
              : conv
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;

    // Remove the last assistant message
    const messagesWithoutLast = activeConversation.messages.slice(0, -1);
    const lastUserMessage = messagesWithoutLast[messagesWithoutLast.length - 1];

    if (lastUserMessage.role !== "user") return;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, messages: messagesWithoutLast }
          : conv
      )
    );

    await handleSendMessage(lastUserMessage.content);
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
        <ScrollArea className="flex-1" ref={scrollRef}>
          {activeConversation?.messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              onRegenerate={
                index === activeConversation.messages.length - 1 &&
                message.role === "assistant"
                  ? handleRegenerate
                  : undefined
              }
            />
          ))}
          {isGenerating && <StopGenerationButton onStop={stopGeneration} />}
        </ScrollArea>

        <ChatInput onSend={handleSendMessage} disabled={isGenerating} />
      </main>
    </div>
  );
};

export default Index;
