-- Fix: Grant permissions on auditoria_financeira for migration
-- The trigger auditar_alteracao() runs on contas_receber/contas_pagar
-- but service_role doesn't have INSERT permission on auditoria_financeira

GRANT ALL ON auditoria_financeira TO service_role;
GRANT ALL ON auditoria_financeira TO authenticated;
GRANT ALL ON auditoria_financeira TO anon;

-- Also remove the generated column restriction for valor_saldo during migration
-- (valor_saldo is computed, we cannot insert into it)
