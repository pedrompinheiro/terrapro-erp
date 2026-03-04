import { generateText, getProviderLabel } from "./aiService";

export const analyzeFleetEfficiency = async (data: any) => {
  try {
    const result = await generateText(
      `Analise os seguintes dados de frota de terraplanagem e forneça 3 insights rápidos e recomendações estratégicas: ${JSON.stringify(data)}`,
      "Você é um especialista sênior em logística de frotas pesadas e terraplanagem. Seja conciso e técnico."
    );
    return result;
  } catch (error) {
    console.error(`AI Analysis Error (${await getProviderLabel()}):`, error);
    return "Não foi possível gerar a análise no momento.";
  }
};
