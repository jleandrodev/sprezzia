import { Plus } from "lucide-react";
import ProjectCard from "./ProjectCard";
import Link from "next/link";

export default function AddProjectCard() {
  return (
    <ProjectCard
      title="Criar Projeto"
      description="Novo Projeto"
      icon={<Plus size={50} />}
    />
  );
}
