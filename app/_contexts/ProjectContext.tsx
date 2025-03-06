"use client";

import { createContext, useContext, ReactNode } from "react";

interface ProjectContextType {
  projectName: string;
  projectId: string;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({
  children,
  projectName,
  projectId,
}: {
  children: ReactNode;
  projectName: string;
  projectId: string;
}) {
  return (
    <ProjectContext.Provider value={{ projectName, projectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
