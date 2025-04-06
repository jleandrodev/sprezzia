"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { useToast } from "@/app/_hooks/use-toast";
import { cn } from "@/app/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import EditGuestDialog from "./EditGuestDialog";
import DeleteGuestDialog from "./DeleteGuestDialog";
import AddGuestDialog from "./AddGuestDialog";
import { useProject } from "@/app/_contexts/ProjectContext";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useGuests } from "@/app/_hooks/use-guests";
import { GuestListSettings, ColumnVisibility } from "./GuestListSettings";
import { GuestListMenu } from "./GuestListMenu";

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
  observations?: string;
}

interface GuestListProps {
  projectId: string;
}

export function GuestList({ projectId }: GuestListProps) {
  const { guests, isLoading, fetchGuests } = useGuests(projectId);
  const { projectName } = useProject();
  const { toast } = useToast();
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    phone: true,
    companions: true,
    messageStatus: true,
    observations: true,
  });

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    // Carrega as configurações salvas
    const savedSettings = localStorage.getItem(`guestList-${projectId}`);
    if (savedSettings) {
      setColumnVisibility(JSON.parse(savedSettings));
    }
  }, [projectId]);

  const updateAllStatus = async (
    guestId: string,
    status: "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA"
  ) => {
    try {
      // Atualiza o convidado principal
      const response = await fetch(
        `/api/projects/${projectId}/guests/${guestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do convidado principal");
      }

      // Atualiza o status dos acompanhantes
      const guest = guests.find((g) => g.id === guestId);
      if (guest?.companions.length) {
        const companionPromises = guest.companions.map((companion) =>
          fetch(
            `/api/projects/${projectId}/guests/${guestId}/companions/${companion.id}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            }
          )
        );

        // Aguarda todas as atualizações dos acompanhantes terminarem
        const results = await Promise.all(companionPromises);

        // Verifica se todas as atualizações foram bem sucedidas
        if (!results.every((r) => r.ok)) {
          throw new Error("Erro ao atualizar status dos acompanhantes");
        }
      }

      toast({
        title: "Sucesso",
        description: `Status atualizado para ${
          status === "CONFIRMADO_PRESENCA"
            ? "presença confirmada"
            : "ausência confirmada"
        }`,
      });

      // Força a atualização da página
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const copyPublicLink = async () => {
    try {
      const publicUrl = `${window.location.origin}/public/guests/${projectId}`;
      await navigator.clipboard.writeText(publicUrl);

      toast({
        title: "Link copiado!",
        description:
          "O link público foi copiado para sua área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const getStatusStyle = (status: Guest["status"]) => {
    switch (status) {
      case "CONFIRMADO_PRESENCA":
        return "bg-green-100 text-green-800 border-green-300";
      case "CONFIRMADO_AUSENCIA":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300 px-3 py-1 rounded-md"; // Estilo para pendentes
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Lista de Convidados</h1>
          <p className="text-muted-foreground">{projectName}</p>
        </div>
        <div className="flex items-center gap-2">
          <AddGuestDialog projectId={projectId} onSuccess={fetchGuests} />
          <GuestListMenu
            projectId={projectId}
            onImportSuccess={fetchGuests}
            onSettingsChange={setColumnVisibility}
          />
        </div>
      </div>

      {/* Legenda de cores */}
      <div className="flex gap-4 items-center p-4 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">Status:</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
            <span className="text-sm">Confirmado Presença</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
            <span className="text-sm">Confirmado Ausência</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300" />
            <span className="text-sm">Pendente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              {columnVisibility.phone && <TableHead>Telefone</TableHead>}
              {columnVisibility.companions && (
                <TableHead>Acompanhantes</TableHead>
              )}
              {columnVisibility.messageStatus && (
                <TableHead>Status da Mensagem</TableHead>
              )}
              {columnVisibility.observations && (
                <TableHead>Observações</TableHead>
              )}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    2 + Object.values(columnVisibility).filter(Boolean).length
                  }
                  className="text-center"
                >
                  Nenhum convidado cadastrado
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
                <TableRow
                  key={guest.id}
                  className={
                    guest.status !== "PENDENTE"
                      ? getStatusStyle(guest.status)
                      : ""
                  }
                >
                  <TableCell className="font-medium">
                    <span
                      className={
                        guest.status === "PENDENTE"
                          ? getStatusStyle(guest.status)
                          : ""
                      }
                    >
                      {guest.name}
                    </span>
                  </TableCell>
                  {columnVisibility.phone && (
                    <TableCell>{guest.phone}</TableCell>
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
                              <span
                                key={companion.id}
                                className={getStatusStyle(companion.status)}
                              >
                                {companion.name}
                              </span>
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
                  {columnVisibility.observations && (
                    <TableCell>
                      {guest.observations || (
                        <span className="text-muted-foreground text-sm">
                          Sem observações
                        </span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-emerald-50 hover:cursor-pointer border-emerald-500 text-emerald-500 hover:text-emerald-600 hover:border-emerald-600"
                      onClick={async () => {
                        await updateAllStatus(guest.id, "CONFIRMADO_PRESENCA");
                        await fetchGuests(); // Força atualização após a mudança
                      }}
                    >
                      Confirmar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-yellow-50 hover:cursor-pointer border-yellow-500 text-yellow-500 hover:text-yellow-600 hover:border-yellow-600"
                      onClick={async () => {
                        await updateAllStatus(guest.id, "CONFIRMADO_AUSENCIA");
                        await fetchGuests(); // Força atualização após a mudança
                      }}
                    >
                      Todos Ausentes
                    </Button>
                    <EditGuestDialog
                      projectId={projectId}
                      guest={guest}
                      onSuccess={fetchGuests}
                    />
                    <DeleteGuestDialog
                      projectId={projectId}
                      guest={guest}
                      onSuccess={fetchGuests}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {guests.length > 0 && (
        <div className="flex justify-end mt-6">
          <Link href={`/dashboard/projects/${projectId}/whatsapp`}>
            <Button className="flex items-center gap-2" variant="secondary">
              <MessageSquare className="h-4 w-4" />
              Disparar Mensagens WhatsApp
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
