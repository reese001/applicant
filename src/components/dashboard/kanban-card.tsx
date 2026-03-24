"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { Application, Tag } from "@prisma/client";
import Link from "next/link";

type ApplicationWithTags = Application & { tags: Tag[] };

interface KanbanCardProps {
  application: ApplicationWithTags;
}

export function KanbanCard({ application }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/dashboard/applications/${application.id}`}>
        <div className="cursor-grab active:cursor-grabbing liquid-glass rounded-xl p-3.5 space-y-2.5 hover:bg-white/[0.04] transition-colors">
          <div>
            <h4 className="font-medium text-sm leading-snug text-white/85">
              {truncate(application.jobTitle, 40)}
            </h4>
            <p className="text-xs text-white/40 mt-0.5">
              {application.company}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-white/30">
            {application.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {truncate(application.location, 20)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(application.appliedDate)}
            </span>
          </div>

          {application.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {application.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 font-normal bg-white/[0.04] border-white/[0.08] text-white/50"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {application.tags.length > 3 && (
                <span className="text-[10px] text-white/30">
                  +{application.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
