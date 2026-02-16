
# Diretiva de Integração GPS (Selsyn)

## Visão Geral
A integração com o sistema de monitoramento Selsyn é feita de forma **passiva** (consumo de API REST), buscando posições em tempo real para enriquecer os dados de ativos no ERP.

## Arquitetura
1.  **Frontend (React/Vite):** O cliente faz requisições diretas (via `fleetService`) para a API Selsyn.
2.  **Autenticação:** As chaves de API (`VITE_SELSYN_API_KEY`) são armazenadas em variáveis de ambiente e passadas no Header `x-api-key` ou Query Param `apikey`.
3.  **Merge de Dados:** O `fleetService` busca os ativos do Supabase e cruza com os dados do Selsyn usando o campo `name` (ou `code`) do ativo como chave para a **Placa/Identificador**.

## Regras de Negócio
-   **Status do Ativo:**
    -   `MOVING` (Vel > 0) -> `OPERATING`
    -   `IDLE` (Ignição ON, Vel 0) -> `IDLE`
    -   `STOPPED` (Ignição OFF) -> `AVAILABLE`
    -   `OFFLINE` (>1h sem sinal) -> `MAINTENANCE` (Assume necessidade de verificação)
-   **Tolerância de Offline:** Veículos sem sinal há mais de 60 minutos são marcados como Offline.

## Endpoints Utilizados
-   **Base URL:** `https://api.appselsyn.com.br/keek/rest`
-   **Posições:** `GET /v1/integracao/posicao`
    -   Retorna lista completa de veículos com últimas posições.

## Schema de Dados (Selsyn)
```typescript
interface SelsynPosition {
    identificador: string; // Placa
    data: string;          // ISO Date
    latitude: number;
    longitude: number;     // WGS84
    velocidade: number;    // km/h
    ignicao: boolean;
    endereco?: string;     // Reverse Geocoding opcional
    bateria?: number;      // Voltagem
}
```

## Como Adicionar Novos Veículos
Para que um veículo apareça no mapa:
1.  Cadastre o Ativo no ERP.
2.  Garanta que o **Nome** ou **Código** do ativo seja **exatamente igual** à Placa cadastrada na Selsyn (ex: `ABC1234`).
3.  O sistema fará o vínculo automático na próxima atualização (polling de 7s).
