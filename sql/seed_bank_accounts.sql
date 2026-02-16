-- =====================================================
-- SEED DATA: Contas Bancárias e Caixas
-- =====================================================

INSERT INTO contas_bancarias (
    banco_codigo, 
    banco_nome, 
    agencia, 
    conta, 
    tipo_conta, 
    saldo_atual, 
    ativa, 
    padrao,
    empresa_cnpj
) VALUES 
('001', 'Banco do Brasil', '1234-5', '99999-9', 'CONTA_CORRENTE', 15000.00, TRUE, TRUE, '00.000.000/0001-91'),
('260', 'NuBank', '0001', '1234567-8', 'CONTA_CORRENTE', 5450.50, TRUE, FALSE, '00.000.000/0001-91'),
('999', 'Caixa Pequeno (Físico)', '0000', 'CAIXA-01', 'CAIXA_FISICO', 1250.00, TRUE, FALSE, NULL);

-- Opcional: Ajustar saldo inicial se necessário
-- UPDATE contas_bancarias SET saldo_atual = 20000 WHERE banco_codigo = '001';
