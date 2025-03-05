import { cn } from "@/app/_lib/utils";
import { ReactNode } from "react";
import Link from "next/link";
import { formatCurrency } from "@/app/_lib/utils";

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  image?: string;
  budget?: number | null;
}

export default function ProjectCard({
  id,
  title,
  description,
  icon,
  image,
  budget,
}: ProjectCardProps) {
  return (
    <Link href={`/dashboard/projects/${id}`}>
      <div
        className={cn(
          "w-full h-[250px] bg-muted/50 rounded border border-muted-foreground",
          "flex items-center justify-center relative outline-none overflow-hidden",
          "hover:brightness-105 dark:hover:brightness-125 transition-all",
          "bg-cover bg-center cursor-pointer"
        )}
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        {icon}
        <div className="absolute w-full left-0 bottom-0 p-3 bg-gradient-to-t from-background">
          <p className="text-sm font-semibold">{title}</p>
          <span className="block text-xs text-muted-foreground">
            {description}
          </span>
          {budget && (
            <span className="block text-xs font-medium text-primary mt-1">
              {formatCurrency(budget)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
