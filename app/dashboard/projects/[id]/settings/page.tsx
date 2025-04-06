import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProjectService } from "@/services/project.service";
import ProjectSettingsForm from "./ProjectSettingsForm";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

async function getProject(id: string) {
  const project = await ProjectService.findById(id);
  if (!project) {
    throw new Error("Projeto não encontrado");
  }
  return project;
}

export default async function ProjectSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold">Configurações do Projeto</h1>
        <DeleteProjectDialog projectId={params.id} projectName={project.name} />
      </div>
      <ProjectSettingsForm project={project} />
    </div>
  );
}
