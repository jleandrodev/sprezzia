"use client";

import { useEffect, useState, useCallback } from "react";
import AddProjectDialog from "@/app/_components/dialog/AddProjectDialog";
import AddProjectCard from "./AddProjectCard";
import { ProjectCard } from "./ProjectCard";
import { useToast } from "@/app/_hooks/use-toast";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

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
  const { isLoaded, isSignedIn } = useAuth();

  const fetchProjects = useCallback(async () => {
    try {
      if (!isLoaded || !isSignedIn) {
        console.log("[ProjectCardsList] Usuário não autenticado");
        return;
      }

      const response = await fetch("/api/projects?workspaceId=default");

      // Log da resposta completa para debug
      console.log("[ProjectCardsList] Status:", response.status);
      console.log(
        "[ProjectCardsList] Headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log("[ProjectCardsList] Response text:", responseText);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("[ProjectCardsList] Erro ao fazer parse do JSON:", e);
        throw new Error("A resposta do servidor não é um JSON válido");
      }

      console.log("[ProjectCardsList] Projetos carregados:", data.length);
      setProjects(data);
    } catch (error) {
      console.error("[ProjectCardsList] Erro completo:", error);
      toast({
        title: "Erro ao carregar projetos",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

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

        {projects.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum projeto encontrado
          </div>
        )}
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
