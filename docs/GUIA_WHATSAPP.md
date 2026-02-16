
# Guia de Integração WhatsApp - TerraPro ERP

A integração recomendada é a **Evolution API**.

## Opção 1: Evolution API (Recomendada - Gratuita/Open Source)
É a ferramenta mais robusta e profissional disponível gratuitamente.

- **Site Oficial:** [https://doc.evolution-api.com/](https://doc.evolution-api.com/)
- **Custo:** R$ 0,00 (Licença). Custo apenas de servidor (VPS) se quiser rodar na nuvem.

### Como Rodar no seu Computador (Docker)
Se você tiver o Docker instalado, basta rodar este comando no terminal:

```bash
docker run --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua_s3nha_segura \
  -v evolution_store:/evolution/store \
  -v evolution_instances:/evolution/instances \
  atendai/evolution-api:v2.1.1
```

O painel ficará disponível em: `http://localhost:8080`

### Como Conectar ao ERP
1. Instale a API.
2. No painel da API, crie uma "Instância" e leia o QR Code.
3. Configure o **Webhook** da API para apontar para o seu Supabase (se usar Edge Functions) ou para o seu Backend.

---

## Opção 2: Z-API (Paga - Mais Fácil)
Se não quiser lidar com servidores e instalação.

- **Site:** [www.z-api.io](https://www.z-api.io)
- **Custo:** Aprox. R$ 99/mês.
- **Vantagem:** É só pagar e usar, não precisa instalar nada.

---

## Comparativo
| Recurso | Evolution API | Z-API | Botão Link (Atual) |
| :--- | :--- | :--- | :--- |
| **Custo Mensal** | R$ 0 (ou VPS ~$30) | ~R$ 99 | R$ 0 |
| **Dificuldade** | Média (Técnica) | Baixa | Nenhuma |
| **Envia Sozinho?** | Sim | Sim | Não (Clique manual) |
| **Lê Respostas?** | Sim | Sim | Não |
