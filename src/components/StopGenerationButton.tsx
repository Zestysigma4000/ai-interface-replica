import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";

interface StopGenerationButtonProps {
  onStop: () => void;
}

export const StopGenerationButton = ({ onStop }: StopGenerationButtonProps) => {
  return (
    <div className="flex justify-center py-4">
      <Button
        onClick={onStop}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Square className="h-3.5 w-3.5 fill-current" />
        Stop generating
      </Button>
    </div>
  );
};
