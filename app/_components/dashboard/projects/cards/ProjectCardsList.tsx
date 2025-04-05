"use client";

import { useEffect, useState, useCallback } from "react";
import AddProjectDialog from "@/app/_components/dialog/AddProjectDialog";
import AddProjectCard from "./AddProjectCard";
import { ProjectCard } from "./ProjectCard";
import { useToast } from "@/app/_hooks/use-toast";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  workspaceId: string;
  image?: string;
}

export default function ProjectCardsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects?workspaceId=default");
      if (!response.ok) throw new Error("Erro ao carregar projetos");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AddProjectCard onClick={() => setIsDialogOpen(true)} />

        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <ProjectCard
              id={project.id}
              image={project.image}
              title={project.name}
              description={project.description || ""}
            />
          </Link>
        ))}
      </div>

      <AddProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          fetchProjects();
          setIsDialogOpen(false);
        }}
      />
    </>
  );
}
