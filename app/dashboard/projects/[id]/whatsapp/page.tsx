"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Textarea } from "@/app/_components/ui/textarea";
import { Button } from "@/app/_components/ui/button";
import { useProject } from "@/app/_contexts/ProjectContext";
import { useToast } from "@/app/_hooks/use-toast";
import { useParams } from "next/navigation";
import { Loader2, Send, AlertTriangle } from "lucide-react";
import { EvolutionApiService } from "@/app/services/evolution-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { WhatsAppConnection } from "@/app/_components/dashboard/whatsapp/WhatsAppConnection";

interface MessageTemplate {
  introduction: string;
  conclusion: string;
}

interface Guest {
  name: string;
  phone: string;
  companions: { name: string }[];
}

interface WhatsAppPageProps {
  params: {
    id: string;
  };
}

export default function WhatsAppPage({ params }: WhatsAppPageProps) {
  const { projectName } = useProject();
  const { toast } = useToast();
  const [template, setTemplate] = useState<MessageTemplate>({
    introduction: "",
    conclusion: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [guestsCount, setGuestsCount] = useState(0);
  const [simpleMessage, setSimpleMessage] = useState("");
  const [isSimpleMessageSending, setIsSimpleMessageSending] = useState(false);
  const [showSimpleMessageConfirmDialog, setShowSimpleMessageConfirmDialog] =
    useState(false);
  const [targetAudience, setTargetAudience] = useState<"all" | "pending">(
    "all"
  );
  const [pendingGuestsCount, setPendingGuestsCount] = useState(0);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `/api/projects/${params.id}/whatsapp/config`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar configuração");
        }

        const data = await response.json();
        console.log("Dados carregados:", data); // Debug

        if (data && typeof data === "object") {
          setTemplate({
            introduction: data.introduction || "",
            conclusion: data.conclusion || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a configuração salva",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchConfig();
    }
  }, [params.id, toast]);

  // Exemplo de convidado para preview
  const previewGuest = {
    name: "João Silva",
    companions: [{ name: "Maria Silva" }, { name: "Pedro Silva" }],
  };

  const generatePreview = () => {
    const guestList = [
      previewGuest.name,
      ...previewGuest.companions.map((c) => c.name),
    ];

    return `${template.introduction}\n\n${guestList.join("\n")}\n\n${template.conclusion}`;
  };

  const handleSave = async () => {
    if (!template.introduction || !template.conclusion) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do template",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/projects/${params.id}/whatsapp/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar template");
      }

      toast({
        title: "Sucesso",
        description: "Template salvo com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmSend = async () => {
    setShowConfirmDialog(false);
    await handleSendMessages();
  };

  const handleSendClick = async () => {
    if (!template.introduction || !template.conclusion) {
      toast({
        title: "Erro",
        description: "Configure o template da mensagem antes de enviar",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/whatsapp/send`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Erro ao buscar convidados");

      const { guestsCount, pendingGuestsCount } = await response.json();
      setGuestsCount(guestsCount);
      setPendingGuestsCount(pendingGuestsCount);
      setTargetAudience("all");
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Erro ao buscar convidados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de convidados",
        variant: "destructive",
      });
    }
  };

  const handleSendMessages = async () => {
    setIsSending(true);

    try {
      const response = await fetch(`/api/projects/${params.id}/whatsapp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: {
            introduction: template.introduction,
            conclusion: template.conclusion,
          },
          targetAudience,
        }),
      });

      if (!response.ok) throw new Error("Erro ao enviar mensagens");

      const { summary } = await response.json();

      toast({
        title: "Envio concluído",
        description: `✅ ${summary.successful} enviadas\n❌ ${summary.failed} falhas\n⚠️ ${summary.skipped} sem telefone`,
      });
    } catch (error) {
      console.error("Erro ao enviar mensagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      setShowConfirmDialog(false);
    }
  };

  const handleSimpleMessageSendClick = async () => {
    if (!simpleMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/whatsapp/send`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Erro ao buscar convidados");

      const { guestsCount, pendingGuestsCount } = await response.json();
      setGuestsCount(guestsCount);
      setPendingGuestsCount(pendingGuestsCount);
      setTargetAudience("all");
      setShowSimpleMessageConfirmDialog(true);
    } catch (error) {
      console.error("Erro ao buscar convidados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de convidados",
        variant: "destructive",
      });
    }
  };

  const handleSimpleMessageConfirmSend = async () => {
    setShowSimpleMessageConfirmDialog(false);
    setIsSimpleMessageSending(true);

    try {
      const response = await fetch(`/api/projects/${params.id}/whatsapp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simpleMessage,
          targetAudience,
        }),
      });

      if (!response.ok) throw new Error("Erro ao enviar mensagens");

      const { summary } = await response.json();

      toast({
        title: "Envio concluído",
        description: `✅ ${summary.successful} enviadas\n❌ ${summary.failed} falhas\n⚠️ ${summary.skipped} sem telefone`,
      });
    } catch (error) {
      console.error("Erro ao enviar mensagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsSimpleMessageSending(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">WhatsApp</h1>
            <p className="text-muted-foreground">
              Envie mensagens para seus convidados
            </p>
          </div>
          <WhatsAppConnection projectId={params.id} />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Confirmação de Presença */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Confirmação de Presença</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuração */}
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Introdução
                          <span className="text-muted-foreground ml-2 text-sm font-normal">
                            (será exibida antes da lista de nomes)
                          </span>
                        </label>
                        <Textarea
                          value={template.introduction}
                          onChange={(e) =>
                            setTemplate((prev) => ({
                              ...prev,
                              introduction: e.target.value,
                            }))
                          }
                          placeholder="Ex: Olá! Confirmamos sua presença e de seus acompanhantes para nosso evento:"
                          className="min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Conclusão
                          <span className="text-muted-foreground ml-2 text-sm font-normal">
                            (será exibida após a lista de nomes)
                          </span>
                        </label>
                        <Textarea
                          value={template.conclusion}
                          onChange={(e) =>
                            setTemplate((prev) => ({
                              ...prev,
                              conclusion: e.target.value,
                            }))
                          }
                          placeholder="Será um prazer tê-los conosco nesse dia tão especial!"
                          className="min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="flex justify-start">
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            "Salvar Template"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Preview da Mensagem
                    </h3>
                    <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap min-h-[300px] text-sm">
                      {generatePreview()}
                    </div>
                  </div>

                  <Button
                    variant="default"
                    size="lg"
                    className="gap-2 w-full"
                    onClick={handleSendClick}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSending ? "Enviando..." : "Enviar Mensagens"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem Simples */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Mensagem Simples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuração */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mensagem
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                      (será enviada para todos os convidados)
                    </span>
                  </label>
                  <Textarea
                    value={simpleMessage}
                    onChange={(e) => setSimpleMessage(e.target.value)}
                    placeholder="Digite aqui a mensagem que será enviada para todos os convidados..."
                    className="min-h-[300px]"
                  />
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Preview da Mensagem
                    </h3>
                    <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap min-h-[300px] text-sm">
                      {simpleMessage}
                    </div>
                  </div>

                  <Button
                    variant="default"
                    size="lg"
                    className="gap-2 w-full"
                    onClick={handleSimpleMessageSendClick}
                    disabled={isSimpleMessageSending}
                  >
                    {isSimpleMessageSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSimpleMessageSending
                      ? "Enviando..."
                      : "Enviar Mensagens"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
