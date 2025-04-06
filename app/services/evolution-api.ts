import { NextResponse } from "next/server";

interface SendMessageParams {
  phoneNumber: string;
  message: string;
}

interface Instance {
  state: string;
  phoneNumber?: string;
  qrcode?: string;
}

interface InstanceConfig {
  number: string;
  reject_call?: boolean;
  msg_call?: string;
  always_online?: boolean;
  read_messages?: boolean;
}

export class EvolutionApiService {
  private apiUrl: string;
  private apiKey: string;
  private instanceName: string = "sprezzia";

  constructor() {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error("API URL e API Key são obrigatórios");
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  private async fetchApi(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.apiUrl}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      apikey: this.apiKey,
    };

    console.log("[EvolutionApiService] Request:", {
      url,
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const responseText = await response.text();
      console.log("[EvolutionApiService] Response:", {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
      });

      // Retorna uma nova resposta com o texto original
      return new Response(responseText, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      console.error("[EvolutionApiService] Erro na requisição:", error);
      throw error;
    }
  }

  async getInstance(): Promise<Instance | null> {
    try {
      console.log("[EvolutionApiService] Verificando estado da conexão...");
      const response = await this.fetchApi(
        `/instance/connectionState/${this.instanceName}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log("[EvolutionApiService] Instância não encontrada");
          return null;
        }
        const text = await response.text();
        console.error("[EvolutionApiService] Erro ao verificar estado:", {
          status: response.status,
          body: text,
        });
        return null;
      }

      const data = await response.json();
      console.log("[EvolutionApiService] Estado da conexão (raw):", data);

      // Mapeia o estado retornado pela API
      let connectionState = "DISCONNECTED";
      if (data.instance?.state === "open") {
        connectionState = "CONNECTED";
      } else if (data.instance?.state === "connecting") {
        connectionState = "CONNECTING";
      }

      console.log("[EvolutionApiService] Estado mapeado:", connectionState);

      return {
        state: connectionState,
        qrcode: data.qrcode,
      };
    } catch (error) {
      console.error("[EvolutionApiService] getInstance error:", error);
      return null;
    }
  }

  async connectInstance(): Promise<Instance> {
    try {
      console.log("[EvolutionApiService] Conectando à instância...");
      const response = await this.fetchApi(
        `/instance/connect/${this.instanceName}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("[EvolutionApiService] Erro ao conectar:", {
          status: response.status,
          body: text,
        });
        throw new Error(`Falha ao conectar: ${text}`);
      }

      const data = await response.json();
      console.log("[EvolutionApiService] Resposta da conexão:", data);

      return {
        state: "CONNECTING",
        qrcode: data.code, // Aqui usamos o code retornado pela API como QR code
      };
    } catch (error) {
      console.error("[EvolutionApiService] connectInstance error:", error);
      throw error;
    }
  }

  async createInstance(config: InstanceConfig): Promise<Instance> {
    try {
      // Verifica se já existe uma instância
      console.log("[EvolutionApiService] Verificando instância existente...");
      const existingInstance = await this.getInstance();

      if (existingInstance?.state === "CONNECTED") {
        console.log("[EvolutionApiService] Instância já está conectada");
        return existingInstance;
      }

      // Se existe uma instância, faz logout e deleta
      if (existingInstance) {
        try {
          console.log("[EvolutionApiService] Fazendo logout da instância...");
          await this.fetchApi(`/instance/logout`, {
            method: "POST",
            body: JSON.stringify({
              instanceName: this.instanceName,
            }),
          });
          console.log("[EvolutionApiService] Instance logged out");

          await new Promise((resolve) => setTimeout(resolve, 2000));

          console.log("[EvolutionApiService] Deletando instância...");
          await this.fetchApi(`/instance/delete`, {
            method: "DELETE",
            body: JSON.stringify({
              instanceName: this.instanceName,
            }),
          });
          console.log("[EvolutionApiService] Instance deleted");

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (deleteError) {
          console.error(
            "[EvolutionApiService] Error deleting instance:",
            deleteError
          );
        }
      }

      // Cria uma nova instância com configurações básicas
      console.log("[EvolutionApiService] Criando nova instância...");
      const createResponse = await this.fetchApi(`/instance/create`, {
        method: "POST",
        body: JSON.stringify({
          instanceName: this.instanceName,
          token: "",
          qrcode: true,
          number: config.number,
          integration: "WHATSAPP-BAILEYS",
          webhook: "",
          webhook_by_events: false,
          events: [],
        }),
      });

      if (!createResponse.ok) {
        const text = await createResponse.text();
        console.error("[EvolutionApiService] Erro na criação:", {
          status: createResponse.status,
          body: text,
        });
        throw new Error(`Falha ao criar instância: ${text}`);
      }

      console.log("[EvolutionApiService] Instância criada com sucesso");

      // Aguarda um momento para a instância ser criada e inicializada
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Tenta conectar à instância recém-criada
      return await this.connectInstance();
    } catch (error) {
      console.error("[EvolutionApiService] createInstance error:", error);
      throw error;
    }
  }

  async updateInstance(): Promise<Instance> {
    try {
      const response = await this.fetchApi(`/instance/connect`, {
        method: "POST",
        body: JSON.stringify({
          instanceName: this.instanceName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar instância: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        "[EvolutionApiService] Erro ao atualizar instância:",
        error
      );
      throw error;
    }
  }

  async deleteInstance(): Promise<void> {
    try {
      const response = await this.fetchApi(
        `/instance/delete/${this.instanceName}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao deletar instância: ${response.statusText}`);
      }

      console.log("[EvolutionApiService] Instância deletada com sucesso");
    } catch (error) {
      console.error("[EvolutionApiService] Erro ao deletar instância:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await this.fetchApi(
        `/instance/logout/${this.instanceName}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao fazer logout: ${response.statusText}`);
      }

      console.log("[EvolutionApiService] Logout realizado com sucesso");
    } catch (error) {
      console.error("[EvolutionApiService] Erro ao fazer logout:", error);
      throw error;
    }
  }

  async sendMessage(params: SendMessageParams): Promise<void> {
    try {
      // Formata o número do telefone
      let phoneNumber = params.phoneNumber.replace(/\D/g, "");

      // Garante que começa com 55 (Brasil)
      if (!phoneNumber.startsWith("55")) {
        phoneNumber = "55" + phoneNumber;
      }

      // Garante que tem 13 dígitos (55 + DDD + 9 + número)
      if (phoneNumber.length === 12) {
        // Adiciona o 9 para celular
        phoneNumber = phoneNumber.slice(0, 4) + "9" + phoneNumber.slice(4);
      }

      console.log("[EvolutionApiService] Enviando mensagem:", {
        phoneNumberOriginal: params.phoneNumber,
        phoneNumberFormatado: phoneNumber,
        messageLength: params.message.length,
        instanceName: this.instanceName,
      });

      const response = await this.fetchApi(
        `/message/sendText/${this.instanceName}`,
        {
          method: "POST",
          body: JSON.stringify({
            number: phoneNumber,
            text: params.message, // Corrigido: text deve estar no nível raiz do objeto
          }),
        }
      );

      const responseData = await response.text();
      console.log("[EvolutionApiService] Resposta do envio:", {
        status: response.status,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${responseData}`);
      }

      // Tenta parsear a resposta como JSON para log
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log("[EvolutionApiService] Resposta parseada:", jsonResponse);
      } catch (e) {
        console.log("[EvolutionApiService] Resposta não é JSON válido");
      }
    } catch (error) {
      console.error(
        "[EvolutionApiService] Erro detalhado ao enviar mensagem:",
        {
          error,
          params,
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }
  }
}
