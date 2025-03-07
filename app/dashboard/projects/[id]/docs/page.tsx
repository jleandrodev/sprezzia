"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/app/_contexts/PageTitleContext";
import { ProjectService } from "@/services/project.service";
import { DocumentList } from "@/app/_components/dashboard/documents/DocumentList";

interface DocsPageProps {
  params: {
    id: string;
  };
}

export default function DocsPage({ params }: DocsPageProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await ProjectService.findById(params.id);
        if (project) {
          setTitle(project.name);
        }
      } catch (error) {
        console.error("Erro ao buscar projeto:", error);
      }
    };

    fetchProject();
  }, [params.id, setTitle]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie os documentos do seu projeto
        </p>
      </div>

      <DocumentList projectId={params.id} />
    </div>
  );
}
