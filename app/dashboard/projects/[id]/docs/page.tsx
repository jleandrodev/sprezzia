import { ProjectService } from "@/services/project.service";
import { notFound } from "next/navigation";
import DocumentList from "@/app/_components/dashboard/documents/DocumentList";

async function getProject(id: string) {
  const project = await ProjectService.findById(id);
  if (!project) notFound();
  return project;
}

export default async function ProjectDocumentsPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie os documentos do projeto {project.name}
        </p>
      </div>

      <DocumentList projectId={params.id} />
    </div>
  );
}
