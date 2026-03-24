import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  SAVED: { label: "Saved", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  APPLIED: { label: "Applied", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  PHONE_SCREEN: { label: "Phone Screen", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  INTERVIEW: { label: "Interview", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  OFFER: { label: "Offer", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  REJECTED: { label: "Rejected", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-white/[0.06] text-white/50 border-white/[0.08]" };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
