import { GoogleGenerativeAI } from "@google/generative-ai";

const getAI = () => new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const analyzeFleetEfficiency = async (data: any) => {
  const ai = getAI();
  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: "Você é um especialista sênior em logística de frotas pesadas e terraplanagem. Seja conciso e técnico."
    });

    const result = await model.generateContent(`Analise os seguintes dados de frota de terraplanagem e forneça 3 insights rápidos e recomendações estratégicas: ${JSON.stringify(data)}`);
    return result.response.text();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Não foi possível gerar a análise no momento.";
  }
};
