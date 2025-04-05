"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Phone, RefreshCw } from "lucide-react";

interface WhatsAppConnectionProps {
  projectId: string;
}

interface Instance {
  state: "CONNECTED" | "DISCONNECTED";
  phoneNumber?: string;
  qrcode?: string;
}

export function WhatsAppConnection({ projectId }: WhatsAppConnectionProps) {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const fetchInstance = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/whatsapp/instance`
      );
      const data = await response.json();
      setInstance(data);
    } catch (error) {
      console.error("Error fetching instance:", error);
      setInstance(null);
    }
  };

  useEffect(() => {
    fetchInstance();
  }, [projectId]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/whatsapp/instance/create`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      setInstance(data);
      setShowQRCode(true);
    } catch (error) {
      console.error("Error connecting instance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/whatsapp/instance/update`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      setInstance(data);
      setShowQRCode(true);
    } catch (error) {
      console.error("Error updating instance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {instance?.state === "CONNECTED" ? (
        <Button
          variant="outline"
          onClick={handleUpdate}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Atualizar WhatsApp
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="default"
          onClick={handleConnect}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              Conectar WhatsApp
            </>
          )}
        </Button>
      )}

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {instance?.qrcode ? (
              <>
                <QRCodeSVG value={instance.qrcode} size={256} />
                <p className="text-sm text-muted-foreground text-center">
                  Escaneie o código QR com seu WhatsApp para conectar
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Aguarde enquanto geramos o código QR...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
