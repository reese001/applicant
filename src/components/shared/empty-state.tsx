import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-2xl bg-white/[0.04] p-5 mb-4">
        <Icon className="h-8 w-8 text-white/30" />
      </div>
      <h3 className="text-lg font-semibold mb-1 text-white/80">{title}</h3>
      <p className="text-sm text-white/35 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="liquid-glass-strong rounded-xl px-5 py-2.5 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
