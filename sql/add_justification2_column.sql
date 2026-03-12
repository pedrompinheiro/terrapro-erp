-- ============================================================
-- TerraPro ERP — Justificativa por Período
-- ============================================================
-- Adiciona coluna justification2 para justificativa do período 2
-- justification  = período 1 (Ent.1 / Saí.1)
-- justification2 = período 2 (Ent.2 / Saí.2)
-- ============================================================

ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS justification2 TEXT;
