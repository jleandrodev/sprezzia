"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Textarea } from "@/app/_components/ui/textarea";
import { Button } from "@/app/_components/ui/button";
import { useToast } from "@/app/_hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Loader2, Send } from "lucide-react";

interface WhatsAppPageProps {
  params: {
    id: string;
  };
}

interface Guest {
  name: string;
  phone?: string;
  companions: { name: string }[];
}

export default function WhatsAppPage({ params }: WhatsAppPageProps) {
  const { toast } = useToast();
  const [introduction, setIntroduction] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewGuest, setPreviewGuest] = useState<Guest>({
    name: "João Silva",
    companions: [{ name: "Maria Silva" }, { name: "Pedro Silva" }],
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(
          `/api/projects/${params.id}/whatsapp/config`
        );
        if (!response.ok) throw new Error("Erro ao carregar configuração");

        const { config } = await response.json();
        if (config) {
          setIntroduction(config.introduction || "");
          setConclusion(config.conclusion || "");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar a configuração.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [params.id, toast]);

  const generatePreview = (guest: Guest) => {
    const guestList = [guest.name, ...guest.companions.map((c) => c.name)];
    return `${introduction}\n\n${guestList.join("\n")}\n\n${conclusion}`;
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/whatsapp/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            introduction,
            conclusion,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar configuração");

      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessages = async () => {
    setSending(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/whatsapp/send`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erro ao enviar mensagens");

      const { results } = await response.json();

      const successful = results.filter(
        (r: any) => r.status === "success"
      ).length;
      const failed = results.filter((r: any) => r.status === "error").length;

      toast({
        title: "Envio concluído",
        description: `${successful} mensagens enviadas com sucesso. ${failed} falhas.`,
        variant: successful > 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar as mensagens.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Configuração da Mensagem */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Configuração da Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Introdução</label>
                <Textarea
                  placeholder="Digite a introdução da mensagem..."
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Esta mensagem aparecerá antes da lista de nomes
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Conclusão</label>
                <Textarea
                  placeholder="Digite a conclusão da mensagem..."
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Esta mensagem aparecerá depois da lista de nomes
                </p>
              </div>

              <Button onClick={handleSave}>Salvar Configuração</Button>
            </CardContent>
          </Card>

          {/* Preview da Mensagem */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Preview da Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                {generatePreview(previewGuest)}
              </div>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={sending}
                className="w-full bg-[#55B02E] hover:bg-[#55B02E]/90"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar envio</DialogTitle>
            <DialogDescription>
              Você está prestes a enviar mensagens para todos os convidados que
              possuem número de telefone cadastrado. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendMessages}
              disabled={sending}
              className="bg-[#55B02E] hover:bg-[#55B02E]/90"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
