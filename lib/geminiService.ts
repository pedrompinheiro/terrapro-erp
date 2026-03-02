import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiKey } from './getGeminiKey';

export const analyzeFleetEfficiency = async (data: any) => {
  const key = await getGeminiKey();
  const ai = new GoogleGenerativeAI(key);
  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: "Você é um especialista sênior em logística de frotas pesadas e terraplanagem. Seja conciso e técnico."
    });

    const result = await model.generateContent(`Analise os seguintes dados de frota de terraplanagem e forneça 3 insights rápidos e recomendações estratégicas: ${JSON.stringify(data)}`);
    return result.response.text();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Não foi possível gerar a análise no momento.";
  }
};
