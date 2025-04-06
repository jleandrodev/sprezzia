"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Badge } from "@/app/_components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import type { ColumnVisibility } from "@/app/_components/dashboard/guests/GuestListSettings";

interface Companion {
  id: string;
  name: string;
  status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
}

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
  messageStatus: "NAO_ENVIADA" | "ENVIADA" | "ERRO";
  companions: Companion[];
  children_0_6: number;
  children_7_10: number;
}

interface Project {
  id: string;
  name: string;
}

// Adiciona estilos globais para impressão
const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print {
      display: none !important;
    }

    .print-break-inside-avoid {
      break-inside: avoid;
    }
  }
`;

export default function PublicGuestList({
  params,
}: {
  params: { id: string };
}) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    phone: true,
    status: true,
    companions: true,
    messageStatus: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca os dados do projeto
        const projectResponse = await fetch(
          `/api/public/projects/${params.id}`
        );
        if (!projectResponse.ok) throw new Error("Projeto não encontrado");
        const projectData = await projectResponse.json();
        setProject(projectData);

        // Busca a lista de convidados
        const guestsResponse = await fetch(
          `/api/public/projects/${params.id}/guests`
        );
        if (!guestsResponse.ok) throw new Error("Erro ao carregar convidados");
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Carrega as configurações salvas
    const savedSettings = localStorage.getItem(`guestList-${params.id}`);
    if (savedSettings) {
      setColumnVisibility(JSON.parse(savedSettings));
    }

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!project) {
    return <div className="p-8">Projeto não encontrado</div>;
  }

  const getStatusStyle = (status: Guest["status"]) => {
    switch (status) {
      case "CONFIRMADO_PRESENCA":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "CONFIRMADO_AUSENCIA":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
    }
  };

  const getStatusBadge = (status: Guest["status"]) => {
    const style = getStatusStyle(status);
    return (
      <Badge className={style}>
        {status === "CONFIRMADO_PRESENCA"
          ? "Confirmado Presença"
          : status === "CONFIRMADO_AUSENCIA"
            ? "Confirmado Ausência"
            : "Pendente"}
      </Badge>
    );
  };

  const getMessageStatusBadge = (status: Guest["messageStatus"]) => {
    switch (status) {
      case "ENVIADA":
        return (
          <Badge className="bg-green-100 text-green-800">
            Mensagem Enviada
          </Badge>
        );
      case "ERRO":
        return <Badge className="bg-red-100 text-red-800">Erro de Envio</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Não Enviada</Badge>;
    }
  };

  // Calcula o total de convidados confirmados (incluindo acompanhantes)
  const getTotalConfirmed = () => {
    let total = 0;
    let confirmed = 0;

    guests.forEach((guest) => {
      total++;
      if (guest.status === "CONFIRMADO_PRESENCA") {
        confirmed++;
      }

      guest.companions.forEach((companion) => {
        total++;
        if (companion.status === "CONFIRMADO_PRESENCA") {
          confirmed++;
        }
      });
    });

    return { total, confirmed };
  };

  // Calcula o total de crianças por faixa etária
  const getTotalChildren = () => {
    return guests.reduce(
      (acc, guest) => ({
        children_0_6: acc.children_0_6 + (guest.children_0_6 || 0),
        children_7_10: acc.children_7_10 + (guest.children_7_10 || 0),
      }),
      { children_0_6: 0, children_7_10: 0 }
    );
  };

  const { total, confirmed } = getTotalConfirmed();
  const { children_0_6, children_7_10 } = getTotalChildren();

  return (
    <div className="min-h-screen bg-background">
      <style jsx global>
        {printStyles}
      </style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Lista de Convidados</h1>
              <p className="text-muted-foreground">{project.name}</p>
            </div>
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2 no-print"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-break-inside-avoid">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Convidados Confirmados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {confirmed}/{total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de presenças confirmadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Crianças (0-6 anos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{children_0_6}</div>
                <p className="text-xs text-muted-foreground">
                  Total de crianças de 0 a 6 anos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Crianças (7-10 anos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{children_7_10}</div>
                <p className="text-xs text-muted-foreground">
                  Total de crianças de 7 a 10 anos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border bg-white print-break-inside-avoid">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  {columnVisibility.phone && <TableHead>Telefone</TableHead>}
                  {columnVisibility.status && <TableHead>Status</TableHead>}
                  {columnVisibility.companions && (
                    <TableHead>Acompanhantes</TableHead>
                  )}
                  {columnVisibility.messageStatus && (
                    <TableHead>Status da Mensagem</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        1 +
                        Object.values(columnVisibility).filter(Boolean).length
                      }
                      className="text-center"
                    >
                      Nenhum convidado cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">
                        {guest.name}
                      </TableCell>
                      {columnVisibility.phone && (
                        <TableCell>
                          {guest.phone || (
                            <span className="text-muted-foreground text-sm">
                              Não informado
                            </span>
                          )}
                        </TableCell>
                      )}
                      {columnVisibility.status && (
                        <TableCell>{getStatusBadge(guest.status)}</TableCell>
                      )}
                      {columnVisibility.companions && (
                        <TableCell>
                          {guest.companions.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                {guest.companions.length} acompanhante(s)
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {guest.companions.map((companion) => (
                                  <Badge
                                    key={companion.id}
                                    className={getStatusStyle(companion.status)}
                                  >
                                    {companion.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Sem acompanhantes
                            </span>
                          )}
                        </TableCell>
                      )}
                      {columnVisibility.messageStatus && (
                        <TableCell>
                          {getMessageStatusBadge(guest.messageStatus)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
