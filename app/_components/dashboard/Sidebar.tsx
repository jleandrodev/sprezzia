"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  DollarSign,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

function SidebarLink({ href, icon, label, disabled }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const LinkComponent = disabled ? "div" : Link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <LinkComponent
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
            isActive
              ? "bg-[#55B02E] text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            disabled && "opacity-60 cursor-not-allowed hover:bg-transparent"
          )}
        >
          {icon}
          <span>{label}</span>
          {disabled && (
            <Badge variant="secondary" className="ml-auto font-normal">
              Em Breve
            </Badge>
          )}
        </LinkComponent>
      </TooltipTrigger>
      <TooltipContent side="right">
        {disabled ? `${label} - Em Breve` : label}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const links: SidebarLinkProps[] = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/projects",
      icon: <FolderKanban className="h-5 w-5" />,
      label: "Projetos",
    },
    {
      href: "/dashboard/calendar",
      icon: <Calendar className="h-5 w-5" />,
      label: "Agenda",
      disabled: true,
    },
    {
      href: "/dashboard/tasks",
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Tarefas",
      disabled: true,
    },
    {
      href: "/dashboard/finance",
      icon: <DollarSign className="h-5 w-5" />,
      label: "Financeiro",
      disabled: true,
    },
    {
      href: "/dashboard/team",
      icon: <Users className="h-5 w-5" />,
      label: "Equipe",
      disabled: true,
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Configurações",
      disabled: true,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Menu</h2>
        <div className="space-y-1">
          {links.map((link, i) => (
            <SidebarLink key={i} {...link} />
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-t">
        <a
          href="https://forms.gle/62Br5qinm5T9gfzX8"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LifeBuoy className="h-5 w-5" />
          <span>Solicitar Suporte</span>
        </a>
      </div>
    </div>
  );
}
