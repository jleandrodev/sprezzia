import { cn } from "@/app/_lib/utils";
import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/app/_lib/utils";

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  image?: string;
  budget?: number | null;
}

export function ProjectCard({
  id,
  title,
  description,
  icon,
  image,
  budget,
}: ProjectCardProps) {
  return (
    <Link href={`/dashboard/projects/${id}`}>
      <div className="flex flex-col rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative w-full h-[200px]">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              {icon}
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {budget && (
            <p className="text-sm font-medium text-primary">
              {formatCurrency(budget)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
