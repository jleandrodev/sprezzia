import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Progress } from "@/app/_components/ui/progress";
import { Calendar } from "@/app/_components/ui/calendar";
import { Badge } from "@/app/_components/ui/badge";
import { FileText, Users, Settings } from "lucide-react";
import { ProjectService } from "@/services/project.service";
import Link from "next/link";
import { Button } from "@/app/_components/ui/button";
import { formatCurrency } from "@/app/_lib/utils";
import { notFound } from "next/navigation";

async function getProject(id: string) {
  const project = await ProjectService.findById(id);
  if (!project) notFound();
  return project;
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);
  const today = new Date();
  const eventDate = project.date ? new Date(project.date) : null;
  const daysUntilEvent = eventDate ? differenceInDays(eventDate, today) : null;

  // Valor fixo de 70% para o progresso do orçamento
  const budgetProgress = 70;
  const usedBudget = project.budget
    ? (project.budget * budgetProgress) / 100
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold">{project.name}</h1>
        <Link href={`/dashboard/projects/${params.id}/settings`}>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações do Evento
          </Button>
        </Link>
      </div>

      {/* Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Contagem Regressiva */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span role="img" aria-label="calendar">
                ⏳
              </span>
              Contagem Regressiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {daysUntilEvent !== null ? (
                <>
                  <p className="text-3xl font-bold text-primary">
                    {daysUntilEvent} dias
                  </p>
                  <p className="text-sm text-muted-foreground">
                    para o seu evento
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Data do evento não definida
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span role="img" aria-label="money">
                💰
              </span>
              Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-col">
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(project.budget || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Orçamento Total</p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilizado</span>
                  <span className="font-medium">
                    {formatCurrency(usedBudget)}
                  </span>
                </div>

                <Progress value={budgetProgress} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Disponível</span>
                  <span className="font-medium text-primary">
                    {formatCurrency((project.budget || 0) - usedBudget)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span role="img" aria-label="documents">
                📄
              </span>
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Acesse os contratos e documentos do seu evento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Inferior */}
      <div className="grid grid-cols-12 gap-6">
        {/* Calendário */}
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span role="img" aria-label="calendar">
                📅
              </span>
              Calendário do Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={project.date ?? new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Lista de Convidados */}
        <Card className="col-span-12 md:col-span-8 cursor-pointer hover:bg-accent/50 transition-colors">
          <Link href={`/dashboard/projects/${params.id}/guests`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span role="img" aria-label="guests">
                  👥
                </span>
                Lista de Convidados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">Acompanhantes</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "João Silva",
                        companions: 2,
                        status: "confirmed",
                      },
                      {
                        name: "Maria Santos",
                        companions: 1,
                        status: "pending",
                      },
                      {
                        name: "Pedro Oliveira",
                        companions: 3,
                        status: "declined",
                      },
                    ].map((guest, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{guest.name}</td>
                        <td className="p-2">{guest.companions}</td>
                        <td className="p-2">
                          <Badge
                            variant="secondary"
                            className={
                              guest.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : guest.status === "pending"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {guest.status === "confirmed"
                              ? "Confirmado Presença"
                              : guest.status === "pending"
                                ? "Pendente"
                                : "Confirmado Ausência"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
