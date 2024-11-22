import ProjectCardsList from "@/app/_components/dashboard/projects/cards/ProjectCardsList";

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl font-semibold">Lista de Projetos</h1>
      <ProjectCardsList />
    </div>
  );
}
