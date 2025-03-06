import { ProjectService } from "@/services/project.service";

async function getProjectName(projectId: string) {
  try {
    const project = await ProjectService.findById(projectId);
    return project?.name || projectId;
  } catch (error) {
    console.error("Erro ao buscar nome do projeto:", error);
    return projectId;
  }
}

export async function ProjectName({ projectId }: { projectId: string }) {
  const name = await getProjectName(projectId);
  return <>{name}</>;
}
