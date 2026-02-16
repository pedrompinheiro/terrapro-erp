
# 🌍 Sistema de Rastreamento Avançado (Histórico e Telemetria)

Pedro, conforme solicitado, refiz o sistema de mapa para suportar **histórico completo**, **ignição** e **banco de dados próprio**.

## 🚀 Passo 1: Criar Tabela de Histórico (Supabase)
Como seu usuário tem permissões limitadas via script, você precisa rodar este SQL no **Supabase Dashboard > SQL Editor** para criar a tabela de histórico:

```sql
-- Criação da tabela de posições
CREATE TABLE IF NOT EXISTS asset_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION DEFAULT 0,
    ignition BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ NOT NULL,
    address TEXT,
    voltage DOUBLE PRECISION,
    satellite_count INTEGER,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_asset_positions_asset_time ON asset_positions(asset_id, timestamp DESC);

-- Habilitar RLS (Permissões)
ALTER TABLE asset_positions ENABLE ROW LEVEL SECURITY;

-- Política de Acesso (Liberado para Authenticated e Service Role)
CREATE POLICY "Allow All Authenticated" ON asset_positions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow Service Role" ON asset_positions FOR ALL TO service_role USING (true) WITH CHECK (true);
```

## 📡 Passo 2: Iniciar o Coletor de Dados (Daemon)
Para que o sistema grave o histórico (mesmo com o site fechado), você precisa de um processo rodando no servidor (ou no seu terminal local por enquanto).

Abra um terminal e rode:
```bash
npx tsx scripts/track_daemon.ts
```
Este script vai:
1. Consultar a Selsyn a cada 60 segundos.
2. Salvar as posições na tabela `asset_positions`.

## 🗺️ Passo 3: Usar o Novo Mapa
1. Atualize a página do Mapa Digital.
2. Agora você verá dois modos no topo: **"Ao Vivo"** e **"Histórico"**.
3. **Ao Vivo:** Mostra a frota em tempo real (com o botão de Sincronizar BD se precisar).
4. **Histórico:**
   - Selecione um veículo na lista.
   - Escolha a Data no calendário.
   - Use o **Player** (Play/Pause) ou a **Barra de Tempo (Slider)** para ver onde o veículo estava.
   - Eventos de **Partida (Verde)** e **Parada (Vermelho)** aparecem no trajeto.

## ⚠️ Importante
Seus veículos só terão histórico a partir do momento que você rodar o Passo 2 (`track_daemon.ts`). O histórico anterior não existe na API Selsyn (ela só dá posição atual).
