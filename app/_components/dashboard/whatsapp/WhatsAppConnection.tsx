"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { useToast } from "@/app/_hooks/use-toast";
import { EvolutionApiService } from "@/app/services/evolution-api";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";

interface WhatsAppConnectionProps {
  projectId: string;
}

export function WhatsAppConnection({ projectId }: WhatsAppConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>();
  const [instanceState, setInstanceState] = useState<string>("DISCONNECTED");
  const [showNumberDialog, setShowNumberDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showQrInDialog, setShowQrInDialog] = useState(false);
  const { toast } = useToast();

  const service = new EvolutionApiService();

  useEffect(() => {
    checkInstance();
  }, []);

  async function checkInstance() {
    try {
      const instance = await service.getInstance();
      if (instance) {
        setInstanceState(instance.state);
        setQrCode(instance.qrcode);
      }
    } catch (error) {
      console.error("Erro ao verificar instância:", error);
      toast({
        variant: "destructive",
        title: "Erro ao verificar conexão",
        description: "Não foi possível verificar o estado da conexão",
      });
    }
  }

  async function handleNumberSubmit() {
    if (!phoneNumber.match(/^\d+$/)) {
      toast({
        variant: "destructive",
        title: "Número inválido",
        description:
          "Por favor, insira apenas números sem espaços ou caracteres especiais",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Primeiro criamos a instância
      await service.createInstance({
        number: phoneNumber,
      });

      // Depois conectamos para obter o QR code
      const instance = await service.connectInstance();
      console.log("[WhatsAppConnection] Conectando instância:", instance);

      if (instance.qrcode) {
        console.log("[WhatsAppConnection] QR Code recebido");
        setQrCode(instance.qrcode);
        setInstanceState("CONNECTING");
        setShowQrInDialog(true);

        toast({
          title: "Conectando ao WhatsApp",
          description: "Escaneie o QR Code para conectar",
        });
      } else {
        console.log("[WhatsAppConnection] QR Code não recebido");
        toast({
          variant: "destructive",
          title: "Erro ao conectar",
          description: "Não foi possível gerar o QR Code",
        });
      }
    } catch (error) {
      console.error("[WhatsAppConnection] Erro ao conectar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao conectar",
        description: "Não foi possível iniciar a conexão",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect() {
    if (instanceState !== "CONNECTED") {
      setShowNumberDialog(true);
      setShowQrInDialog(false);
      return;
    }

    // Se já está conectado, tenta reconectar
    try {
      setIsLoading(true);
      const instance = await service.connectInstance();

      if (instance.qrcode) {
        setQrCode(instance.qrcode);
        setInstanceState("CONNECTING");
        setShowQrInDialog(true);

        toast({
          title: "Reconectando ao WhatsApp",
          description: "Escaneie o QR Code para reconectar",
        });
      }
    } catch (error) {
      console.error("[WhatsAppConnection] Erro ao reconectar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao reconectar",
        description: "Não foi possível reconectar ao WhatsApp",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCloseDialog() {
    setShowNumberDialog(false);
    setShowQrInDialog(false);
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  instanceState === "CONNECTED"
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {instanceState === "CONNECTED"
                  ? "Conectado"
                  : instanceState === "CONNECTING"
                    ? "Aguardando conexão"
                    : "Desconectado"}
              </span>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isLoading || instanceState === "CONNECTING"}
              className={`gap-2 ${
                instanceState === "CONNECTED"
                  ? "bg-green-500 hover:bg-green-600"
                  : ""
              }`}
            >
              <MessageSquare
                className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading
                ? "Conectando..."
                : instanceState === "CONNECTED"
                  ? "Reconectar"
                  : instanceState === "CONNECTING"
                    ? "Aguardando..."
                    : "Conectar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNumberDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              {!showQrInDialog
                ? "Digite o número do seu WhatsApp para conectar. Use apenas números, sem espaços ou caracteres especiais."
                : "Escaneie o QR Code abaixo com seu WhatsApp"}
            </DialogDescription>
          </DialogHeader>

          {!showQrInDialog ? (
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  type="tel"
                  placeholder="Ex: 5511999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                onClick={handleNumberSubmit}
                disabled={isLoading || !phoneNumber}
              >
                Conectar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {qrCode && (
                <div className="rounded-xl bg-white p-4">
                  <QRCodeSVG value={qrCode} size={256} />
                </div>
              )}
              <Button variant="outline" onClick={handleCloseDialog}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
