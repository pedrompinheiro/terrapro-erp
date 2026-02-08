
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFleetEfficiency = async (data: any) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise os seguintes dados de frota de terraplanagem e forneça 3 insights rápidos e recomendações estratégicas: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: "Você é um especialista sênior em logística de frotas pesadas e terraplanagem. Seja conciso e técnico.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Não foi possível gerar a análise no momento.";
  }
};
