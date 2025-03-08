"use client";

import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  DollarSign,
  FolderKanban,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { Badge } from "@/app/_components/ui/badge";

interface NavigationCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  stats?: {
    label: string;
    value: string | number;
  }[];
  color?: string;
}

function NavigationCard({
  href,
  icon,
  title,
  description,
  disabled,
  stats,
  color = "bg-card",
}: NavigationCardProps) {
  const Card = disabled ? "div" : Link;

  return (
    <Card
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-lg border transition-all",
        disabled && "opacity-60 cursor-not-allowed hover:border-border",
        color === "bg-card" ? "hover:border-foreground/50" : "border-transparent hover:scale-[1.02]"
      )}
    >
      <div className={cn(
        "p-6",
        color
      )}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-semibold">{title}</h3>
              {disabled && (
                <Badge variant="secondary" className="font-normal">
                  Em Breve
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-medium">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export function NavigationCards() {
  const cards: NavigationCardProps[] = [
    {
      href: "/dashboard/projects",
      icon: <FolderKanban className="h-5 w-5" />,
      title: "Projetos",
      description: "Gerencie seus projetos de casamento",
      color: "bg-emerald-100 dark:bg-emerald-900/50",
    },
    {
      href: "/dashboard/calendar",
      icon: <Calendar className="h-5 w-5" />,
      title: "Agenda",
      description: "Organize seus compromissos e eventos",
      color: "bg-purple-100 dark:bg-purple-900/50",
      disabled: true,
    },
    {
      href: "/dashboard/tasks",
      icon: <ClipboardList className="h-5 w-5" />,
      title: "Tarefas",
      description: "Acompanhe e gerencie suas tarefas",
      color: "bg-blue-100 dark:bg-blue-900/50",
      disabled: true,
    },
    {
      href: "/dashboard/finance",
      icon: <DollarSign className="h-5 w-5" />,
      title: "Financeiro",
      description: "Controle seus gastos e orçamentos",
      color: "bg-amber-100 dark:bg-amber-900/50",
      disabled: true,
    },
    {
      href: "/dashboard/team",
      icon: <Users className="h-5 w-5" />,
      title: "Equipe",
      description: "Gerencie sua equipe de trabalho",
      color: "bg-rose-100 dark:bg-rose-900/50",
      disabled: true,
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      title: "Configurações",
      description: "Configure suas preferências",
      color: "bg-slate-100 dark:bg-slate-900/50",
      disabled: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <NavigationCard key={i} {...card} />
      ))}
    </div>
  );
}
