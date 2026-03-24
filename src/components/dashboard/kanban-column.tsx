"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };

interface KanbanColumnProps {
  id: string;
  title: string;
  applications: ApplicationWithTags[];
  color?: string;
}

const columnColors: Record<string, string> = {
  SAVED: "border-t-gray-500/60",
  APPLIED: "border-t-blue-500/60",
  PHONE_SCREEN: "border-t-purple-500/60",
  INTERVIEW: "border-t-amber-500/60",
  OFFER: "border-t-emerald-500/60",
  REJECTED: "border-t-red-500/60",
};

export function KanbanColumn({ id, title, applications }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[280px] rounded-2xl border-t-[3px] bg-white/[0.02] border border-white/[0.04]",
        columnColors[id] || "border-t-gray-500/60",
        isOver && "ring-1 ring-white/10 bg-white/[0.04]"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold tracking-tight text-white/70">{title}</h3>
        <span className="flex items-center justify-center h-5 min-w-[20px] rounded-md bg-white/[0.06] px-1.5 text-[11px] font-medium text-white/40">
          {applications.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div ref={setNodeRef} className="space-y-2 min-h-[100px]">
          <SortableContext
            items={applications.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {applications.map((app) => (
              <KanbanCard key={app.id} application={app} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
