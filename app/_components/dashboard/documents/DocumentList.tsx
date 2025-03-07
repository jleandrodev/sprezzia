import { useCallback, useState, useEffect } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { useDocuments } from "@/app/_hooks/use-documents";
import { useToast } from "@/app/_hooks/use-toast";
import { Loader2, Trash2, Plus, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { formatBytes, formatDate, cn } from "@/app/lib/utils";

interface DocumentListProps {
  projectId: string;
}

function truncateFilename(filename: string, maxLength: number = 30): string {
  if (filename.length <= maxLength) return filename;
  const extension = filename.split('.').pop() || '';
  const name = filename.slice(0, -(extension.length + 1));
  const truncatedName = name.slice(0, maxLength - 3 - extension.length) + '...';
  return `${truncatedName}.${extension}`;
}

export function DocumentList({ projectId }: DocumentListProps) {
  const { documents, isLoading, uploadDocument, deleteDocument, fetchDocuments } = useDocuments(projectId);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File;

    if (!file) {
      toast({
        title: "Erro ao fazer upload",
        description: "Selecione um arquivo para fazer upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Converter arquivo para base64
      const buffer = await file.arrayBuffer();
      const base64Content = Buffer.from(buffer).toString('base64');

      // Criar objeto com os dados do documento
      const documentData = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: base64Content,
        description: formData.get("description") as string || undefined
      };

      const success = await uploadDocument(documentData);
      if (success) {
        toast({
          title: "Upload realizado com sucesso",
          description: "O documento foi salvo com sucesso",
        });
        form.reset();
        setIsUploadModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Ocorreu um erro ao fazer o upload do arquivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadDocument, toast]);

  const handleDownload = useCallback((documentId: string) => {
    const url = `/api/projects/${projectId}/documents/download?documentId=${documentId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [projectId]);

  const handleDelete = useCallback(async (documentId: string) => {
    try {
      setIsDeleting(documentId);
      await deleteDocument(documentId);
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o documento",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  }, [deleteDocument, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
              <DialogDescription>
                Selecione um arquivo e adicione uma descrição opcional.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  disabled={isUploading}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva o documento..."
                  disabled={isUploading}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? "Enviando..." : "Enviar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum documento encontrado
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 space-y-2 sm:space-y-0"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h3 className="font-medium break-words line-clamp-2">
                            {truncateFilename(document.name)}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{document.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {document.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {document.description}
                    </p>
                  )}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(document.size)}</span>
                    <span>•</span>
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleDownload(document.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1 sm:flex-none"
                        disabled={isDeleting === document.id}
                      >
                        {isDeleting === document.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir documento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o documento "{document.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(document.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting === document.id}
                        >
                          {isDeleting === document.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Excluindo...
                            </>
                          ) : (
                            'Excluir'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
