"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
          <CardContent className="p-3 space-y-2">
            <div>
              <h4 className="font-medium text-sm leading-tight">
                {truncate(application.jobTitle, 40)}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {application.company}
              </p>
            </div>

            {application.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{truncate(application.location, 25)}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(application.appliedDate)}</span>
            </div>

            {application.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {application.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {application.tags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{application.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
