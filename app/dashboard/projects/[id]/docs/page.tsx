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
      const project = await ProjectService.findById(params.id);
      if (project) {
        setTitle(project.name);
      }
    };

    fetchProject();
  }, [params.id, setTitle]);

  return (
    <div className="container mx-auto py-6">
      <DocumentList projectId={params.id} />
    </div>
  );
}
