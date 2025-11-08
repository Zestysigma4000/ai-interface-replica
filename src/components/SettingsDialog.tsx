import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SettingsDialog = () => {
  const [ollamaUrl, setOllamaUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("ollamaUrl");
    if (saved) setOllamaUrl(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem("ollamaUrl", ollamaUrl);
    toast({
      title: "Settings saved",
      description: "Your Ollama configuration has been updated.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-lg">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Ollama connection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ollama-url">Ollama URL</Label>
            <Input
              id="ollama-url"
              placeholder="http://your-server:11434"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter your publicly accessible Ollama endpoint (e.g., via ngrok or a public server)
            </p>
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
