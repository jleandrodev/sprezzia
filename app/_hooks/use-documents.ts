import { useState, useCallback, useEffect } from "react";

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentData {
  name: string;
  size: number;
  type: string;
  content: string; // base64
  description?: string;
}

interface UseDocumentsReturn {
  documents: Document[];
  isLoading: boolean;
  error: Error | null;
  uploadDocument: (data: DocumentData) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<void>;
  fetchDocuments: () => Promise<void>;
}

export function useDocuments(projectId: string): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/documents`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar documentos");
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (data: DocumentData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar documento");
      }

      await fetchDocuments();
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Erro ao fazer upload:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/documents?documentId=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir documento");
      }

      // Atualiza a lista localmente removendo o documento excluído
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Erro ao excluir:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    fetchDocuments,
  };
}
