"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { toast } from "sonner";
import type { Application, Tag } from "@prisma/client";

type ApplicationWithTags = Application & { tags: Tag[] };

interface KanbanBoardProps {
  applications: ApplicationWithTags[];
  onUpdate: () => void;
}

const columns = [
  { id: "SAVED", title: "Saved" },
  { id: "APPLIED", title: "Applied" },
  { id: "PHONE_SCREEN", title: "Phone Screen" },
  { id: "INTERVIEW", title: "Interview" },
  { id: "OFFER", title: "Offer" },
  { id: "REJECTED", title: "Rejected" },
];

export function KanbanBoard({ applications, onUpdate }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(applications);

  // Update items when applications prop changes
  useState(() => {
    setItems(applications);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getColumnApps = useCallback(
    (status: string) =>
      items
        .filter((app) => app.status === status)
        .sort((a, b) => a.position - b.position),
    [items]
  );

  const activeApplication = activeId
    ? items.find((app) => app.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeApp = items.find((app) => app.id === active.id);
    if (!activeApp) return;

    // Check if dropped over a column
    const overColumn = columns.find((col) => col.id === over.id);
    if (overColumn && activeApp.status !== overColumn.id) {
      setItems((prev) =>
        prev.map((app) =>
          app.id === active.id
            ? { ...app, status: overColumn.id as Application["status"] }
            : app
        )
      );
    }

    // Check if dropped over another card
    const overApp = items.find((app) => app.id === over.id);
    if (overApp && activeApp.status !== overApp.status) {
      setItems((prev) =>
        prev.map((app) =>
          app.id === active.id
            ? { ...app, status: overApp.status }
            : app
        )
      );
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    setActiveId(null);

    const movedApp = items.find((app) => app.id === active.id);
    const originalApp = applications.find((app) => app.id === active.id);

    if (!movedApp || !originalApp) return;

    if (movedApp.status !== originalApp.status) {
      try {
        const res = await fetch(`/api/applications/${movedApp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: movedApp.status }),
        });

        if (!res.ok) throw new Error();
        toast.success(`Moved to ${columns.find((c) => c.id === movedApp.status)?.title}`);
        onUpdate();
      } catch {
        setItems(applications);
        toast.error("Failed to update status");
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            applications={getColumnApps(column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <div className="rotate-3 scale-105">
            <KanbanCard application={activeApplication} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
