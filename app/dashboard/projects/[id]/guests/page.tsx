import { notFound } from "next/navigation";
import { ProjectService } from "@/services/project.service";
import GuestList from "@/app/_components/dashboard/guests/GuestList";
import AddGuestDialog from "@/app/_components/dashboard/guests/AddGuestDialog";

async function getProject(id: string) {
  const project = await ProjectService.findById(id);
  if (!project) notFound();
  return project;
}

export default async function GuestsPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold">Lista de Convidados</h1>
          <p className="text-muted-foreground">
            Gerencie os convidados do evento {project.name}
          </p>
        </div>
        <AddGuestDialog projectId={params.id} />
      </div>

      <GuestList projectId={params.id} />
    </div>
  );
}
