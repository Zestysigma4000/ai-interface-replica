import { User, Bot } from "lucide-react";
import { MessageActions } from "./MessageActions";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onRegenerate?: () => void;
}

export const ChatMessage = ({ role, content, onRegenerate }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`py-8 group ${isUser ? 'bg-user-message-bg' : 'bg-ai-message-bg'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-6 flex gap-6">
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center
          ${isUser ? 'bg-foreground text-background' : 'bg-accent'}
        `}>
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <p className="text-sm font-semibold">{isUser ? 'You' : 'Assistant'}</p>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{content}</p>
          </div>
          <MessageActions 
            content={content} 
            onRegenerate={onRegenerate} 
            role={role}
          />
        </div>
      </div>
    </div>
  );
};
