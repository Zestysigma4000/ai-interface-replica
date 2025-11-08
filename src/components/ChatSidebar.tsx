import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export const ChatSidebar = ({ conversations, activeId, onNewChat, onSelectChat }: ChatSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-sidebar-bg border-r border-border
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-border">
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    onSelectChat(conversation.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-lg
                    transition-colors duration-200
                    flex items-center gap-3
                    ${activeId === conversation.id
                      ? 'bg-sidebar-hover'
                      : 'hover:bg-sidebar-hover'
                    }
                  `}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
