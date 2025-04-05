"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Button } from "@/app/_components/ui/button";
import { MoreVertical, Link2, Settings, Upload } from "lucide-react";
import { GuestListSettings, ColumnVisibility } from "./GuestListSettings";
import ImportGuestsDialog from "./ImportGuestsDialog";
import { useToast } from "@/app/_hooks/use-toast";

interface GuestListMenuProps {
  projectId: string;
  onImportSuccess: () => void;
  onSettingsChange: (settings: ColumnVisibility) => void;
}

export function GuestListMenu({
  projectId,
  onImportSuccess,
  onSettingsChange,
}: GuestListMenuProps) {
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copyPublicLink}>
            <Link2 className="h-4 w-4 mr-2" />
            Link Público
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Convidados
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GuestListSettings
        projectId={projectId}
        onSettingsChange={onSettingsChange}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <ImportGuestsDialog
        projectId={projectId}
        onSuccess={onImportSuccess}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </>
  );
}
