import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface TimecardData {
    employeeName: string;
    period: string; // "1" (1-15) or "2" (16-31)
    year: string;
    entries: {
        day: number;
        morningIn: string;
        morningOut: string;
        afternoonIn: string;
        afternoonOut: string;
    }[];
}

export const processTimecardImage = async (file: File): Promise<TimecardData> => {
    if (!API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY não configurada. Adicione sua chave no .env.local");
    }

    // Convert File to Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
    });

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
  Analise esta imagem de cartão de ponto (comum no Brasil).
  Extraia os dados estruturados em JSON.
  
  Campos necessários:
  - employeeName: Nome manuscrito no topo (ex: "Nader", "Donizette").
  - period: "1" se for dias 01-15, "2" se for dias 16-31 (Veja o cabeçalho "1ª QUINZENA" ou "2ª QUINZENA").
  - year: Ano se houver (senão null).
  - entries: Array com os registros de cada dia visível.
    - day: O número do dia (16, 17, ... até 31).
    - morningIn: Horário da 1ª coluna (Manhã Entrada).
    - morningOut: Horário da 2ª coluna (Manhã Saída).
    - afternoonIn: Horário da 3ª coluna (Tarde Entrada).
    - afternoonOut: Horário da 4ª coluna (Tarde Saída).

  Regras:
  - Se o campo estiver vazio, retorne null.
  - Formato de horas: "HH:MM".
  - Ignore assinaturas ou rabiscos irrelevantes.
  - A imagem pode estar rotacionada ou ter baixa qualidade, tente inferir.
  
  Retorne APENAS o JSON válido.
  `;

    const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: file.type } },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean markdown code blocks if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(jsonString) as TimecardData;
    } catch (e) {
        console.error("Erro ao parsear resposta da IA:", text);
        throw new Error("Falha ao ler os dados da imagem. Tente uma foto mais clara.");
    }
};
