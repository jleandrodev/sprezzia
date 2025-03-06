"use client";

import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projetos",
  guests: "Convidados",
  docs: "Documentos",
  settings: "Configurações",
};

export function BreadcrumbNav() {
  const pathname = usePathname();

  const breadcrumbs = React.useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    const items = [];
    let currentPath = "";

    for (const path of paths) {
      currentPath += `/${path}`;

      if (path.length === 36 && /^[0-9a-f-]+$/i.test(path)) {
        items.push({
          label: "Detalhes do Projeto",
          href: currentPath,
        });
        continue;
      }

      items.push({
        label: routeMap[path] || path,
        href: currentPath,
      });
    }

    return items;
  }, [pathname]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
