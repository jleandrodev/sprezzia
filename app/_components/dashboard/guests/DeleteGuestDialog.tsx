"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/app/_hooks/use-toast";
import { useState } from "react";

interface DeleteGuestDialogProps {
  projectId: string;
  guest: {
    id: string;
    name: string;
    companions: Array<{
      id: string;
      name: string;
    }>;
  };
  onSuccess?: () => void;
}

export default function DeleteGuestDialog({
  projectId,
  guest,
  onSuccess,
}: DeleteGuestDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/guests`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guestId: guest.id }),
      });

      if (!response.ok) throw new Error("Erro ao excluir convidado");

      toast({
        title: "Sucesso",
        description: "Convidado excluído com sucesso!",
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o convidado.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Convidado</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o convidado {guest.name}
            {guest.companions.length > 0 &&
              ` e seus ${guest.companions.length} acompanhante(s)`}
            ? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
