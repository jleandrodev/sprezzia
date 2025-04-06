import { useState, useCallback } from "react";
import { useToast } from "@/app/_hooks/use-toast";

export interface Companion {
  id: string;
  name: string;
  status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
}

export interface Guest {
  id: string;
  name: string;
  phone: string | null;
  status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
  messageStatus: "NAO_ENVIADA" | "ENVIADA" | "ERRO";
  companions: Companion[];
  children_0_6: number;
  children_7_10: number;
  observations?: string;
}

// Cache para armazenar os dados dos convidados por projeto
const guestsCache: { [projectId: string]: Guest[] } = {};
const lastFetch: { [projectId: string]: number } = {};
const CACHE_DURATION = 30000; // 30 segundos

export function useGuests(projectId: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchGuests = useCallback(
    async (force: boolean = false) => {
      try {
        const now = Date.now();
        // Verifica se temos dados em cache e se ainda são válidos
        if (
          !force &&
          guestsCache[projectId] &&
          lastFetch[projectId] &&
          now - lastFetch[projectId] < CACHE_DURATION
        ) {
          setGuests(guestsCache[projectId]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/guests`);
        if (!response.ok) throw new Error("Erro ao buscar convidados");
        const data = await response.json();

        // Atualiza o cache
        guestsCache[projectId] = data.guests;
        lastFetch[projectId] = now;

        setGuests(data.guests);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de convidados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, toast]
  );

  return {
    guests,
    isLoading,
    refreshGuests: () => fetchGuests(true), // Força uma nova busca
    fetchGuests,
  };
}
