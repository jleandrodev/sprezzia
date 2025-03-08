"use client";

import { useState, useEffect, useCallback } from "react";
import { ProjectCard } from "@/app/_components/dashboard/projects/cards/ProjectCard";
import { useToast } from "@/app/_hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  type: string | null;
  budget: number | null;
  image: string | null;
}

interface ProjectListProps {
  workspaceId: string;
}

export function ProjectList({ workspaceId }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error("Erro ao buscar projetos");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos.",
        variant: "destructive",
      });
    }
  }, [workspaceId, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.name}
          description={project.description || ""}
          budget={project.budget}
          image={project.image || undefined}
        />
      ))}
      {projects.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          Nenhum projeto encontrado
        </div>
      )}
    </div>
  );
}
