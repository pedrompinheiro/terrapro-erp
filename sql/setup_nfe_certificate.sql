-- ============================================
-- system_settings — Certificado Digital A1 para consulta SEFAZ
-- Criado: 24/02/2026
-- ============================================

-- Categoria 'certificados' para o certificado digital
INSERT INTO system_settings (key, label, description, category, is_secret, value) VALUES
    ('nfe_certificate_pfx', 'Certificado Digital A1 (.pfx)', 'Arquivo PFX/P12 do certificado digital A1 (e-CNPJ) armazenado em base64. Usado para autenticação mTLS na SEFAZ.', 'certificados', true, null),
    ('nfe_certificate_password', 'Senha do Certificado', 'Senha de acesso ao certificado digital A1 (.pfx).', 'certificados', true, null)
ON CONFLICT (key) DO NOTHING;

-- Garantir que company_cnpj existe (pode já existir da migração anterior)
INSERT INTO system_settings (key, label, description, category, is_secret, value) VALUES
    ('company_cnpj', 'CNPJ Principal', 'CNPJ da empresa principal para integrações fiscais e consulta SEFAZ. Formato: apenas números (14 dígitos).', 'system', false, null)
ON CONFLICT (key) DO NOTHING;
