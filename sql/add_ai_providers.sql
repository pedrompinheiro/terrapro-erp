-- =============================================================================
-- Multi-Provider IA - Settings para OpenAI, Gemini e Groq
-- =============================================================================

INSERT INTO system_settings (key, value, label, description, category, is_secret)
VALUES
  ('ai_provider', 'gemini', 'Provedor de IA', 'Provedor ativo: openai, gemini ou groq', 'api_keys', false),
  ('openai_api_key', '', 'OpenAI API Key', 'Chave da API OpenAI (GPT-4o-mini)', 'api_keys', true),
  ('groq_api_key', '', 'Groq API Key', 'Chave da API Groq (Llama 3.3 70B - Gratis)', 'api_keys', true)
ON CONFLICT (key) DO NOTHING;
