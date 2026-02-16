-- PARTE 1: EMPRESA E FUNCIONÁRIOS (Rode este primeiro)
-- Data: 2026-02-06T21:56:38.780Z

-- 1. GARANTIR EMPRESA
INSERT INTO companies (id, name, status) VALUES ('00000000-0000-0000-0000-000000000001', 'TerraPro Transportadora', 'ACTIVE') ON CONFLICT (name) DO UPDATE SET status = 'ACTIVE';

-- 2. FUNCIONÁRIOS
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('146bcbaf-ba2f-41a8-8f81-af21ef6531f5', '00000000-0000-0000-0000-000000000001', 'Sergio Filipe Veiga Tojeira', '37', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6f4aa33b-1f58-402b-988e-07eb5fe5de41', '00000000-0000-0000-0000-000000000001', 'ANTONIO DE SOUZA PEREIRA', '3', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('792c4f3e-9780-4d73-9fcf-3de72f9b3fbc', '00000000-0000-0000-0000-000000000001', 'DOGIVAL RODRIGUES DE SOUZA JUNIOR', '2', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ffa3be65-4706-4df4-8e08-5da15d1c0635', '00000000-0000-0000-0000-000000000001', 'EDUARDO MENEZES PINHEIRO', '29', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('175419d4-82b3-476d-97d9-113492c42ab6', '00000000-0000-0000-0000-000000000001', 'VALDELI CORNELIO SOUSA', '26', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0ec88051-8d24-430a-94e6-aabfd32030d1', '00000000-0000-0000-0000-000000000001', 'VALDECI DORETTO LISBOA', '4', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1cacca4c-5835-464e-a5b5-3d2fc91f4b2f', '00000000-0000-0000-0000-000000000001', 'SABRINA MALHEIROS BUT', '38', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fa680d7d-e896-4fb8-ba44-663faf1f1207', '00000000-0000-0000-0000-000000000001', 'ERIOVALDO GUILHERME FERREIRA', '34', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5834c00f-c7bf-41a1-ad70-fe5732f0bd74', '00000000-0000-0000-0000-000000000001', 'CLAUDEMIR DOS SANTOS MARCELINO', '101', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('419d1e66-c3c9-4dc6-b2aa-ce5a71b117b3', '00000000-0000-0000-0000-000000000001', 'EVILSON ALVES DOS SANTOS', '102', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a1bb30f3-dd91-4fe1-9556-246a530e5ca5', '00000000-0000-0000-0000-000000000001', 'RAFAEL COSTACURTA DE MENEZES', '105', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('82e00a4a-c0eb-44b3-bd02-b21a25aa986d', '00000000-0000-0000-0000-000000000001', 'RONY MENDES FREITAS', ',', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ec10bf36-6b28-4766-85ef-6258d1b026f0', '00000000-0000-0000-0000-000000000001', 'TIAGO ZARATIN DE ANDRADE', '108', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8cd7b183-5788-42f7-a83b-71e408cf412a', '00000000-0000-0000-0000-000000000001', 'WANDERLEY DE OLIVEIRA DIAS', '143', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3303d79e-283f-4c45-9743-e9bc3c24234c', '00000000-0000-0000-0000-000000000001', 'LILIAN RODRIGUES DA SILVA', '16', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fb7be2bc-c9b9-4b68-911d-ca80101aa570', '00000000-0000-0000-0000-000000000001', 'Andressa Aparecida Ferreira', '17', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8b37ae1e-4e16-4fe0-9af9-9d48b77aeb1f', '00000000-0000-0000-0000-000000000001', 'Jose Welinton Macedo Ribeiro', '110', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a28d0aa0-9631-4740-81a8-d2f624ac0ea6', '00000000-0000-0000-0000-000000000001', 'Renato Oquito Camara', '111', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5883328f-30a2-483c-b1bf-deb99889682c', '00000000-0000-0000-0000-000000000001', 'Roberto Francisco Ferreira', '112', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cdec7e32-25d9-43af-9670-f85c9d88a4cf', '00000000-0000-0000-0000-000000000001', 'Juarez Prevelato', '113', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('baa3fe53-3ce5-459d-a5e0-e8747106f1ff', '00000000-0000-0000-0000-000000000001', 'Silas Castilho da Silva', '114', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('13ac6fb6-3ef8-40cc-84a1-2138cb4512ed', '00000000-0000-0000-0000-000000000001', 'Eder Ferreira da Silva', '115', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a1395960-c58f-4257-a9e8-307160335e5e', '00000000-0000-0000-0000-000000000001', 'Daniel Cordeiro dos Santos', '116', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ad1ec68c-f017-40db-b07b-55ed0de98060', '00000000-0000-0000-0000-000000000001', 'Cleidson da Silva Pippus', '117', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('722a0f65-311c-48a8-ae58-a1c004d21b4c', '00000000-0000-0000-0000-000000000001', 'Max Willian Rodrigues dos Santos', '118', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2a679391-2fbc-4a46-b47a-3c935e03b117', '00000000-0000-0000-0000-000000000001', 'Alex Teixeira de Lima', '119', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9ff01d1d-b595-4c80-81f8-61f34b2ae5e1', '00000000-0000-0000-0000-000000000001', 'Antonio Leonides Vieira', '120', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0d64bc7b-15bc-4781-9f41-0597e234d81f', '00000000-0000-0000-0000-000000000001', 'JOSE CARLOS DA SILVA', '121', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3aa14167-f7f4-4b1d-9904-b70847c77630', '00000000-0000-0000-0000-000000000001', 'MAXSUELL LOUZADA DOS SANTOS', '122', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fda71c94-857d-4f1e-93c5-f9307fbbf333', '00000000-0000-0000-0000-000000000001', 'GENTIL MARTINS DE MATOS', '123', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0f9c5a13-fb6d-476a-84f9-f8d02566a0a3', '00000000-0000-0000-0000-000000000001', 'MARCO AURÉLIO CASTILHO', '124', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cd4e2ec7-36f9-4d8b-b856-3bc6b3a8e807', '00000000-0000-0000-0000-000000000001', 'ADAM NICOLAU MACHADO SILVA', '125', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('44246c9d-8eb9-415c-a98d-703e509f6b91', '00000000-0000-0000-0000-000000000001', 'CARLOS FAGNER DE SOUZA', '126', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('267dde7f-3ef9-4968-b4fd-a2997626ef53', '00000000-0000-0000-0000-000000000001', 'OSMAR BERNARDO PEREIRA', '127', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e8eb074f-7cfc-4a30-9bb9-b06534df8854', '00000000-0000-0000-0000-000000000001', 'MARCELO MENDES', '128', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('07116fae-5c94-40f7-85e6-33b3def61340', '00000000-0000-0000-0000-000000000001', 'DHOW WEI PERUCI SILVA', '129', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('20c84277-12a9-4e42-84a4-5448b76100dd', '00000000-0000-0000-0000-000000000001', 'ANDRES MACHADO', '141', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9186832c-1bc5-48fb-bc2f-a5842ed88b44', '00000000-0000-0000-0000-000000000001', 'JOSE FELIX JUNIOR', '131', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f8add14c-a97b-497e-adb1-4dc65543629e', '00000000-0000-0000-0000-000000000001', 'PAULO CIPRIANO RIBEIRO', '144', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cd7e036f-ed44-4ce0-b3ff-c1b83051669a', '00000000-0000-0000-0000-000000000001', 'Jair Nolacio Coimbra', '133', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a99a9577-988b-40aa-9e87-e54f5c502f6e', '00000000-0000-0000-0000-000000000001', 'DORIVAL MACHADO DE OLIVEIRA', '58', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('62490df2-6b0b-4474-bd77-7fa3b9dcb52b', '00000000-0000-0000-0000-000000000001', 'MARCOS SILVA DE SOUZA', '56', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c52fb291-517a-40e9-a696-5e0fd4fa0f6e', '00000000-0000-0000-0000-000000000001', 'PAULO ROGÉRIO DE CASTILHO', '55', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6648579f-f8fe-48ed-9950-77d4c86de3c9', '00000000-0000-0000-0000-000000000001', 'Odair José Cabulão', '63', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1fc17d83-a084-4bae-a2c4-ac6e9f0a516b', '00000000-0000-0000-0000-000000000001', 'Jeferson da Silva Vieira', '61', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('05c5aaaf-857c-429a-82aa-12319a329858', '00000000-0000-0000-0000-000000000001', 'João Dirceu Rasbold', '65', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('72670a82-a64a-4fb7-bf51-ab4d6ab5cf35', '00000000-0000-0000-0000-000000000001', 'Junior de Souza', '64', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0969af0d-cae2-4e8b-bf35-f88fe108e797', '00000000-0000-0000-0000-000000000001', 'Jessica Araujo Andrade Cabreira', '18', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('91c42660-2fbf-4c34-8b65-f0e679082bad', '00000000-0000-0000-0000-000000000001', 'Pedro Adriano Soares de Moura', '66', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('573ae547-e40b-411a-a307-03c100ca0ea9', '00000000-0000-0000-0000-000000000001', 'IZAIAS VALDEZ FRANCO', '67', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2a9b984e-e1ca-42df-b861-d23243487c66', '00000000-0000-0000-0000-000000000001', 'RENAN MARTINES DIAS', '140', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8241e2ef-7716-42e2-bff2-73f97b5803ed', '00000000-0000-0000-0000-000000000001', 'JEDER SANTOS DE OLIVEIRA', '20', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b47b572c-9c1f-4a38-afe8-8bec9e514544', '00000000-0000-0000-0000-000000000001', 'MARCOS GONÇALVES DA SILVA', '69', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('229d4e4b-e938-4097-b40f-2aaad5a7bd22', '00000000-0000-0000-0000-000000000001', 'Odemir Coene de Moares', '21', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('09c8f8ab-1df3-44fa-a0ea-801faa6881fa', '00000000-0000-0000-0000-000000000001', 'ELISANGELA DA SILVA', '43', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1405bc99-2772-4a9d-b9f1-11c54d06f64e', '00000000-0000-0000-0000-000000000001', 'MAYARA LIMA DONOMAE', '460', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('80e2d57b-b7a0-4a31-8a92-12b0a25a779a', '00000000-0000-0000-0000-000000000001', 'MAURICIO HIDEKI TAKARA', '24', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('44e53143-189e-4092-a20c-2cbbde8fbf61', '00000000-0000-0000-0000-000000000001', 'VAINER VASCONCELOS PINHEIRO', '75', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('21f59d62-79c4-40ac-8478-291eec62f3c7', '00000000-0000-0000-0000-000000000001', 'WILSON HANSEN', '76', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8b911a5b-f4f9-480f-959c-3d5778520ee1', '00000000-0000-0000-0000-000000000001', 'CARLOS JOSE DA SILVA', '1390', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6481a727-d71a-4554-a32f-44626e64a6c3', '00000000-0000-0000-0000-000000000001', 'WANILTON DE ARAUJO CAMARGO', '79', 'MESTRE DE OBRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('05fa3894-f9ff-4ba3-a4c5-589ab71ccb3d', '00000000-0000-0000-0000-000000000001', 'RENATO APARECIDO INACIO DA SILVA', '80', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('133984a0-1964-4e2c-841f-e77656b89b3e', '00000000-0000-0000-0000-000000000001', 'LEANDRO SOARES QUINTANA', '81', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bea499c2-b07c-47b5-8edc-dd77a120bfe5', '00000000-0000-0000-0000-000000000001', 'GIOVANE SEBASTIÃO BARBOSA', '25', 'ENTREGADOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a9e29855-c20f-4412-9faf-b5a10ce58083', '00000000-0000-0000-0000-000000000001', 'HANDERSON CARDOZO DOS SANTOS', '27', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ea02110a-556f-4494-913c-9f7c9ca0e841', '00000000-0000-0000-0000-000000000001', 'UANDERSON VANZELLA', '84', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('67bdf653-bfd2-44e7-9500-656fac929976', '00000000-0000-0000-0000-000000000001', 'CARLOS ANDRE HENRIQUE DOS SANTOS', '82', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5d3bcd47-680d-49db-928f-301fc2caa9eb', '00000000-0000-0000-0000-000000000001', 'EDVANDRO FERREIRA BATISTA', '85', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a9747160-1a12-41ff-859e-f555ec07daba', '00000000-0000-0000-0000-000000000001', 'LUCIANO FLORES', '86', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c2329f81-786e-4e63-91a5-e1161de31803', '00000000-0000-0000-0000-000000000001', 'RODOLFO FELIPE MARECO PALERMO', '88', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0d9d5433-c2b7-4cc5-bd2c-9f39e153fe80', '00000000-0000-0000-0000-000000000001', 'ADAM NICOLAU MACHADO DA SILVA', '87', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ac3683f1-9b98-4457-8aa6-f8488f45a696', '00000000-0000-0000-0000-000000000001', 'ADENILSO JOSE MARTELLI', '90', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ae890490-f8a1-4cfa-9de3-75264e62b213', '00000000-0000-0000-0000-000000000001', 'EZEQUIEL PROENCA GOMES', '91', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bcdb2d01-908e-49de-a04e-555a5c5270c2', '00000000-0000-0000-0000-000000000001', 'RONAN CARLOS MIRANDA', '94', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('85b47c38-3008-4d9a-ade2-d210011aa592', '00000000-0000-0000-0000-000000000001', 'OSMAR BERNARDO PEREIRA', '28', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5bffa391-479a-4115-b0ba-80e566ca891f', '00000000-0000-0000-0000-000000000001', 'NOEL FERREIRA DOS SANTOS', '92', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c1b281c1-53f8-400e-b758-f0e36345b9a2', '00000000-0000-0000-0000-000000000001', 'ALCIDES CORRALES', '93', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('88ca6716-47cd-412f-a53e-5bdcebb4d39d', '00000000-0000-0000-0000-000000000001', 'ERIVAN FERREIRA', '98', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('37ad38a9-2320-438e-9496-f5b748b86c80', '00000000-0000-0000-0000-000000000001', 'JAIR COSTA DE OLIVEIRA', '97', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c00f7c39-4abb-4848-a41d-c09d6251e856', '00000000-0000-0000-0000-000000000001', 'NIVALDO CENTURIAO ZARATINI', '96', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f57c89a8-1017-400a-9fba-be828f90e509', '00000000-0000-0000-0000-000000000001', 'HANDERSON CARDOZO DOS SANTOS', '290', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e5f7270b-9849-41c6-bc73-74c3629e7551', '00000000-0000-0000-0000-000000000001', 'EURICO RODRIGUES LIMA', '30', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('734a01b2-3522-49cc-8547-751ff649f0eb', '00000000-0000-0000-0000-000000000001', 'VALDENIS DOS SANTOS MAGALHAES', '103', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d2aa8471-882a-4b29-854b-19f68b9c4cb6', '00000000-0000-0000-0000-000000000001', 'JOAO DIRCEU RASBOLD', '104', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aa44d530-54db-4a5d-a4df-4d356a444952', '00000000-0000-0000-0000-000000000001', 'UILSON RAMAO BELO', '1030', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0c92f8a5-4599-41b0-83c8-7b78e2b13a83', '00000000-0000-0000-0000-000000000001', 'ANTONIO APARECIDO PEREIRA', '199', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e312afcb-b069-47b4-93b3-1b890874fb28', '00000000-0000-0000-0000-000000000001', 'GUSTAVO FERNANDES DA SILVA', '32', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('557691af-c528-4b6d-9feb-89fe59745acc', '00000000-0000-0000-0000-000000000001', 'RAIMUNDO MORALES MACHADO', '33', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e9fbc694-f02e-4999-8583-8642a58baea5', '00000000-0000-0000-0000-000000000001', 'GABRIEL DE ALENCASTRO MENEZES', '107', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9a41b465-dff7-4b55-a093-76b7bf74ee20', '00000000-0000-0000-0000-000000000001', 'GERALDO J C CUNHA FILHO', '1008', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8cc25113-56d1-4a56-b38f-d7cc5d981b17', '00000000-0000-0000-0000-000000000001', 'JOSE ANTONIO DOMINGUES', '73', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('35a2d663-98c2-4582-81d3-e1b2ec156ce4', '00000000-0000-0000-0000-000000000001', 'JHULIA APARECIDA COELHO SALES', '340', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fb300010-ac92-4748-9100-5e095981640d', '00000000-0000-0000-0000-000000000001', 'MANOEL MACHADO LEONARDO FILHO', '1090', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d2613275-e0ed-4791-9d10-d91ff27c823d', '00000000-0000-0000-0000-000000000001', 'PAULINO FRANCISCO DE OLVEIRA', '142', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a9eedb53-8bdd-4c42-b85f-30565084bbfb', '00000000-0000-0000-0000-000000000001', 'ANDERSON BORGES CORREA', '15', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('854d5663-ffcd-463f-bade-1771dfc5c686', '00000000-0000-0000-0000-000000000001', 'DAVI ROCHA', '95', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('626846a7-97c1-4fbc-8530-b36d4cb2ce22', '00000000-0000-0000-0000-000000000001', 'ADAIR FELIPE ROSA', '155', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b0b7319d-3039-434b-9920-7530367415cd', '00000000-0000-0000-0000-000000000001', 'JOAO VALDIR PIMENTEL CAVALHEIRO', '36', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('62ab8049-ad48-40e7-8330-ab90da7846ec', '00000000-0000-0000-0000-000000000001', 'DANIEL PAULINO DE SOUZA', '1160', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('afd4c725-c769-4d41-bd7a-d2ae68e273e8', '00000000-0000-0000-0000-000000000001', 'ANDERSON LUIZ DE MIRANDA', '1150', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0aec39b3-46cd-47af-9051-e3d97af12441', '00000000-0000-0000-0000-000000000001', 'EDISON LOVERA PALHANO', '1130', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0a745663-385d-4795-8449-144e2f5fea90', '00000000-0000-0000-0000-000000000001', 'JOAO MARCOS FERMINO', '1170', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ece91611-6cc4-4616-8c28-c411ed2227b7', '00000000-0000-0000-0000-000000000001', 'MARCIO APARECIDO FLORES', '1180', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f2c5f168-9370-4e0e-97b7-040e529c9cdb', '00000000-0000-0000-0000-000000000001', 'CLEBERSON RAMAO ALMEIDA', '151', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('eeafd12b-d0b1-4f02-a0ed-84b75f173d3c', '00000000-0000-0000-0000-000000000001', 'ERONILDA CRISTINA MENDES', '1210', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b30348c3-a20b-4f8d-90ab-f4d17c6dac34', '00000000-0000-0000-0000-000000000001', 'FERNANDO RUSTICK DA SILVA', '1220', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('344f04b0-60cf-4817-aa62-1784570a9f9e', '00000000-0000-0000-0000-000000000001', 'WEVERTTON ALVES DOMINGUES', '1240', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('46f81d84-7912-42cb-b628-08db5f015687', '00000000-0000-0000-0000-000000000001', 'L60F F06', 'L60F F06', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a233fdfb-1ca8-45a1-b4e0-55bebd528429', '00000000-0000-0000-0000-000000000001', 'CB 2425', 'CB 2425', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fbe530f0-ebc7-4087-aa82-8be10ce7a52f', '00000000-0000-0000-0000-000000000001', 'CB 26260', 'CB 26260', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('060c4ce4-f3ac-4778-bf86-d12de10b6223', '00000000-0000-0000-0000-000000000001', 'L60F F03 FARELO', 'L60F F03 FARELO', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('929fc848-9b76-4ac4-a6a8-b56c1e377c7c', '00000000-0000-0000-0000-000000000001', 'JOHN DEERE GRUA', 'JOHN DEERE GRUA', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c4eff6ab-6729-4786-87d7-6e661ad5dd52', '00000000-0000-0000-0000-000000000001', 'ARNOBIO AGUEIRO', '380', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('82429728-cf9e-495d-bf07-74c5024bd81f', '00000000-0000-0000-0000-000000000001', 'EDVANDO DOS SANTOS ANDRADE', '1260', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5edb40d6-15eb-4eb8-a80d-57acb0eb28a5', '00000000-0000-0000-0000-000000000001', 'RODRIGO BORBA BARBOSA', '49', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6935093e-4967-4578-b92d-d0cfce7fef97', '00000000-0000-0000-0000-000000000001', 'DORIVAL DOUGLAS DA SILVA', '1290', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bc319b0d-681a-4e05-b0bb-373f840adb6e', '00000000-0000-0000-0000-000000000001', 'CB 31320', 'CB 31320', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d58e1438-c8fd-4d04-a072-222dd9e17647', '00000000-0000-0000-0000-000000000001', 'VALDENIS DOS SANTOS MAGALHAES', '1280', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b55a6c8b-1eb3-405e-88cf-f8eb8de16c30', '00000000-0000-0000-0000-000000000001', 'ADAO SILVEIRA MARQUES', '150', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3f5e6a4f-dae0-4016-80b2-8b1691d4a938', '00000000-0000-0000-0000-000000000001', 'BRUNO MIRANDA DE LIRA', '40', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e527cdcc-bb81-4c11-912a-a68d3f618eed', '00000000-0000-0000-0000-000000000001', 'MINI CARREGADEIRA', 'MINI', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bd9b2ad3-06f2-474a-928a-6e35ede20e80', '00000000-0000-0000-0000-000000000001', 'VALDENIR ARRUDA FRANCO', '136', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('10170a76-22e6-495f-a50f-5706d2b5530d', '00000000-0000-0000-0000-000000000001', 'FABIO JUNIOR ALVES', '135', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ebd0bf62-e777-427e-a770-0f6598acee4e', '00000000-0000-0000-0000-000000000001', 'EDVALDO DANTAS SANTOS', '134', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('682aed20-a1d4-45ee-9dea-15bc27b97891', '00000000-0000-0000-0000-000000000001', 'EC SDLG FROTA 04', 'EC SDLG FROTA 04', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0c4e4188-e149-44cc-ba9c-1a87e333615d', '00000000-0000-0000-0000-000000000001', 'EC SDLG FROTA 03', 'EC SDLG FROTA 03', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6910feb6-598e-4cf4-a755-b8ab728ac253', '00000000-0000-0000-0000-000000000001', 'JOSÉ FRANCISCO SILVA DOS SANTOS', '139', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('03d63855-19dd-4e1c-81bb-598ad50e27ff', '00000000-0000-0000-0000-000000000001', 'L60F F02', 'L60F F02', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ea9a1be0-e89c-423d-9929-af670cd78018', '00000000-0000-0000-0000-000000000001', 'PC 930K', 'PC 930K', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1e6019d9-b41c-41db-bfe1-d9a84d159e57', '00000000-0000-0000-0000-000000000001', 'EC EC140 F01', 'EC EC140 F01', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5c2f8ce6-1b4e-46ff-b2c9-35e188d9f86a', '00000000-0000-0000-0000-000000000001', 'MOTONIVELADORA VOLVO 01', 'MN 01 VOLVO', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c023cb6b-c4b2-4374-babb-7ef07ba4fb12', '00000000-0000-0000-0000-000000000001', 'EDILSON APARECIDO TOBIAS', '137', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('22a8dd2f-520b-417c-ae9d-f57899178e5c', '00000000-0000-0000-0000-000000000001', 'NIVALDO FRANCO DA SILVA', '145', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d74bc9ab-7541-45ba-bd4e-e872d9fef712', '00000000-0000-0000-0000-000000000001', 'JOSE APARECIDO MACEDO DA SILVA', '1400', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('84e8e473-5342-41c4-ad07-df56ed35c3df', '00000000-0000-0000-0000-000000000001', 'AURY DE LIMA BARBOSA FILHO', '146', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6c0cb307-cd70-401b-a6f9-0aaec3ff71a6', '00000000-0000-0000-0000-000000000001', 'JOSE AUGUSTO DE LIMA PEREIRA', '147', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('69d1daad-5632-47ee-b324-51eacca9b615', '00000000-0000-0000-0000-000000000001', 'LEOCARLOS SOARES BECKER', '1460', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('746c79ef-10f2-4214-bed2-581227874fea', '00000000-0000-0000-0000-000000000001', 'ABEL RODRIGO VIDAL', '149', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2dee53a4-54ae-40f4-bc0c-274456252ba6', '00000000-0000-0000-0000-000000000001', 'MN 08 782012', 'MN 08 782012', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4cbed4d4-d1cd-4aa5-8844-ed64763879df', '00000000-0000-0000-0000-000000000001', 'MN 02 782011', 'MN 02 782011', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9781ef5c-919e-4f36-98d9-32f5d16a0b45', '00000000-0000-0000-0000-000000000001', 'VALDECI BEZERRA DA SILVA FARIAS', '138', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('61c9f7f6-baff-4898-91c1-b954c7615bde', '00000000-0000-0000-0000-000000000001', 'JOSE MANOEL DE ANDRADE', '152', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('144f22da-cf34-4387-bb5b-fd8ae9939345', '00000000-0000-0000-0000-000000000001', 'MARCOS ROBERTO DA CUNHA VENIAL', '1420', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e8053222-8c71-4c12-8f7b-b9f494a3bac2', '00000000-0000-0000-0000-000000000001', 'JOAO MARQUES DOS SANTOS', '1450', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('15aeb220-d7f4-49c9-93a1-365e3b645206', '00000000-0000-0000-0000-000000000001', 'CLEUDIMAR SANTANNA', '1430', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5c4dc2ba-0de7-4ed5-b3c1-2a069a011cb0', '00000000-0000-0000-0000-000000000001', 'WEVERSON CHARLEY PINTO DA SILVA', '1550', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2ea18adf-58d9-409f-9fc9-98e4a12efbe7', '00000000-0000-0000-0000-000000000001', 'CICERO FERREIRA DOS SANTOS', '153', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('302d1d43-fc48-4137-8894-655b318fc023', '00000000-0000-0000-0000-000000000001', 'EC EC220D F02', 'EC EC220D F02', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b08c98a2-635c-4c38-8a19-dc9ec8d3d4c5', '00000000-0000-0000-0000-000000000001', 'F05 KOMATSU', 'F05 KOMATSU', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('33e8308e-aa58-44c1-b1de-a2116c506fb7', '00000000-0000-0000-0000-000000000001', 'CLAUMIR COLETA DE SOUZA', '400', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('515fdf7d-83be-484a-bcce-6e8173f6deb7', '00000000-0000-0000-0000-000000000001', 'DAMIAO PINTO DE ALMEIDA', '156', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('83ea7a83-c993-40bc-adf5-ca034faa55dc', '00000000-0000-0000-0000-000000000001', 'ILTON ANTONIO DOS SANTOS', '159', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5fd6ac16-56ce-4ba0-9d33-8fe266a5c5de', '00000000-0000-0000-0000-000000000001', 'HELIO DOS REIS', '158', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a2433527-c712-4eb7-9551-99b0d4b0d2fc', '00000000-0000-0000-0000-000000000001', 'ERICK TEIXEIRA DE CALDAS CORDEIRO', '162', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5102fa27-abc6-410c-83a4-2b588eec8c34', '00000000-0000-0000-0000-000000000001', 'JHULIANO DE MATOS ROSIM', '161', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ceccd644-a392-4816-b836-6d192b0f566d', '00000000-0000-0000-0000-000000000001', 'TAINARA CARDOSO RIBEIRO', '12', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('27ab1a97-8a7d-495d-80bc-b34682d32b79', '00000000-0000-0000-0000-000000000001', 'EDERSON SILVA PEREIRA', '160', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('04aee6cc-7a06-4d79-8ed4-92206692f1cd', '00000000-0000-0000-0000-000000000001', 'PAULO TOMAZ DE AQUINO', '166', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cb5a5a0e-506f-4ef5-8e16-154350f10ee8', '00000000-0000-0000-0000-000000000001', 'DERCIO PEREIRA ANJOS', '164', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0659527e-3389-46a3-ac03-0620f00373e3', '00000000-0000-0000-0000-000000000001', 'REINALDO RAFAEL DE BRITO', '170', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9525e73e-8b06-4514-8843-d62d2a48b116', '00000000-0000-0000-0000-000000000001', 'ENOCK MOREIRA DE MENEZES JUNIOR', '165', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6a66d8d9-259a-4abf-8ccf-683de40d60e3', '00000000-0000-0000-0000-000000000001', 'DANIELA CIRIACO DA SILVA CAMPOS', '14', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('eeb30e16-daa7-49f4-be50-ef17cba82c2b', '00000000-0000-0000-0000-000000000001', 'ISOLINO VILHALBA DE OLIVEIRA', '210', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9e4ad5e4-fd85-43a0-87b7-5a1520841324', '00000000-0000-0000-0000-000000000001', 'ALEXSANDRO WILDNER', '200', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b020e62d-5726-4787-95dd-e3cdee317494', '00000000-0000-0000-0000-000000000001', 'PAULO HENRIQUE BITTENCOURT FERREIRA', '50', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9989e541-1af4-4fe5-ab7b-f4bb153972e1', '00000000-0000-0000-0000-000000000001', 'MAGNO ANDRE BEZERRA CHAMORRO', '51', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e1d1904a-d7f0-4773-aab3-440dcd8ed830', '00000000-0000-0000-0000-000000000001', 'ALEXSANDRO SILVA RIBEIRO DE SANTANA', '52', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1bbec1c0-c2f8-4b55-9448-768bf0392c85', '00000000-0000-0000-0000-000000000001', 'EDENILSON LIMA MAURENCIO', '53', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6a6afb65-add5-499e-863e-f01273edc5a4', '00000000-0000-0000-0000-000000000001', 'LEONIDIO GONÇALVES ROCHA', '46', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d89f851e-7048-48e1-8757-c0be2ec5b5ab', '00000000-0000-0000-0000-000000000001', 'KAUAN MARTINS ROJAS', '19', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ae681070-f483-4e54-ac35-2ecd3882e517', '00000000-0000-0000-0000-000000000001', 'ANDERSON JOSE SANTOS', '1', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('161ecc01-14ce-420f-95d4-fcac2b8f172e', '00000000-0000-0000-0000-000000000001', 'FERNANDO HENRIQUE DE MELO', '1700', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('88731239-038a-414f-bcc7-1b50d289ad46', '00000000-0000-0000-0000-000000000001', 'LILIANE PRIMO RISSATO', '1600', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('62bf346f-a024-49d9-aef8-47e9c856aaba', '00000000-0000-0000-0000-000000000001', 'MARCOS PEREIRA SOBRINHO', '54', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('63e4b5d5-c848-4ccc-b307-855c22eb70bc', '00000000-0000-0000-0000-000000000001', 'JOSE APARECIDO ARCANGELO', '610', 'FUNILEIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('56934117-014b-4ec1-ae77-145ac3d1403b', '00000000-0000-0000-0000-000000000001', 'LUCAS MOREIRA ROSA', '62', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1428d43f-ab2a-49f8-a61e-6baa73baaf81', '00000000-0000-0000-0000-000000000001', 'BRUNO FERNANDO DOS SANTOS CANTEIRO', '31', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6868dcbb-85c5-4c50-92b2-5db12fa121f8', '00000000-0000-0000-0000-000000000001', 'BRENO MATIA RIBEIRO', '560', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bf9f826e-0878-42cd-92a2-25d1e5bfa3ce', '00000000-0000-0000-0000-000000000001', 'TATIANE DIAS JARA GARCIA', '190', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('77e9ed7f-305f-42c1-92b6-227d9057558d', '00000000-0000-0000-0000-000000000001', 'CARLOS JOSE MENDES', '180', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('458e75e1-e565-446a-8456-6c9f7920a3bb', '00000000-0000-0000-0000-000000000001', 'ALEX BARBOSA', '171', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d87821f9-41f5-4cda-8f46-3c26cbac0333', '00000000-0000-0000-0000-000000000001', 'EDSON DA SILVA BATISTA', '68', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aba2a039-68f4-4b9f-ad61-69e7904f9045', '00000000-0000-0000-0000-000000000001', 'JORDELINO MARQUES MIRANDA', '620', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('eb47875b-3cc3-445b-9c8c-73ae2236da3e', '00000000-0000-0000-0000-000000000001', 'REGES AUGUSTO FRUBEL CAVILHAS', '630', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4113c636-24c6-4bef-8168-ac3680610e6b', '00000000-0000-0000-0000-000000000001', 'BONIFACIO ITURVE', '71', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1ded0527-53b4-458a-aafe-15255b4ddec9', '00000000-0000-0000-0000-000000000001', 'JEFFERSON DANILO DE OLIVEIRA AZEVEDO', '192', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('99bd8e46-ab6a-404e-8743-c3a50d2c0c50', '00000000-0000-0000-0000-000000000001', 'DAVI MORAES', '74', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7908ed96-be32-43ea-a749-61c4be3b2876', '00000000-0000-0000-0000-000000000001', 'LIDIO BORGES PEREIRA', '72', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('760a62b0-12dd-4f50-95d6-a76893192e6c', '00000000-0000-0000-0000-000000000001', 'LUCIANO BARBOSA ARCE', '77', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d44baa3a-06b8-48d5-8a0c-13a65a4190b7', '00000000-0000-0000-0000-000000000001', 'OZEIAS DORNELES FERREIRA', '78', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7d552d9b-f282-4195-9c01-9af4ff741543', '00000000-0000-0000-0000-000000000001', 'TAISSA AZAMBUJA BRONEL', '99', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d28475dd-fd1e-4184-9729-822cf9b4ed75', '00000000-0000-0000-0000-000000000001', 'RONALDO ALMEIDA DOS SANTOS', '83', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cee778ef-64fd-4a98-9983-52b8c4a5f16c', '00000000-0000-0000-0000-000000000001', 'WALMIR DA SILVA', '89', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f9b57267-bc61-4f6f-9c9c-5e32a3ada60a', '00000000-0000-0000-0000-000000000001', 'VALDEMIR CASTELLINI', '132', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ca2441ce-390b-40e9-a216-9ba1f7c3ec93', '00000000-0000-0000-0000-000000000001', 'LEONIDAS DA CUNHA VENIAL', '109', 'MESTRE DE OBRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1efc5a59-f30d-4ae5-9fb8-265eb70b2760', '00000000-0000-0000-0000-000000000001', 'JOSE BERALDO DA SILVA NETO', '1011', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8aa363c3-aed9-49f2-a073-3a47c546ed34', '00000000-0000-0000-0000-000000000001', 'EDER FRANCISCO DA SILVA', '178', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a54ec3ca-c33e-4c62-9a6f-87b0786b2c3e', '00000000-0000-0000-0000-000000000001', 'MARCIO RIOS YAMADA', '179', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('25d7b14f-9b4b-4c2d-a9f3-ff1510dccf3f', '00000000-0000-0000-0000-000000000001', 'CARLOS MAGNO VAES DA SILVA', '222', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ba03312b-dd1a-4c0d-8c4c-2ca25d5190c0', '00000000-0000-0000-0000-000000000001', 'NELSON ALVES CARDOSO', '1234', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0a96ae43-bcd2-4844-9853-bcc91e4fc169', '00000000-0000-0000-0000-000000000001', 'CICERO GONÇALVES DA SILVA', '1235', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2fa191fc-17f7-4907-b760-0340c94f02b7', '00000000-0000-0000-0000-000000000001', 'REGINALDO BARBOSA DO PRADO', '8084', 'FUNILEIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('08737866-7505-468f-940d-69cac22485b9', '00000000-0000-0000-0000-000000000001', 'EDMILSON FRANCO', '1330', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a164a663-0182-4b6a-bdda-3a3a7519973e', '00000000-0000-0000-0000-000000000001', 'JHULIANO DE MATOS ROSIM', '770', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fdcc30db-cd18-46c3-b6f0-b079b74f12df', '00000000-0000-0000-0000-000000000001', 'GILSON MARCOS VERON BRANDAO', '1044', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7536c416-9927-40fd-8119-73a2043e9e42', '00000000-0000-0000-0000-000000000001', 'JOAO CARLOS LOURENÇO DE OLIVEIRA', '1045', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a78896ee-3587-4def-8acd-e98b67dc5b48', '00000000-0000-0000-0000-000000000001', 'PEDRO RIBEIRO DA SILVA', '1046', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3e45bb17-dbdf-489a-8a6a-cc3d43981d9f', '00000000-0000-0000-0000-000000000001', 'SIDNEY MACHADO DE SOUZA', '1047', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bd971796-7b3b-4ca4-9369-749000baaaad', '00000000-0000-0000-0000-000000000001', 'WELLINGTON CORREIA DE ARAUJO', '456', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('382016d8-e4a1-4aae-b79b-90472ff88832', '00000000-0000-0000-0000-000000000001', 'VINICIUS DA SILVA RIBEIRO ARANDA', '457', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0e7fe63d-6367-495c-b48b-2120882ba5d6', '00000000-0000-0000-0000-000000000001', 'RONALD SANTANA LIMA', '234', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('03759fdc-607a-49ad-a1dd-2417fbac8bb6', '00000000-0000-0000-0000-000000000001', 'GUSTAVO GODOI ASSUNÇAO RIBEIRO', '235', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ffc35091-c524-437a-8203-c492c0940c16', '00000000-0000-0000-0000-000000000001', 'DANIEL FERREIRA LOBO', '236', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('de436c9e-9b62-4816-b83f-53098c9bc870', '00000000-0000-0000-0000-000000000001', 'CLEBER MORAES SIDES', '237', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a4a897eb-1384-47c4-8fd8-163fcad01a21', '00000000-0000-0000-0000-000000000001', 'ARNALDO DE LIMA BATISTA', '238', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('46c9e504-aded-4484-8f0c-c929e1b981e6', '00000000-0000-0000-0000-000000000001', 'DAIANE MARTINS NOVACHINSKI', '239', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('027a46dd-674d-4ed3-8876-88fb6ec3ccfd', '00000000-0000-0000-0000-000000000001', 'OSORIO CARVALHO NETO', '240', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('81e3b009-94d6-4140-b3cc-3c147cd1737f', '00000000-0000-0000-0000-000000000001', 'DANIEL VASCONCELOS OLIVEIRA', '241', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('098bfbe6-5c89-44f5-8cfa-ae8137e3e7db', '00000000-0000-0000-0000-000000000001', 'EUDES BABETTO ROCHA FERBONIO', '1452', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('296bc82f-3570-4071-94a2-84e0a072b47f', '00000000-0000-0000-0000-000000000001', 'ENIO SILVA ROSA FILHO', '1010', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('79e9e878-a5a7-4d2a-b03f-02879a4492f4', '00000000-0000-0000-0000-000000000001', 'CLAUDINEI PEREIRA DE SOUZA', '1012', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9ca28011-5e96-4c33-b40d-685cd103f619', '00000000-0000-0000-0000-000000000001', 'CARLA LUCAS MENDES SILVA', '2345', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0d006183-c1fd-40f9-919b-94cc48e8a94c', '00000000-0000-0000-0000-000000000001', 'LUIZ CARLOS PEREIRA SOARES', '2346', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('62d748f4-ad87-473a-b483-a0fdc112af23', '00000000-0000-0000-0000-000000000001', 'DAVI MESSIAS ALVES', '2347', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a16ab4d9-db47-4853-a967-8a508b33ea77', '00000000-0000-0000-0000-000000000001', 'ALINE ANIELEM WINCLER DUARTE', '2348', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('37315f4a-7886-4fdf-9a83-073c2aead9cf', '00000000-0000-0000-0000-000000000001', 'ANDRE GABRIEL SANTOS CAMPOS', '2349', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fd533f61-ae83-416d-b922-3102f03bf2a2', '00000000-0000-0000-0000-000000000001', 'SHEILA CRISTINA BARBOSA TORRES', '2350', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2d3868c1-67e0-48d5-b467-65b53807b2df', '00000000-0000-0000-0000-000000000001', 'ISAQUE RODRIGUES DE SOUZA', '2351', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('19d222fe-6f13-4714-97a6-3fa3485b12c3', '00000000-0000-0000-0000-000000000001', 'JOSUE BALBUENA CANDADO', '2353', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4be1282d-0a2b-4363-a33b-b4771f34fe02', '00000000-0000-0000-0000-000000000001', 'LUIS ANTONIO CARDOSO DE SOUZA', '2354', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7fcc2c5b-8ecc-4eb8-b6f4-1e93fe18c0d6', '00000000-0000-0000-0000-000000000001', 'MARCOS LOPES RAMAI', '2355', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f0ae7bbc-080f-42f7-a9b3-8a16d1611023', '00000000-0000-0000-0000-000000000001', 'DANIEL PARREIRA DE AZEVEDO', '2356', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1026ae79-1654-4e92-8b6f-53151e025af6', '00000000-0000-0000-0000-000000000001', 'AGNALDO PEREIRA', '2357', 'ENTREGADOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6f4a393b-9621-444c-8de3-ffbddddf18e4', '00000000-0000-0000-0000-000000000001', 'ORANGEL MANUEL PEREZ RAMOS', '2587', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a6ba92fc-7d69-4f34-a6c8-e7262d327456', '00000000-0000-0000-0000-000000000001', 'FRANCISCO BISPO NETO', '2458', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('66175697-405e-4525-a059-44723cc523ef', '00000000-0000-0000-0000-000000000001', 'LUIZ FERNANDO MARCONDES RIBERO', '2459', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('eb819b98-0a04-4bb2-b0ec-d9ad6402bcd6', '00000000-0000-0000-0000-000000000001', 'CARLOS ALBERTO VILALBA CAMPOS', '2578', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0108eeb1-ebd9-4b84-b003-0be8f4777b88', '00000000-0000-0000-0000-000000000001', 'PAULO CEZAR PIMENTEL MARQUES', '2579', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4a1f53c0-f2f8-4289-9394-bc10c87b608e', '00000000-0000-0000-0000-000000000001', 'CB 31320 II', 'CB 31320 II', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6c1be273-5033-434f-8a26-0c7a6548ea1c', '00000000-0000-0000-0000-000000000001', 'WANILTON CAVALHEIRO OLIVEIRA', '2589', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e01d53f1-5054-4062-a48d-572d0e303dcf', '00000000-0000-0000-0000-000000000001', 'DAYANE ROJAS MARTINELLI SANTANA', '2358', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a36258a2-70db-4532-b989-3bfefc9d5258', '00000000-0000-0000-0000-000000000001', 'JOSIVAN NASCIMENTO DE SOUSA', '2359', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('504dd4af-2d9a-4bca-8785-1b7c1ec68d62', '00000000-0000-0000-0000-000000000001', 'JOSE LINDOMAR DOS SANTOS SEGUNDO', '2560', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5d4561d4-b607-4774-9ae1-aa7652d934b2', '00000000-0000-0000-0000-000000000001', 'MAYANA APARECIDA BERTA', '1500', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bd21ab2b-0c20-46ad-882a-5dc63293a5ff', '00000000-0000-0000-0000-000000000001', 'HENRIQUE OLIVEIRA THOMAZ SOUSA', '2489', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dcd8b08d-2d95-43f4-8198-faddbc5bf8b4', '00000000-0000-0000-0000-000000000001', 'JOSE WILSON DE OLIVEIRA RAIL FILHO', '2479', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d90949df-e6b2-4872-a085-c0eae7e5b063', '00000000-0000-0000-0000-000000000001', 'IZABELA FERNANDES ARAUJO', '2496', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7301179d-5170-4684-aa13-d996fe5e642e', '00000000-0000-0000-0000-000000000001', 'EDUARDO MAXIMO ANTONIO', '2497', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fc43626f-fc19-469e-8dae-89dbd425f749', '00000000-0000-0000-0000-000000000001', 'CLAUDINEIA DE OLIVEIRA', '2490', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('26846770-c83c-4e40-a25b-ebbf4108011f', '00000000-0000-0000-0000-000000000001', 'GENEZIO DA COSTA', '2491', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0c6171c0-66ee-4632-b810-d9512bef3b42', '00000000-0000-0000-0000-000000000001', 'VICTOR VARGAS VIEIRA', '2360', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('99f20aa0-8f35-491f-8420-fc5ea65994e8', '00000000-0000-0000-0000-000000000001', 'DOUGLAS HENRIQUE BADIA DE SOUZA', '2361', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4fd9979b-4924-4c79-ac0b-1ec54861e281', '00000000-0000-0000-0000-000000000001', 'VALDINEI CARDOSO BARBOSA', '2362', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e79122e0-f986-444d-b3d4-7762375b0d8f', '00000000-0000-0000-0000-000000000001', 'DONIZETTE DA SILVA PEREIRA GOMES', '2363', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('eecc0e5b-e697-442f-ab31-3ca5f41dd118', '00000000-0000-0000-0000-000000000001', 'ADISON ARAUJO SILVA', '2364', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d8e71853-6676-4927-a3c8-3aa6c1073e7b', '00000000-0000-0000-0000-000000000001', 'GIOVANY MOREIRA MARCELINO', '2366', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('037ba929-5a85-4222-b9f6-dc792502bf80', '00000000-0000-0000-0000-000000000001', 'MARIO MARCIO DOS SANTOS', '2370', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6bad4f55-6a68-4577-84c8-55579357f7d2', '00000000-0000-0000-0000-000000000001', 'ALEXANDRE GUSTAVO DA SILVA', '2598', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7d3657f4-1128-4977-b09f-a4e90bc6a0b4', '00000000-0000-0000-0000-000000000001', 'ELVIS CLEITON STEILDEL CAVALCANTI', '2599', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('51fc6fd9-f598-41f6-830c-1f746a1ab604', '00000000-0000-0000-0000-000000000001', 'DILVO GARCIA REZENDE', '5269', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1d9a043a-2c14-4009-849a-3acc8a1776fb', '00000000-0000-0000-0000-000000000001', 'JOSE HENRIQUE COSTA DO NASCIMENTO', '2566', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('86c1ac8a-269c-43a5-b0ac-9b6985c4a6c7', '00000000-0000-0000-0000-000000000001', 'TALISSON RENAN DA SILVA OLIVEIRA', '2519', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b91004a1-8409-436b-a4e1-75ea5e5eab30', '00000000-0000-0000-0000-000000000001', 'ANTONIO CARLOS PAULO DE MACEDO', '2590', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('284d0652-df5a-49ae-8b2e-83847ab5bbe1', '00000000-0000-0000-0000-000000000001', 'KELLY DAIANE DOS SANTOS', '2389', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b4cb40cc-4678-43c9-8101-b4b691de4714', '00000000-0000-0000-0000-000000000001', 'FRANCESAR AUGUSTO MARQUES', '2369', 'ENTREGADOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e972ef93-319f-4eab-b69d-42edaff05294', '00000000-0000-0000-0000-000000000001', 'CICERO MARQUES DOS SANTOS', '2399', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('04d4ae43-bed8-4c62-89d3-4bf9b7ef898c', '00000000-0000-0000-0000-000000000001', 'JONES CARVALHO DA ROSA', '2385', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c2ba3a70-b6bf-43fd-9345-d16396b4ac47', '00000000-0000-0000-0000-000000000001', 'GUILHERME FERREIRA DE ANDRADE', '65985', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('665c8953-2189-4f48-b02f-43bbd6b8efc0', '00000000-0000-0000-0000-000000000001', 'Henrique Pereira Nahabedian', '89544', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8a95ffde-4740-4c48-b6e1-1e460b852604', '00000000-0000-0000-0000-000000000001', 'Jhonatan Martins de Oliveira', '548714', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ac46dda5-625d-4195-b7ca-ccb53d9bc11d', '00000000-0000-0000-0000-000000000001', 'Adrieli Aquino Sanches', '84254', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('853fb1af-c6d7-4807-bbad-35d718006d69', '00000000-0000-0000-0000-000000000001', 'DIEGO RODRIGUES DANTAS', '56598', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4018e258-8d64-4da8-9785-19b50ded63db', '00000000-0000-0000-0000-000000000001', 'VILMA MORAES DE SOUZA', '2511', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3e1256e8-5b14-4fa0-b4cd-24b0c85216db', '00000000-0000-0000-0000-000000000001', 'ISAIAS MESSIAS GABRIEL', '2512', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b28aa69b-80d5-4849-94af-2415e00603ba', '00000000-0000-0000-0000-000000000001', 'GLEICIELE IARA LIMA', '2513', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('91a92666-7d99-44a2-b679-d9b9e957544d', '00000000-0000-0000-0000-000000000001', 'VALDELINO ANGELO DOS SANTOS', '2514', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9bfcdd79-e29e-4f35-834c-d252c3cc8b0b', '00000000-0000-0000-0000-000000000001', 'NILSON VALERIO DE ASSUNCAO', '2515', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dd33c97b-b459-404a-a545-54ff6d188f8c', '00000000-0000-0000-0000-000000000001', 'DEBORA MENDONÇA RODRIGUES', '2516', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9a4e235d-adb4-445a-923e-6d531acda083', '00000000-0000-0000-0000-000000000001', 'IGOR WILLIAN ORTEGA CAMARA', '2517', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0f4e8565-8a85-4dce-8ec5-722cb8633f32', '00000000-0000-0000-0000-000000000001', 'PIETRA DE SOUZA SALUM', '9856', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e98b067e-8bb5-47af-98b2-8614af9e165b', '00000000-0000-0000-0000-000000000001', 'GERCI PORTILHO DE OLIVEIRA', '8456', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e2a76b70-a454-4315-9ed8-10795982e2b9', '00000000-0000-0000-0000-000000000001', 'JAIRO ANDRE KRONBAUER', '5472', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('33ac1e1d-8fc3-4b35-8f05-98f04f1f8acb', '00000000-0000-0000-0000-000000000001', 'ALICE VITORIA GARCIA PEREIRA DE OLIVEIRA', '64855', 'OPERADOR (A) DE CAIXA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2e641579-36fe-42e1-85fa-540c5a1166e9', '00000000-0000-0000-0000-000000000001', 'JOSE ALFREDO FONTEN LEZAMA', '7854', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2a744ef9-d0d9-4ea1-97ce-6b0735b756dc', '00000000-0000-0000-0000-000000000001', 'PAULO VERMIEIRO DO NASCIMENTO', '16514', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('533528dc-0595-4f30-bd62-3b2886d0edc8', '00000000-0000-0000-0000-000000000001', 'LUCAS RODRIGUES JUSTINO BONFIM', '87654', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('416be765-accb-4de0-b485-6767d3e93d35', '00000000-0000-0000-0000-000000000001', 'RUI NELSON CORREIA DOS SANTOS DE CARVALHO', '45468', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('23aa90f5-71ab-48d8-81b7-aa1d1c203569', '00000000-0000-0000-0000-000000000001', 'IVALDO JOSE DE LIMA', '154354', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f8b9a147-a44f-4006-b58a-06f6384b07fb', '00000000-0000-0000-0000-000000000001', 'EMERSON ALEX MATOS SANTANA', '45268', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bf625d33-8dc2-49ec-ac17-245e8322b069', '00000000-0000-0000-0000-000000000001', 'RAFAEL GONZAGA SCHMIDT', '4138', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('655ebe01-59af-4b64-858c-1a307b18ad66', '00000000-0000-0000-0000-000000000001', 'EZEQUIEL DE MORAIS GONZAGA', '1532', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ab57e901-2d6b-4c93-8685-a1f25852d4da', '00000000-0000-0000-0000-000000000001', 'EFRAIM DA SILVA SOUSA', '4587', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('36b695b4-9386-4802-a868-5bf8a1835a82', '00000000-0000-0000-0000-000000000001', 'CAIO HENRIQUE DE OLIVEIRA', '4698', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a2d25555-f66a-400a-ac2d-b8018543c336', '00000000-0000-0000-0000-000000000001', 'CRISTIANO GONZAGA DA ROCHA', '5179', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7c7c144b-947e-4684-b444-4454e47956ea', '00000000-0000-0000-0000-000000000001', 'RODRIGO DE OLIVEIRA PITTERI', '6589', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4efbff5e-fff9-4212-af93-c80948bcbf9d', '00000000-0000-0000-0000-000000000001', 'FABIANE CASSARI DE OLIVEIRA', '4564', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('90064194-66b0-43a1-91b1-9bd47c272075', '00000000-0000-0000-0000-000000000001', 'PEDRO CARLINHOS PEREIRA', '2677', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('30800c1b-8c9b-4e5f-8437-c45471d29249', '00000000-0000-0000-0000-000000000001', 'IGOR GOMES PEDROSO', '2591', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4c45acdd-5f31-480f-b11d-9f6946872415', '00000000-0000-0000-0000-000000000001', 'ANA PAULA GONCALVES LIMA', '2592', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6ce35437-1c8a-414d-bbdf-09d4758d8065', '00000000-0000-0000-0000-000000000001', 'GLAUCE COUTINHO ARSAMENDIA', '2594', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ede880fb-5d3b-470f-b356-86069480d2d4', '00000000-0000-0000-0000-000000000001', 'ROGERIO BARBOSA AQUINO', '2595', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('58bddcea-b5de-4ee5-ba17-cc5537f6467c', '00000000-0000-0000-0000-000000000001', 'BRUNO BERBEL RODRIGUES', '2596', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('05040160-a3e6-41c5-94be-666962b7c1f7', '00000000-0000-0000-0000-000000000001', 'DANILO SANTOS DA CRUZ', '1111', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('87c187df-2452-4b1f-88e5-b44cfd4b6e19', '00000000-0000-0000-0000-000000000001', 'SANDRO VELAZQUEZ ATANAGILDO', '1112', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dee01287-2301-4b31-8f3e-b8f4d46f9619', '00000000-0000-0000-0000-000000000001', 'PAULO ALBUQUERQUE SILVA', '2398', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8e71275c-e716-40e7-9bdf-a004b2d62de0', '00000000-0000-0000-0000-000000000001', 'NEUZA CRISTINE RIBEIRO', '2400', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7289dfcf-1414-4e75-ba62-650300970303', '00000000-0000-0000-0000-000000000001', 'ADEMAR DE PAULA', '2401', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dccc8a4e-c8a5-4774-8c3e-6e4f743eee3b', '00000000-0000-0000-0000-000000000001', 'VALDINOR OSVALDO WENTZ', '2402', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1d1dd92e-e5fe-4e8b-9d03-5b69cc325b1c', '00000000-0000-0000-0000-000000000001', 'FABIO ROGERIO DOS SANTOS', '2552', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1b4248ba-d156-4f33-88c1-50e2ecf34b61', '00000000-0000-0000-0000-000000000001', 'ANTONIO DANIEL TORRES LEIVA', '2553', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('35909aca-e7d0-4a6b-9654-8e711da9a1be', '00000000-0000-0000-0000-000000000001', 'ALDENES ALBINO GOMES DA ROCHA', '2554', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('92abfc91-79bb-4b27-93ee-b9893083b238', '00000000-0000-0000-0000-000000000001', 'ADRIANO EVANGELISTA IZIDORO', '2555', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c9ca3483-e2e7-4b87-b195-40e1a37155e1', '00000000-0000-0000-0000-000000000001', 'MARCELO FRANCISCO FERREIRA', '2556', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a1dfdd14-0ea6-48eb-b454-861fa085d4af', '00000000-0000-0000-0000-000000000001', 'ANTONIO IRINEU DOS SANTOS', '1322', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7065c79e-1c4a-4315-8714-74a03059e12f', '00000000-0000-0000-0000-000000000001', 'GERALDO FERREIRA DA SILVA', '1323', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9f1f535d-b4b7-4e65-a2d0-2c9f72b253a8', '00000000-0000-0000-0000-000000000001', 'WAGNER SILVA DE OLIVEIRA', '1324', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('823ac5a1-1141-421a-a0db-8798679dc1a2', '00000000-0000-0000-0000-000000000001', 'ODAIR CANDIDO DE SOUZA', '2557', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f73a8f9f-5c62-433f-bbab-8e64d025b47d', '00000000-0000-0000-0000-000000000001', 'JUNIOR JOSE SOLANO MORA', '2558', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('41944269-5d8d-46ec-bc63-afcc18f205f3', '00000000-0000-0000-0000-000000000001', 'FERNANDO DOS SANTOS PEREIRA', '1325', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dabc5734-2889-464d-99d2-da8b85d65a18', '00000000-0000-0000-0000-000000000001', 'MARCELO TEIXEIRA SIMOES', '1326', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d68dd42a-9ae1-4b67-bb48-d031d3eeb595', '00000000-0000-0000-0000-000000000001', 'IVO GOMES DE VASCONCELOS', '1327', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aff756d9-2dae-4b20-ba4f-0d46c35eb861', '00000000-0000-0000-0000-000000000001', 'RAFAEL CLAUS PEREIRA', '1328', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2253ff0c-bcb2-44f4-8061-95e13a259036', '00000000-0000-0000-0000-000000000001', 'JOAO FRANCISCO DE ALMEIDA', '2559', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b795a218-e379-4597-946d-c9be1b8a0f66', '00000000-0000-0000-0000-000000000001', 'DOUGLAS ALVES TABORDA', '2561', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('be96ecdc-c914-4265-b3a3-392bd303311e', '00000000-0000-0000-0000-000000000001', 'ARI WAGNER PEDROSO DA ROCHA', '2562', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('084a7883-9925-4d31-b490-a47e75fc0fe1', '00000000-0000-0000-0000-000000000001', 'GILSON FERREIRA SILVA', '2588', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('adedb279-f602-4148-87e0-beeb5595499e', '00000000-0000-0000-0000-000000000001', 'APARECIDO SEBASTIAO DA SILVA', '2570', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7aee4dd6-e13d-4298-a084-80f433b9e364', '00000000-0000-0000-0000-000000000001', 'LUIS AUGUSTO FONSECA PEIXOTO', '2571', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('04eaa639-cd74-441e-b7d7-b6af8782f712', '00000000-0000-0000-0000-000000000001', 'RAFAEL ESPINDOLA PINHEIRO', '2425', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c833cca8-e4de-45b6-9e11-db8280dd26e9', '00000000-0000-0000-0000-000000000001', 'UEMERSON BATISTA ARRUDA DE MORAIS', '2626', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('758a66b3-f614-4751-9bf3-ed5378be78ff', '00000000-0000-0000-0000-000000000001', 'ANSELMO GARCIA DE REZENDE', '2600', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('befc0701-a582-480a-af84-301872899759', '00000000-0000-0000-0000-000000000001', 'PAULO SERGIO DE SOUZA', '2601', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a57d43f1-0ac8-48b1-a746-983dcb9b77b1', '00000000-0000-0000-0000-000000000001', 'LEONIDAS DA CUNHA VENIAL', '1255', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('36759c81-943e-47c5-970e-d2ed93281d92', '00000000-0000-0000-0000-000000000001', 'JEFERSON GABRIEL SANTOS DOS SANTOS', '2602', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('132e5e86-edaa-4584-8732-7e93ec468cd3', '00000000-0000-0000-0000-000000000001', 'SILVIO SANDRO ALMEIDA GONÇALVES', '555222', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b5d630fb-d5e6-496d-a888-67e547d04c92', '00000000-0000-0000-0000-000000000001', 'MARCELINO GOMEZ CARDOZO', '2111', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e4dca429-3ade-4f0d-b7ce-917ffe8a28c4', '00000000-0000-0000-0000-000000000001', 'RENATO ROSEMIR DE OLIVEIRA JUNIOR', '2627', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('99300225-ca8b-440b-b527-ab543a1df77b', '00000000-0000-0000-0000-000000000001', 'ALMIR JOSE DE SOUZA', '2233', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('48caf901-beea-4db9-8abf-a9c27db2a4b9', '00000000-0000-0000-0000-000000000001', 'MARCELO MARQUES DA SILVA', '11221', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5e4de962-0631-4b23-a651-6d40b9e56b1a', '00000000-0000-0000-0000-000000000001', 'MARCELO JOSE DE FREITAS', '1233', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8e7cd4ed-59d0-4b70-903e-468ab4bb64d1', '00000000-0000-0000-0000-000000000001', 'SIDINEY FRANCISCO DE SOUZA', '1545', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('73517683-ff44-4fcc-80b4-eacbc76cba3a', '00000000-0000-0000-0000-000000000001', 'ANTONIO LEONIDES VIEIRA', '12455', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8547e08c-9c7e-479b-9673-c3cb955dd623', '00000000-0000-0000-0000-000000000001', 'ALEX DOS SANTOS SILVA', '2828', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b573ba15-9d68-4687-ad63-4f523ab72399', '00000000-0000-0000-0000-000000000001', 'ANDRE REIS ROCHA', '2829', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('59d3b898-72a5-4225-a055-a8fb5c3652c0', '00000000-0000-0000-0000-000000000001', 'HEVERTON RODRIGUES NUNES', '2830', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('60b3f0d3-159e-4946-ac89-16d8ce456843', '00000000-0000-0000-0000-000000000001', 'LEANDRO DE PAULA DOS ANJOS', '2831', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e32c5e0a-a197-490a-8004-16968c40f676', '00000000-0000-0000-0000-000000000001', 'MARCIO GONCALVES BENITEZ', '2832', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8b4dd199-b56f-4d81-8d38-6c01ad845374', '00000000-0000-0000-0000-000000000001', 'JOAO ANTONIO PAULINO', '2222', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('abdc0cdf-8005-41db-8cbc-fb99cb695746', '00000000-0000-0000-0000-000000000001', 'SOLON ALMEIDA SOARES', '2330', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6b417b98-19f4-4f24-803c-c779abadcc04', '00000000-0000-0000-0000-000000000001', 'CB 1418', '1418', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fe7dd9da-468a-4b7f-b52b-e9b470c1f15a', '00000000-0000-0000-0000-000000000001', 'FERNANDO DA SILVA DIAS', '2525', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5e8a3fe3-0926-48c9-91df-d85c806ca821', '00000000-0000-0000-0000-000000000001', 'LUCAS MATEUS DOS SANTOS SILVA', '2662', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6fd78907-cff6-4a55-8d92-a16e8ce58638', '00000000-0000-0000-0000-000000000001', 'JADER DOS SANTOS VASCONCELOS', '2655', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f7b94862-5947-4aaa-89d8-afb1e63b4d7a', '00000000-0000-0000-0000-000000000001', 'MATEUS DELFIM VALENZUELA', '26559', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a70e8b18-bd23-433e-85ba-a23a3bf52eb3', '00000000-0000-0000-0000-000000000001', 'LIEGE DA SILVA BARROS', '1000', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9d2b36d1-64ea-463b-961b-43c76a02abe3', '00000000-0000-0000-0000-000000000001', 'MATEUS DOS SANTOS OLIVEIRA', '500', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('89f29e4d-321f-4c9e-b06e-98c7882a1fe7', '00000000-0000-0000-0000-000000000001', 'DEIVID BENITES LIMA BARRIOS', '55548', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('55c124e0-1d3d-406a-828f-f4082b004d95', '00000000-0000-0000-0000-000000000001', 'GEOVANI BIANCHINI ALVES', '2503', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('205d7481-3d8b-4003-a69a-25893d17e25a', '00000000-0000-0000-0000-000000000001', 'SEBASTIAO TADEU ORTIZ DE FREITAS', '111544', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f3dc523c-f453-4b83-86d6-565680885130', '00000000-0000-0000-0000-000000000001', 'ENMANUEL JESUS ESTRADA CONTRERAS', '5504', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7f44cab1-bee1-4795-b919-695b8ad3bacd', '00000000-0000-0000-0000-000000000001', 'RAFAEL CARNEIRO DA SILVA', '2833', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e0284793-b6be-4aa2-879b-c0cd694f39b6', '00000000-0000-0000-0000-000000000001', 'ARIOVALDO DE ALMEIDA RODRIGUES', '2577', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d95b1403-f1c4-4934-8ee6-cc643284ec07', '00000000-0000-0000-0000-000000000001', 'FRANTIESCO BATISTA VASQUES', '2501', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('89da02af-d542-4fe0-8bb8-b468c87b9e6b', '00000000-0000-0000-0000-000000000001', 'NILO DOS SANTOS', '1221', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7629f65b-d56c-40a9-b1da-c3b3f08d9f6d', '00000000-0000-0000-0000-000000000001', 'EMERSON FRANCISCO ICASSATTI', '5656', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a0ebf1e9-ff95-4ab7-8d28-34b39949d291', '00000000-0000-0000-0000-000000000001', 'JOSE ROMARIO COSTA DA SOLIDADE', '5657', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('09afe84b-baa7-45fa-a65a-2c3874037cf7', '00000000-0000-0000-0000-000000000001', 'ALINO VITOR NASCIMENTO DE ALENCAR', '3939', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f3f42ef6-f815-4af7-8cf8-648a657914d1', '00000000-0000-0000-0000-000000000001', 'EVERTON LOPES DOS SANTOS', '2241', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f8253d1b-2c11-4828-a8d4-133890bdd20d', '00000000-0000-0000-0000-000000000001', 'ANGELA KAROLINY PEIXOTO DE AGUIAR', '2480', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dadea880-9ce6-482d-a9a6-de7338c66fe9', '00000000-0000-0000-0000-000000000001', 'MARCOS DOS SANTOS BARBOSA', '2888', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('45165044-67b8-4795-b39a-a1bd11389ab2', '00000000-0000-0000-0000-000000000001', 'CRISTIANE PATRICIA DE OLIVEIRA SILVA', '2990', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('54e8a380-6f66-4157-8ed6-80b8dfde22bb', '00000000-0000-0000-0000-000000000001', 'ANDRE MARTINS PAEL', '2658', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('538fa227-adc8-4fc1-9f68-7d7afdcc41e7', '00000000-0000-0000-0000-000000000001', 'LUIZ HENRIQUE AGUIAR DE FREITAS', '2632', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1bbdae49-c82e-4e90-96c1-0bcd2aafd138', '00000000-0000-0000-0000-000000000001', 'WILLIAN DA SILVA ALVES', '2597', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('91bee72d-b998-48ea-8719-cb8dd1369433', '00000000-0000-0000-0000-000000000001', 'JOAO ALVES DA SILVA', '2603', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2171a5f4-5202-4a2a-a10a-a2bafec58cf4', '00000000-0000-0000-0000-000000000001', 'DOUGLAS DE REZENDE', '2604', 'FUNILEIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7af0a716-fd6a-49e2-bdd2-83ef52bc1b29', '00000000-0000-0000-0000-000000000001', 'GUSTAVO SOZZI DE SOUZA', '2606', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('122acf12-a57a-431d-a38b-512bf2cd9626', '00000000-0000-0000-0000-000000000001', 'ISABELY KAIANY GONSALES RODRIGUEZ', '2607', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6659e35e-3dde-4094-ba1e-8531bc42b834', '00000000-0000-0000-0000-000000000001', 'LEVI DE OLIVEIRA', '2660', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0c4391c7-e1dd-4a0d-90cc-ac5944d8767f', '00000000-0000-0000-0000-000000000001', 'RAFAEL CALCA DE OLIVEIRA', '2663', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('88160153-8da5-46d8-a4e3-ff1ea2b49671', '00000000-0000-0000-0000-000000000001', 'DANIEL JOSE LOPEZ COROY', '2666', 'FUNILEIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('92856c6d-e07d-4de5-95a6-2577ee4c4e0a', '00000000-0000-0000-0000-000000000001', 'EVANDRO FERREIRA DE SOUZA', '2664', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('27c40f4c-022a-4072-90f1-7519b0870d54', '00000000-0000-0000-0000-000000000001', 'PAULO ROBERTO TREVISAN', '2667', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2c28442f-93ca-456d-b2ae-c41f2013fb05', '00000000-0000-0000-0000-000000000001', 'PEDRO WELLINGTON GARCIA DE OLIVEIRA', '2668', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ebb7f1ab-65e2-4a2c-b545-946f3e6ca37d', '00000000-0000-0000-0000-000000000001', 'EDNA SILVA', '2669', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('573f1b65-8ea0-415c-bed5-d18385f447f2', '00000000-0000-0000-0000-000000000001', 'THIAGO DUTRA', '2670', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dceb6ff2-a03c-4476-bb43-aa39f188f52c', '00000000-0000-0000-0000-000000000001', 'ADRIANO XAVIER LOPES CORREIA', '2678', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('57d93014-962e-45f6-b21f-b5774adba03e', '00000000-0000-0000-0000-000000000001', 'ELIER COSTA DA SILVA', '2671', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('01196889-1727-4346-ad80-b04cddc3b3df', '00000000-0000-0000-0000-000000000001', 'BRUNO ALTAMIR HOLSBACH VENIAL', '2679', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b36251d2-c0c4-45d3-9054-3135702ec3ab', '00000000-0000-0000-0000-000000000001', 'FABRICIO AREBALO ESPINDOLA', '2690', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('65ed65a2-8387-4aa6-8ebe-ff5fad858b0e', '00000000-0000-0000-0000-000000000001', 'KARINA FEITOZA GOMES', '2701', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3fdefc96-2b87-47d9-965e-ad7695a6f294', '00000000-0000-0000-0000-000000000001', 'ALANNA EDUARDA MARQUES DA SILVA', '2707', 'VENDEDOR', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2c224bfe-1858-42df-a3a1-79a6cec9a394', '00000000-0000-0000-0000-000000000001', 'DIEGO BRUNO NUNES DE OLIVEIRA', '2706', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5d6bec6d-fceb-4968-acd9-4d139bcbd809', '00000000-0000-0000-0000-000000000001', 'ALEXANDRE DA CUNHA FERREIRA FILHO', '2909', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fa513d3b-07e0-4278-8df8-4a99d4cad275', '00000000-0000-0000-0000-000000000001', 'SEBASTIAO VIEIRA DIAS', '2910', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('31564d7d-1fff-42a3-8d1a-7f591dc81076', '00000000-0000-0000-0000-000000000001', 'PAULO TEODORO DA ROCHA', '2911', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('48f2e03b-773e-484d-88a5-0e28deac8757', '00000000-0000-0000-0000-000000000001', 'GUSTAVO DA SILVA FRANCA', '2912', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dbf3c173-8869-4887-8a2d-e96e3ab541cd', '00000000-0000-0000-0000-000000000001', 'IAGO DA SILVA RODRIGUES CORREA', '2913', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8a865881-efbc-4d9b-8bc6-9c2ce5dcc1d8', '00000000-0000-0000-0000-000000000001', 'MARCOS PAULO SOARES DA SILVA', '2914', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9cd2356d-8ed1-4301-8a29-41e29361bddd', '00000000-0000-0000-0000-000000000001', 'NELSON SILVERIO', '22222', 'GERENTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('81e44f4b-0868-4f8f-8c1a-f5d6f35affec', '00000000-0000-0000-0000-000000000001', 'CLEBER OERTA DA SILVA', '2908', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('77bdf221-9e6a-4447-8a9b-1e173a9add7c', '00000000-0000-0000-0000-000000000001', 'KAROLAYNE APARECIDA DE MORAES', '2915', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0093e782-2ee6-4ef9-a12e-04369a66e2eb', '00000000-0000-0000-0000-000000000001', 'MARCELO LOPES RODRIGUES', '2919', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('44e4f9aa-c0f7-409c-8c51-47612a706e12', '00000000-0000-0000-0000-000000000001', 'JOSE VALDENIR TEIXEIRA RIPARDO', '1930', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c8773e4d-e6e9-4ae6-8604-f44816c4e859', '00000000-0000-0000-0000-000000000001', 'VICTOR OLIVEIRA MIRANDA', '2920', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9c6608dc-247a-4003-a4e1-c4d7a04d4e27', '00000000-0000-0000-0000-000000000001', 'GABRIELA FERREIRA LUIZ', '2922', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c0e9bb2b-d8ca-4884-96fd-e8c910cdc1c1', '00000000-0000-0000-0000-000000000001', 'ELIAS LOPES MARTINS', '27883', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1b155acc-2269-4eb7-955b-e3d77d8e8fa3', '00000000-0000-0000-0000-000000000001', 'JERISON RIOS ROJAS', '2710', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('59efe95c-d038-4139-bc98-165fcd87e44d', '00000000-0000-0000-0000-000000000001', 'AUGUSTO LUIZ DA SILVA', '2800', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dbfd26a7-f92b-428b-9db1-a5091c49c03c', '00000000-0000-0000-0000-000000000001', 'EDUARDO DUARTE DA SILVA', '2801', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1196f9fb-c369-4ab4-a994-eb0d8964ce94', '00000000-0000-0000-0000-000000000001', 'MAXSSUEL BATISTA DE ANDRADE', '2916', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9c7834e0-77e7-471b-b660-7ba487da380d', '00000000-0000-0000-0000-000000000001', 'JHON ROGERS SALES COLMAN', '2917', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('90fb797d-ee7e-4fbf-acf2-ccbf5342e200', '00000000-0000-0000-0000-000000000001', 'EDGAR MARINHO', '2899', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('97a01bc4-a192-43a4-93f9-4ab3985c65e7', '00000000-0000-0000-0000-000000000001', 'LUCAS BARBAES FERREIRA', '2901', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6a2a8a53-9996-409c-a536-f4579893ce9c', '00000000-0000-0000-0000-000000000001', 'GERFSON LIMA FERREIRA', '2528', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a9033f6e-9b27-44ab-813d-b8c6983bfc61', '00000000-0000-0000-0000-000000000001', 'APARECIDO DO NASCIMENTO', '2691', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2dadf3cd-4923-466d-8362-84051d1c425a', '00000000-0000-0000-0000-000000000001', 'DEBORA ALVES DE ARAUJO FERREIRA', '2889', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8e78baf9-a735-414c-b903-3ed9c9668551', '00000000-0000-0000-0000-000000000001', 'ERIKA MARQUES DOS SANTOS', '2890', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ffaea5d3-7504-463d-abd7-d5f0418ac706', '00000000-0000-0000-0000-000000000001', 'FRANCISCO LEANDRO DE LIMA OLIVEIRA', '2891', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('54a7f224-a293-42b0-b2fe-caf5b6e0f05c', '00000000-0000-0000-0000-000000000001', 'Viviane Tereza de Souza Silva', '289', 'AUXILIAR ADIMINISTRATIVO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('94a524a9-6316-4b36-90ed-55b740de1d7b', '00000000-0000-0000-0000-000000000001', 'RAMAO GABRIEL DELFIM VALENZUELA', '287', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('95a5ba9a-c6dd-4da9-bc3c-f0846d9ad4b8', '00000000-0000-0000-0000-000000000001', 'ADRIANO DA SILVA GALVÃO', '288', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('83ed3459-b63b-47eb-acb4-0fb9435660b8', '00000000-0000-0000-0000-000000000001', 'ALTAIR APARECIDO DA SILVA', '290-0', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a911ff7e-d918-4ef5-a4f6-a3b778ffab1d', '00000000-0000-0000-0000-000000000001', 'ITALO ALMEIDA ALVES', '291', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f3def71f-025d-46dd-979b-e48a7a2bb4d7', '00000000-0000-0000-0000-000000000001', 'DIEGO DE SOUZA CAVALCANTE', '47', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e5c88677-7490-4f19-a81a-c4fccbd72362', '00000000-0000-0000-0000-000000000001', 'Lucas Ronfim', '292', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c73ff377-053a-4838-8596-3bbc411bfb80', '00000000-0000-0000-0000-000000000001', 'LUCIANO FERREIRA DA SILVA', '13', 'MESTRE DE OBRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8c2e032b-8e90-47b8-8bb3-3873a90fc252', '00000000-0000-0000-0000-000000000001', 'JOSÉ ADVALDO RIBEIRO', '294', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d1f6c9ba-5524-481a-868f-136aa9c020c1', '00000000-0000-0000-0000-000000000001', 'Donizette da Silva Pereira Gomes', '295', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3c8ef691-4ccb-4b56-aabc-6fe071bba178', '00000000-0000-0000-0000-000000000001', 'José Ricardo de Oliveira Costa', '296', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('08278f9f-4241-4b93-a227-a5b04e8e9b00', '00000000-0000-0000-0000-000000000001', 'EDIVALDO TOBIAS DA SILVA', '299', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2a10fa7c-1da3-4674-9ee5-eed154138067', '00000000-0000-0000-0000-000000000001', 'ADRIAN NEVES DOS SANTOS', '297', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('091b272e-ccb3-47de-bacc-9685c73e76f3', '00000000-0000-0000-0000-000000000001', 'ALAN JUNIOR PAREDES', '298', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6b850bc9-b6db-4ba3-9154-d97800e0b84e', '00000000-0000-0000-0000-000000000001', 'Lucas Henrique Magro Assunção', '305', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8312d373-2eba-47fb-a3eb-d65ca1fd709b', '00000000-0000-0000-0000-000000000001', 'Simon Luis Rojas Silva', '304', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aeb709b3-5582-40d0-8680-5ec8fdcce501', '00000000-0000-0000-0000-000000000001', 'Weverson de Lima Silva', '308', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('577122d1-7bc7-4e77-b2fc-dc6ed5a98d1a', '00000000-0000-0000-0000-000000000001', 'Ramerson Santos Rodrigues', '306', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c1f8f09c-0321-4b02-a861-2dbe65b8e262', '00000000-0000-0000-0000-000000000001', 'Everton da Silva Lisboa', '310', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('294223e1-92ed-4110-84e2-13784cef312f', '00000000-0000-0000-0000-000000000001', 'Pedro Antonio da Silva', '311', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ca395bfd-9e7a-4b25-bbb2-5d11b8eec2e0', '00000000-0000-0000-0000-000000000001', 'EDMAR DE ALMEIDA SOARES', '312', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c3090c14-84da-46dc-8173-db9f46bb8795', '00000000-0000-0000-0000-000000000001', 'Edson Pires Santana', '307', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('60c3d7e0-0175-4db2-b428-b3558ba33332', '00000000-0000-0000-0000-000000000001', 'Reinaldo', '100', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2f54bacc-4913-4164-a134-2e2a2954d965', '00000000-0000-0000-0000-000000000001', 'Arculano Gonçalves da Luz', '314', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f33eb183-faa3-448c-ad37-d2738f539b8c', '00000000-0000-0000-0000-000000000001', 'CAIO FELIPE DOS SANTOS', '317', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('be55568d-fe03-4abe-a781-2c0068f26581', '00000000-0000-0000-0000-000000000001', 'OSVALDO MALDONADO VILHARVA', '315', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8d77e0e0-2e85-43e6-b0a0-95751aff8a74', '00000000-0000-0000-0000-000000000001', 'FRANCISCO DE ASSIS JUNIOR', '318', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('164309b4-1da0-46c5-96d2-9baabac2fa2a', '00000000-0000-0000-0000-000000000001', 'MARCELINO GOMEZ CARDOZO', '316', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2f3ecac9-01c6-458f-b75d-33ae2b1f8358', '00000000-0000-0000-0000-000000000001', 'IVANESIO BALT', '319', 'MOTORISTA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('11b40fb3-1411-49e5-8f20-b152d762d53f', '00000000-0000-0000-0000-000000000001', 'EDER FRANCISCO DA SILVA', '320', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2be64652-4075-4b9e-bc03-31c77c29ea61', '00000000-0000-0000-0000-000000000001', 'RODSON ARIEL DE OLIVEIRA', '7300', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3332e080-03ae-4ba1-86ee-de93aaa3b12a', '00000000-0000-0000-0000-000000000001', 'PAULO HENRIQUE FERREIRA PEREIRA DOS SANTOS', '321', 'OPERADOR PÁ-CARREGADEIRA', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('df6b7751-e6c2-419f-b720-b26d1d9f0169', '00000000-0000-0000-0000-000000000001', 'MATHEUS SAMPAIO MARTINS', '20052', 'AJUDANTE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3f7aa7ea-0031-4b54-8d3c-57371e819316', '00000000-0000-0000-0000-000000000001', 'CARLOS LUIS GUERRA RIVERA', '54.0', 'AJUDANTE DE PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f75c5121-eb20-405d-9cdd-18887cee3251', '00000000-0000-0000-0000-000000000001', 'EDGAR JOSE SALAZAR GOMEZ', '53.0', 'PEDREIRO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('baac17e8-5417-4105-8fae-7fc156f1bcee', '00000000-0000-0000-0000-000000000001', 'GABRIEL DE SOUZA MATOS', '324', 'ALMOXARIFE', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ed899637-c06d-4fc1-b952-ce2fa5d5a37b', '00000000-0000-0000-0000-000000000001', 'ANDERSON ALVES CORREIA', '325', 'AUXILIAR DE MANUTENÇÃO', NOW()) 
ON CONFLICT (company_id, registration_number) DO NOTHING;
