import { Plus } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/_components/ui/card";

interface AddProjectCardProps {
  onClick: () => void;
}

export default function AddProjectCard({ onClick }: AddProjectCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo Projeto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Clique para criar um novo projeto
        </p>
      </CardContent>
    </Card>
  );
}
