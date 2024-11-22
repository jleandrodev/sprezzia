import { Plus } from "lucide-react";
import ProjectCard from "./ProjectCard";
import Link from "next/link";

export default function AddProjectCard() {
  return (
    <Link href="#">
      <ProjectCard
        title="Criar Projeto"
        description="Novo Projeto"
        icon={<Plus size={50} />}
      />
    </Link>
  );
}
