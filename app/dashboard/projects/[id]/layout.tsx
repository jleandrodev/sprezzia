import { ProjectService } from "@/services/project.service";
import { ProjectProvider } from "@/app/_contexts/ProjectContext";
import { notFound } from "next/navigation";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const project = await ProjectService.findById(params.id);
  if (!project) notFound();

  return (
    <ProjectProvider projectId={params.id} projectName={project.name}>
      {children}
    </ProjectProvider>
  );
}
