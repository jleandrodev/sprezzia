"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { useToast } from "@/app/_hooks/use-toast";
import {
  Upload,
  FileIcon,
  Image,
  FileText,
  Eye,
  Download,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";

interface Document {
  id: string;
  name: string;
  description: string | null;
  type: string;
  size: number;
  url: string;
  createdAt: string;
}

interface DocumentListProps {
  projectId: string;
}

export default function DocumentList({ projectId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`);
      if (!response.ok) throw new Error("Erro ao buscar documentos");
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", selectedFile.name);
    formData.append("description", description);

    try {
      setIsUploading(true);
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao fazer upload do documento");

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription("");
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Erro ao excluir documento");

      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!",
      });

      fetchDocuments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o documento.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-6 w-6" />;
    if (type === "application/pdf") return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload de Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Documento</DialogTitle>
              <DialogDescription>
                Selecione um arquivo para fazer upload. Formatos aceitos: PDF,
                DOC, DOCX, JPG, PNG.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <Textarea
                placeholder="Descrição do documento (opcional)"
                className="resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Enviar Documento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(doc.type)}
                  <div>
                    <CardTitle className="text-base">{doc.name}</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(doc.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatFileSize(doc.size)}</span>
                <div className="flex items-center gap-2">
                  {doc.type.startsWith("image/") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewUrl(doc.url)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={doc.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {documents.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum documento encontrado. Faça upload do seu primeiro documento!
          </div>
        )}
      </div>

      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Visualização do Documento</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
