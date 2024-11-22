import AddProjectCard from "./AddProjectCard";
import ProjectCard from "./ProjectCard";

export default function ProjectCardsList() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ">
      <AddProjectCard />
      <ProjectCard
        image="/casal-1.jpg"
        title="Casamento J&L"
        description="Casamento Chacara Vida"
      />
      <ProjectCard
        image="/casal-2.jpg"
        title="Casamento G&L"
        description="Casamento Eden Garden"
      />
      <ProjectCard
        image="/casal-1.jpg"
        title="Casamento R&R"
        description="Casamento Vale Azul"
      />
    </section>
  );
}
