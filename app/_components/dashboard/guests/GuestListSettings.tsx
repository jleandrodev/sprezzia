"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Settings } from "lucide-react";
import { Switch } from "@/app/_components/ui/switch";
import { Label } from "@/app/_components/ui/label";

interface GuestListSettingsProps {
  projectId: string;
  onSettingsChange: (settings: ColumnVisibility) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ColumnVisibility {
  phone: boolean;
  companions: boolean;
  messageStatus: boolean;
  observations: boolean;
}

const defaultVisibility: ColumnVisibility = {
  phone: true,
  companions: true,
  messageStatus: true,
  observations: true,
};

export function GuestListSettings({
  projectId,
  onSettingsChange,
  open,
  onOpenChange,
}: GuestListSettingsProps) {
  const [visibility, setVisibility] =
    useState<ColumnVisibility>(defaultVisibility);
  const [tempVisibility, setTempVisibility] =
    useState<ColumnVisibility>(defaultVisibility);

  useEffect(() => {
    // Carrega as configurações salvas
    const savedSettings = localStorage.getItem(`guestList-${projectId}`);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setVisibility(settings);
      setTempVisibility(settings);
      onSettingsChange(settings);
    }
  }, [projectId, onSettingsChange]);

  useEffect(() => {
    // Reseta as configurações temporárias quando o diálogo é aberto
    if (open) {
      setTempVisibility(visibility);
    }
  }, [open, visibility]);

  const handleToggle = (column: keyof ColumnVisibility) => {
    setTempVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleSave = () => {
    localStorage.setItem(
      `guestList-${projectId}`,
      JSON.stringify(tempVisibility)
    );
    setVisibility(tempVisibility);
    onSettingsChange(tempVisibility);
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    setTempVisibility(visibility);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações da Lista</DialogTitle>
          <DialogDescription>
            Escolha quais informações deseja visualizar na tabela. Estas
            configurações são salvas apenas neste navegador.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone">Telefone</Label>
            <Switch
              id="phone"
              checked={tempVisibility.phone}
              onCheckedChange={() => handleToggle("phone")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="companions">Acompanhantes</Label>
            <Switch
              id="companions"
              checked={tempVisibility.companions}
              onCheckedChange={() => handleToggle("companions")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="messageStatus">Status da Mensagem</Label>
            <Switch
              id="messageStatus"
              checked={tempVisibility.messageStatus}
              onCheckedChange={() => handleToggle("messageStatus")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="observations">Observações</Label>
            <Switch
              id="observations"
              checked={tempVisibility.observations}
              onCheckedChange={() => handleToggle("observations")}
            />
          </div>
          <div className="text-sm text-muted-foreground mt-4">
            Nota: Estas configurações são específicas deste navegador. Se você
            usar outro navegador ou dispositivo, precisará configurar novamente.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Aplicar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
