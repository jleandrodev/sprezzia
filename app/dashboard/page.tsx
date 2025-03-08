import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NavigationCards } from "@/app/_components/dashboard/NavigationCards";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle. Selecione um módulo para começar.
        </p>
      </div>

      <NavigationCards />
    </div>
  );
}
