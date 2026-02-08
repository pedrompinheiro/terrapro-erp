<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TerraPro ERP - Gestão de Ativos

Sistema avançado para gestão de frota, manutenção, RH e financeiro, com visual Industrial/Dark moderno.

## 🚀 Novas Funcionalidades (Atualização Recente)

### 1. **Mapa de Operações (`/operations-map`)**
   - Timeline interativa estilo "Excel".
   - Controle de status (Trabalhou, Parado, Manutenção, Chuva).
   - Tooltip com localização da obra.
   - Dados centralizados via API.

### 2. **Gestão de RH (`/rh`)**
   - Controle de Ponto (Entradas/Saídas).
   - Exportação de **PDF (Espelho de Ponto)** para impressão e assinatura.
   - Gestão de Folha de Pagamento e Vales.

### 3. **Integração Manuais Técnicos (PROSIS)**
   - Aba "Manuais Técnicos" no cadastro de Ativos (`/fleet`).
   - Navegação em árvore de peças e visualização explodida.

### 4. **Assistente IA (TerraPro AI)**
   - Chatbot flutuante inteligente.
   - Sugestões de perguntas (Combustível, Financeiro, Status).
   - Interface animada com glassmorphism.

---

## 🛠️ Instalação e Execução

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Rodar o Projeto:**
   ```bash
   npm run dev
   ```

3. **Acessar:**
   Abra `http://localhost:5173` no navegador.

---

## 📂 Estrutura do Projeto

- **/components**: Componentes reutilizáveis (Sidebar, Modal, AIAssistant).
- **/pages**: Telas principais (Dashboard, FleetManagement, HRManagement, OperationsMap).
- **/services**: Mock Data centralizado e serviços de API simulados.

## 🤖 Status da IA

O Assistente IA está implementado visualmente em `components/AIAssistant.tsx`. Atualmente opera em modo de simulação (Mock), pronto para integração real com a API Gemini via `@google/genai`.

---
*Desenvolvido por TerraPro Team*
