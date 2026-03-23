"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  SAVED: "border-t-gray-400",
  APPLIED: "border-t-blue-500",
  PHONE_SCREEN: "border-t-purple-500",
  INTERVIEW: "border-t-amber-500",
  OFFER: "border-t-green-500",
  REJECTED: "border-t-red-500",
};

export function KanbanColumn({ id, title, applications }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[280px] rounded-lg border border-t-4 bg-muted/30",
        columnColors[id] || "border-t-gray-400",
        isOver && "ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-center justify-between p-3 pb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {applications.length}
        </span>
      </div>

      <ScrollArea className="flex-1 px-3 pb-3">
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
      </ScrollArea>
    </div>
  );
}
