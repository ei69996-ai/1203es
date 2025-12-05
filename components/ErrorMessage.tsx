import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({
  title = "오류가 발생했습니다",
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 bg-red-50 border border-red-200 rounded-lg",
        className
      )}
    >
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div className="text-center">
        <h3 className="text-lg font-bold text-red-800 mb-2">{title}</h3>
        <p className="text-sm text-red-600">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          다시 시도
        </Button>
      )}
    </div>
  );
}

