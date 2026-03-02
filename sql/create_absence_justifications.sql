-- ============================================================
-- TerraPro ERP — Justificativas de Abono de Faltas
-- ============================================================
-- Tabela para cadastrar tipos de justificativa que abonam
-- a falta do funcionário (ex: Atestado, Chuva, Dispensado, Sobreaviso)
-- ============================================================

CREATE TABLE IF NOT EXISTS absence_justifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    excuses_absence BOOLEAN DEFAULT true,   -- abona a falta (zera horas faltantes)
    affects_dsr BOOLEAN DEFAULT false,      -- se true, mesmo justificado perde DSR
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed inicial com os 4 tipos padrão
INSERT INTO absence_justifications (name, code, description, excuses_absence, affects_dsr) VALUES
    ('Atestado', 'ATESTADO', 'Atestado médico ou odontológico', true, false),
    ('Chuva', 'CHUVA', 'Dispensa por condições climáticas', true, false),
    ('Dispensado', 'DISPENSADO', 'Dispensado pela empresa', true, false),
    ('Sobreaviso', 'SOBREAVISO', 'Funcionário em regime de sobreaviso', true, false)
ON CONFLICT (code) DO NOTHING;

-- RLS
ALTER TABLE absence_justifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_absence_justifications" ON absence_justifications;
CREATE POLICY "allow_all_absence_justifications" ON absence_justifications
    FOR ALL USING (true) WITH CHECK (true);

-- Garantir acesso
GRANT ALL ON absence_justifications TO authenticated;
GRANT ALL ON absence_justifications TO anon;
