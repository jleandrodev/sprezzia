import { NextResponse } from "next/server";

interface SendMessageParams {
  phone: string;
  message: string;
}

export class EvolutionApiService {
  private baseUrl: string;
  private instanceName: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL || "";
    this.instanceName = "Sprezzia";
    this.apiKey = process.env.EVOLUTION_API_KEY || "";
  }

  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, "");

    // Se o número já começar com 55, usa como está
    if (numbers.startsWith("55") && numbers.length >= 12) {
      return numbers;
    }

    // Se tiver 11 dígitos (DDD + número), adiciona o DDI
    if (numbers.length === 11) {
      return `55${numbers}`;
    }

    // Se tiver 10 dígitos (DDD + número sem o 9), adiciona o 9 e o DDI
    if (numbers.length === 10) {
      return `55${numbers.slice(0, 2)}9${numbers.slice(2)}`;
    }

    // Se não se encaixar em nenhum padrão, retorna como está
    return numbers;
  }

  private async createInstance() {
    try {
      const response = await fetch(`${this.baseUrl}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          instanceName: this.instanceName,
          qrcode: true,
          number: "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao criar instância: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      throw error;
    }
  }

  private async checkConnection() {
    try {
      const response = await fetch(
        `${this.baseUrl}/instance/connectionState/${this.instanceName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao verificar conexão: ${JSON.stringify(error)}`);
      }

      const state = await response.json();

      // Se não estiver conectado, tenta reconectar
      if (state.state !== "open") {
        await fetch(`${this.baseUrl}/instance/connect/${this.instanceName}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
        });
      }

      return state;
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      throw error;
    }
  }

  private async checkPhoneExists(phone: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const response = await fetch(
        `${this.baseUrl}/chat/whatsappNumbers/${this.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
          body: JSON.stringify({
            numbers: [formattedPhone],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao verificar número: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      return result.some((item: any) => item.exists);
    } catch (error) {
      console.error("Erro ao verificar número:", error);
      throw error;
    }
  }

  async sendMessage({ phone, message }: SendMessageParams) {
    try {
      // Verifica a conexão antes de enviar
      await this.checkConnection();

      // Formata o número para o padrão correto
      const formattedPhone = this.formatPhoneNumber(phone);

      // Verifica se o número existe no WhatsApp
      const phoneExists = await this.checkPhoneExists(formattedPhone);
      if (!phoneExists) {
        throw new Error(`Número ${phone} não está cadastrado no WhatsApp`);
      }

      // Envia a mensagem
      const response = await fetch(
        `${this.baseUrl}/message/sendText/${this.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: message,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao enviar mensagem: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw error;
    }
  }
}
