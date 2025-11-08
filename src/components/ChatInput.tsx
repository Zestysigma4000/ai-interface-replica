import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import { useState, KeyboardEvent, useRef } from "react";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((message.trim() || selectedFiles.length > 0) && !disabled) {
      onSend(message, selectedFiles);
      setMessage("");
      setSelectedFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto p-4">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-20 w-20 object-cover rounded border border-border"
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center bg-muted rounded border border-border">
                    <Paperclip className="h-6 w-6" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="relative flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.txt,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Assistant..."
            disabled={disabled}
            className="min-h-[52px] max-h-[200px] resize-none pr-12"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && selectedFiles.length === 0) || disabled}
            size="icon"
            className="absolute right-2 bottom-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
