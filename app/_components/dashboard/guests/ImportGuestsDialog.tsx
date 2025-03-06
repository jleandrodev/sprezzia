"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/app/_hooks/use-toast";
import { Input } from "@/app/_components/ui/input";

interface ImportGuestsDialogProps {
  projectId: string;
  onSuccess?: () => void;
}

export default function ImportGuestsDialog({
  projectId,
  onSuccess,
}: ImportGuestsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    // Cabeçalho do CSV
    const header =
      "nome,telefone,status,acompanhantes,status_acompanhantes,criancas_0_6,criancas_7_10";
    // Exemplo de linha
    const example =
      "João Silva,(11) 98765-4321,PENDENTE,Maria Silva|Pedro Silva,PENDENTE|PENDENTE,1,0";

    const csvContent = `${header}\n${example}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_importacao_convidados.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/projects/${projectId}/guests/import`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao importar convidados");
      }

      const result = await response.json();

      toast({
        title: "Sucesso",
        description: `${result.imported} convidados importados com sucesso!`,
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao importar convidados",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Convidados</DialogTitle>
          <DialogDescription>
            Faça upload de uma planilha CSV com a lista de convidados. Use o
            modelo abaixo como referência.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Formato esperado da planilha:
            </p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-mono">
                nome, telefone, status, acompanhantes, status_acompanhantes,
                criancas_0_6, criancas_7_10
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                * Acompanhantes devem ser separados por | (pipe)
                <br />
                * Status podem ser: PENDENTE, CONFIRMADO_PRESENCA,
                CONFIRMADO_AUSENCIA
                <br />* Status dos acompanhantes devem seguir a mesma ordem dos
                nomes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4" />
              Baixar Modelo
            </Button>

            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
            </div>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 animate-spin" />
              <span className="ml-2">Processando arquivo...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
