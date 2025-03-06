"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useEffect, useState } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projetos",
  guests: "Convidados",
  docs: "Documentos",
  settings: "Configurações",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const [projectName, setProjectName] = useState<string>("");

  // Função para buscar o nome do projeto
  const fetchProjectName = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      setProjectName(data.name);
    } catch (error) {
      console.error("Erro ao buscar nome do projeto:", error);
    }
  };

  useEffect(() => {
    const projectId = pathname
      .split("/")
      .find((path) => path.length === 36 && /^[0-9a-f-]+$/i.test(path));

    if (projectId) {
      fetchProjectName(projectId);
    } else {
      setProjectName("");
    }
  }, [pathname]);

  const breadcrumbs = useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    let currentPath = "";

    return paths
      .map((path, index) => {
        if (path.length === 36 && /^[0-9a-f-]+$/i.test(path)) {
          currentPath += `/${path}`;
          return {
            label: projectName || "Carregando...",
            href: `/dashboard/projects/${path}`,
            isLast: index === paths.length - 1,
          };
        }

        currentPath += `/${path}`;
        const isLast = index === paths.length - 1;

        return {
          label: routeMap[path] || path,
          href: currentPath,
          isLast,
        };
      })
      .filter(Boolean) as BreadcrumbItem[];
  }, [pathname, projectName]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((breadcrumb) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {breadcrumb.isLast ? (
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
