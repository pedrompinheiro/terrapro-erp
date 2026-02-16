
-- Tabela Unificada de Entidades (Clientes e Fornecedores)
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.entities CASCADE;

CREATE TABLE public.entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Papéis no Sistema (Pode ser ambos)
  is_client BOOLEAN DEFAULT FALSE,
  is_supplier BOOLEAN DEFAULT FALSE,
  
  -- Identificação
  type TEXT DEFAULT 'PJ' CHECK (type IN ('PF', 'PJ')), -- Tipo de Pessoa
  name TEXT NOT NULL,          -- Nome Fantasia (PJ) ou Nome Completo (PF)
  social_reason TEXT,          -- Razão Social (PJ)
  document TEXT UNIQUE,        -- CNPJ ou CPF
  state_registration TEXT,     -- Inscrição Estadual (PJ) / RG (PF)
  municipal_registration TEXT, -- Inscrição Municipal
  birth_date DATE,             -- Data Nascimento (PF)
  
  -- Dados Específicos de Fornecedor
  supplier_category TEXT,      -- Ex: Peças, Serviços, Combustível
  
  -- Dados Específicos de Cliente
  credit_limit NUMERIC(15, 2) DEFAULT 0,
  credit_rating TEXT DEFAULT 'BOM',
  
  -- Dados de Contato e Endereço (Comum a todos)
  email TEXT,
  phone TEXT,
  website TEXT,
  
  zip_code TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  
  -- Comercial Geral
  payment_terms TEXT,
  notes TEXT,
  
  -- Estruturas Complexas
  contacts JSONB DEFAULT '[]'::jsonb,
  partners JSONB DEFAULT '[]'::jsonb,
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entities accessible to authenticated" ON public.entities FOR ALL USING (auth.role() = 'authenticated');

-- Dados de Exemplo: Cliente Puro
INSERT INTO public.entities (
    is_client, name, social_reason, document, 
    zip_code, street, number, neighborhood, city, state,
    email, phone
) VALUES (
    TRUE, 'Construtora Horizonte', 'Construtora Horizonte LTDA', '12.345.678/0001-90',
    '01001-000', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP',
    'contato@horizonte.com', '(11) 3222-0000'
);

-- Dados de Exemplo: Fornecedor Puro
INSERT INTO public.entities (
    is_supplier, name, document, supplier_category,
    zip_code, city, state, phone
) VALUES (
    TRUE, 'Peças & Cia', '11.222.333/0001-55', 'Peças Mecânicas',
    '30000-000', 'Belo Horizonte', 'MG', '(31) 5555-1234'
);

-- Dados de Exemplo: Híbrido (Cliente e Fornecedor)
INSERT INTO public.entities (
    is_client, is_supplier, name, social_reason, document,
    zip_code, city, state, phone, supplier_category
) VALUES (
    TRUE, TRUE, 'Locadora Global', 'Global Locações S.A.', '99.888.777/0001-11',
    '20000-000', 'Rio de Janeiro', 'RJ', '(21) 99999-8888', 'Locação de Equipamentos'
);
