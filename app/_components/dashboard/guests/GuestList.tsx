"use client";

import { useState, useEffect } from "react";
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
import { Edit, Trash } from "lucide-react";
import { useToast } from "@/app/_hooks/use-toast";

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  type: "CHILD_0_6" | "CHILD_7_10" | "TEEN_11_17" | "ADULT";
  companions: number;
  status: string;
  companionsList: Array<{
    id: string;
    name: string;
    type: "CHILD_0_6" | "CHILD_7_10" | "TEEN_11_17" | "ADULT";
  }>;
}

interface GuestListProps {
  projectId: string;
}

export default function GuestList({ projectId }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const { toast } = useToast();

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/guests`);
      if (!response.ok) throw new Error("Erro ao buscar convidados");
      const data = await response.json();
      setGuests(data.guests);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de convidados.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Acompanhantes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum convidado cadastrado
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell>
                    {guest.companions > 0 ? (
                      <div className="space-y-1">
                        <div>{guest.companions} acompanhante(s)</div>
                        <div className="text-sm text-muted-foreground">
                          {guest.companionsList.map((companion) => (
                            <div key={companion.id}>{companion.name}</div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      "Sem acompanhantes"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        guest.status === "CONFIRMADO_PRESENCA"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {guest.status === "CONFIRMADO_PRESENCA"
                        ? "Confirmado"
                        : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
