"use client";

import { useState, useCallback } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { useToast } from "@/app/_hooks/use-toast";
import { Check, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface BulkActionsDialogProps {
  projectId: string;
  guestId: string;
  action: "confirm" | "absent";
  onSuccess: () => void;
}

export function BulkActionsDialog({
  projectId,
  guestId,
  action,
  onSuccess,
}: BulkActionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/projects/${projectId}/guests/${guestId}/bulk-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar status");
      }

      toast({
        title: "Sucesso",
        description:
          action === "confirm"
            ? "Todos os status foram atualizados para Confirmado Presença"
            : "Todos os status foram atualizados para Confirmado Ausência",
      });

      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar os status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, guestId, action, onSuccess, toast]);

  return (
    <>
      <Button
        variant={action === "confirm" ? "default" : "destructive"}
        size="sm"
        className="ml-2"
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        {action === "confirm" ? (
          <Check className="h-4 w-4 mr-1" />
        ) : (
          <X className="h-4 w-4 mr-1" />
        )}
        {action === "confirm" ? "Confirmar Todos" : "Todos Ausentes"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "confirm"
                ? "Confirmar Presença de Todos"
                : "Marcar Todos como Ausentes"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "confirm"
                ? "Isso irá marcar o convidado e todos os seus acompanhantes como Confirmado Presença. Deseja continuar?"
                : "Isso irá marcar o convidado e todos os seus acompanhantes como Confirmado Ausência. Deseja continuar?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isLoading}
              className={cn(
                action === "confirm" ? "" : "bg-destructive hover:bg-destructive/90",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? "Atualizando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
