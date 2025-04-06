"use client";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { useToast } from "@/app/_hooks/use-toast";
import { EvolutionApiService } from "@/app/services/evolution-api";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  const [showQrInDialog, setShowQrInDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();

  const service = useMemo(() => new EvolutionApiService(), []);

  const checkInstance = useCallback(async () => {
    try {
      const instance = await service.getInstance();
      if (instance) {
        setInstanceState(instance.state);
      }
    } catch (error) {
      console.error("Erro ao verificar instância:", error);
      toast({
        variant: "destructive",
        title: "Erro ao verificar conexão",
        description: "Não foi possível verificar o estado da conexão",
      });
    }
  }, [service, toast]);

  // Verifica o status inicial
  useEffect(() => {
    checkInstance();
  }, [checkInstance]);

  // Polling apenas durante o escaneamento do QR code
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (instanceState === "CONNECTING" && showQrInDialog) {
      intervalId = setInterval(async () => {
        const instance = await service.getInstance();
        if (instance?.state === "CONNECTED") {
          setInstanceState("CONNECTED");
          setShowQrInDialog(false);
          setShowNumberDialog(false);
          toast({
            title: "WhatsApp Conectado",
            description: "Seu WhatsApp foi conectado com sucesso!",
          });
          clearInterval(intervalId);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [instanceState, showQrInDialog, service, toast]);

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

      // 1. Faz logout da instância atual
      console.log("[WhatsAppConnection] Fazendo logout da instância...");
      try {
        await service.logout();
        console.log("[WhatsAppConnection] Logout realizado com sucesso");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(
          "[WhatsAppConnection] Erro ao fazer logout, continuando...",
          error
        );
      }

      // 2. Deleta a instância atual
      console.log("[WhatsAppConnection] Deletando instância...");
      try {
        await service.deleteInstance();
        console.log("[WhatsAppConnection] Instância deletada com sucesso");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(
          "[WhatsAppConnection] Erro ao deletar instância, continuando...",
          error
        );
      }

      // 3. Cria nova instância
      console.log("[WhatsAppConnection] Criando nova instância...");
      const instance = await service.createInstance({
        number: phoneNumber,
      });

      // 4. Mostra QR code para conexão
      if (instance.qrcode) {
        console.log("[WhatsAppConnection] QR Code recebido");
        setQrCode(instance.qrcode);
        setInstanceState("CONNECTING");
        setShowQrInDialog(true);

        toast({
          title: "Atualizando WhatsApp",
          description: "Escaneie o QR Code para conectar o novo número",
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
      console.error("[WhatsAppConnection] Erro ao atualizar número:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o número do WhatsApp",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisconnect() {
    try {
      setIsLoading(true);

      // 1. Faz logout da instância
      console.log("[WhatsAppConnection] Fazendo logout da instância...");
      try {
        await service.logout();
        console.log("[WhatsAppConnection] Logout realizado com sucesso");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.log("[WhatsAppConnection] Erro ao fazer logout", error);
      }

      // 2. Deleta a instância
      console.log("[WhatsAppConnection] Deletando instância...");
      try {
        await service.deleteInstance();
        console.log("[WhatsAppConnection] Instância deletada com sucesso");
      } catch (error) {
        console.log("[WhatsAppConnection] Erro ao deletar instância", error);
      }

      // 3. Atualiza o estado
      setInstanceState("DISCONNECTED");
      toast({
        title: "WhatsApp Desconectado",
        description: "Seu WhatsApp foi desconectado com sucesso!",
      });
    } catch (error) {
      console.error("[WhatsAppConnection] Erro ao desconectar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar o WhatsApp",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect() {
    setShowNumberDialog(true);
    setShowQrInDialog(false);
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
              variant={instanceState === "CONNECTED" ? "default" : "outline"}
              className="gap-2"
            >
              <MessageSquare
                className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading
                ? "Processando..."
                : instanceState === "CONNECTED"
                  ? "Atualizar Número"
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
