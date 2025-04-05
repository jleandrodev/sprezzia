import { NextResponse } from "next/server";

interface SendMessageParams {
  phone: string;
  message: string;
}

export class EvolutionApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL || "";
    this.apiKey = process.env.EVOLUTION_API_KEY || "";
  }

  // Busca o status da instância
  async getInstance(instanceName: string) {
    const response = await fetch(
      `${this.baseUrl}/instance/connectionState/${instanceName}`,
      {
        headers: {
          apikey: this.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar status da instância");
    }

    const data = await response.json();
    return {
      instanceName,
      status: data.state,
      phone: data.phone,
    };
  }

  // Cria uma nova instância
  async createInstance(instanceName: string) {
    // Primeiro, cria a instância
    const createResponse = await fetch(`${this.baseUrl}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this.apiKey,
      },
      body: JSON.stringify({
        instanceName,
        webhook: null,
        events: false,
      }),
    });

    if (!createResponse.ok) {
      throw new Error("Falha ao criar instância");
    }

    // Depois, conecta a instância
    const connectResponse = await fetch(
      `${this.baseUrl}/instance/connect/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: this.apiKey,
        },
      }
    );

    if (!connectResponse.ok) {
      throw new Error("Falha ao conectar instância");
    }

    const data = await connectResponse.json();
    return {
      instanceName,
      qrcode: data.qrcode,
    };
  }

  // Atualiza uma instância existente
  async updateInstance(instanceName: string) {
    // Primeiro, desconecta a instância atual
    await fetch(`${this.baseUrl}/instance/logout/${instanceName}`, {
      method: "POST",
      headers: {
        apikey: this.apiKey,
      },
    });

    // Depois, reconecta para gerar um novo QR code
    const connectResponse = await fetch(
      `${this.baseUrl}/instance/connect/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: this.apiKey,
        },
      }
    );

    if (!connectResponse.ok) {
      throw new Error("Falha ao atualizar instância");
    }

    const data = await connectResponse.json();
    return {
      instanceName,
      qrcode: data.qrcode,
    };
  }

  // Envia uma mensagem
  async sendMessage(params: { phone: string; message: string }) {
    const response = await fetch(`${this.baseUrl}/message/sendText/sprezzia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this.apiKey,
      },
      body: JSON.stringify({
        number: params.phone,
        textMessage: params.message,
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar mensagem");
    }

    return response.json();
  }
}
