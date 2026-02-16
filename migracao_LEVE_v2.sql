-- PARTE 1: EMPRESA E FUNCIONÁRIOS (Rode este primeiro)
-- Data: 2026-02-07T13:52:33.558Z

-- 1. GARANTIR EMPRESA
INSERT INTO companies (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'TerraPro Transportadora')

-- 2. FUNCIONÁRIOS
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('059602ac-33c8-47e2-90be-e4c885cd1278', '00000000-0000-0000-0000-000000000001', 'Sergio Filipe Veiga Tojeira', '37', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c144b76f-0e27-4e04-b383-72640d25d759', '00000000-0000-0000-0000-000000000001', 'ANTONIO DE SOUZA PEREIRA', '3', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2525455d-3fcf-4698-810f-b4ed3180d0ea', '00000000-0000-0000-0000-000000000001', 'DOGIVAL RODRIGUES DE SOUZA JUNIOR', '2', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('139e8823-53e4-4274-a628-c46b36195122', '00000000-0000-0000-0000-000000000001', 'EDUARDO MENEZES PINHEIRO', '29', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('92f40551-2b52-4ae8-82f3-510c5e1d5ee8', '00000000-0000-0000-0000-000000000001', 'VALDELI CORNELIO SOUSA', '26', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7eff9bee-cdcc-4794-ad2b-312e58af649b', '00000000-0000-0000-0000-000000000001', 'VALDECI DORETTO LISBOA', '4', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6d6f5cec-ea81-4734-b4e7-8b76e5b29caa', '00000000-0000-0000-0000-000000000001', 'SABRINA MALHEIROS BUT', '38', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('edbf1fd0-b306-427d-bbbe-81b7f19dcb25', '00000000-0000-0000-0000-000000000001', 'ERIOVALDO GUILHERME FERREIRA', '34', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bacfc3b7-4644-48ab-8140-2cc23c67516e', '00000000-0000-0000-0000-000000000001', 'CLAUDEMIR DOS SANTOS MARCELINO', '101', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('38faf814-3951-4c7f-947f-4097e63001b3', '00000000-0000-0000-0000-000000000001', 'EVILSON ALVES DOS SANTOS', '102', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b21a2ee3-3e70-4e92-b628-6c0017d81d3c', '00000000-0000-0000-0000-000000000001', 'RAFAEL COSTACURTA DE MENEZES', '105', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a48dc9b8-a84b-44e0-b9d3-d2c5efcf6e3e', '00000000-0000-0000-0000-000000000001', 'RONY MENDES FREITAS', ',', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6d1e1977-34e0-4bb7-85c0-bf85e9a03aac', '00000000-0000-0000-0000-000000000001', 'TIAGO ZARATIN DE ANDRADE', '108', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9e553b42-cd61-46fe-836c-71d4ee4d5dea', '00000000-0000-0000-0000-000000000001', 'WANDERLEY DE OLIVEIRA DIAS', '143', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a8aa9289-a42e-49c1-a015-ba387dddee65', '00000000-0000-0000-0000-000000000001', 'LILIAN RODRIGUES DA SILVA', '16', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7f75ee8b-d440-4c17-9917-70c7d5d4786b', '00000000-0000-0000-0000-000000000001', 'Andressa Aparecida Ferreira', '17', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aea86d8e-5fe3-4a7c-9c48-70d28dc4f798', '00000000-0000-0000-0000-000000000001', 'Jose Welinton Macedo Ribeiro', '110', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7385d5c6-126f-4dee-827d-51af5626a4ce', '00000000-0000-0000-0000-000000000001', 'Renato Oquito Camara', '111', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('63ea72cd-291f-445f-9293-b0976dac70cf', '00000000-0000-0000-0000-000000000001', 'Roberto Francisco Ferreira', '112', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('143c9845-cd1e-407d-96e9-d0d4017f8f91', '00000000-0000-0000-0000-000000000001', 'Juarez Prevelato', '113', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5165ab4b-97e5-43e5-b71c-714337fa328f', '00000000-0000-0000-0000-000000000001', 'Silas Castilho da Silva', '114', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('abaa4cb6-2538-4833-bf04-c4d6dc39b4fa', '00000000-0000-0000-0000-000000000001', 'Eder Ferreira da Silva', '115', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fd402b88-c073-45b9-8934-511d17d0f523', '00000000-0000-0000-0000-000000000001', 'Daniel Cordeiro dos Santos', '116', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8a5a69de-e71c-4cae-a3cc-b38b86a8c782', '00000000-0000-0000-0000-000000000001', 'Cleidson da Silva Pippus', '117', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('90f21211-fa6b-49b4-a963-022bc16d4b66', '00000000-0000-0000-0000-000000000001', 'Max Willian Rodrigues dos Santos', '118', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f4896389-4385-4c4f-8d7b-52067f56a4e1', '00000000-0000-0000-0000-000000000001', 'Alex Teixeira de Lima', '119', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8bb43d16-0d36-4f1d-92b9-6c1cc0600bb3', '00000000-0000-0000-0000-000000000001', 'Antonio Leonides Vieira', '120', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a8503609-33a7-4cfa-9fa8-a42008b52374', '00000000-0000-0000-0000-000000000001', 'JOSE CARLOS DA SILVA', '121', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a68a2f7b-d934-492f-a65a-53188e349c53', '00000000-0000-0000-0000-000000000001', 'MAXSUELL LOUZADA DOS SANTOS', '122', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cc8b583d-4f97-474d-a9cc-1b24d574eae4', '00000000-0000-0000-0000-000000000001', 'GENTIL MARTINS DE MATOS', '123', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d08a2f57-558e-4548-ba19-0387bd978e49', '00000000-0000-0000-0000-000000000001', 'MARCO AURÉLIO CASTILHO', '124', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dbcf6a20-fe62-4ded-93a2-53bac1937069', '00000000-0000-0000-0000-000000000001', 'ADAM NICOLAU MACHADO SILVA', '125', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('297ace89-9771-4101-8db7-f5a822b09f89', '00000000-0000-0000-0000-000000000001', 'CARLOS FAGNER DE SOUZA', '126', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9d47d81b-1316-4ed1-8c9a-87731f1c7afe', '00000000-0000-0000-0000-000000000001', 'OSMAR BERNARDO PEREIRA', '127', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('60de2e30-066e-4012-9f27-f19a867427f2', '00000000-0000-0000-0000-000000000001', 'MARCELO MENDES', '128', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c24c406e-5e3b-4823-ad48-2da47cc9a650', '00000000-0000-0000-0000-000000000001', 'DHOW WEI PERUCI SILVA', '129', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0dc1ced2-3fed-43b4-b38f-f20ad4f8c81f', '00000000-0000-0000-0000-000000000001', 'ANDRES MACHADO', '141', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ac265538-5334-43c8-ad1d-dfc530ccc1a7', '00000000-0000-0000-0000-000000000001', 'JOSE FELIX JUNIOR', '131', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a79c5497-fb7d-4846-a026-961ec01a2d1c', '00000000-0000-0000-0000-000000000001', 'PAULO CIPRIANO RIBEIRO', '144', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('62305aea-5275-4484-b821-15b5f591635e', '00000000-0000-0000-0000-000000000001', 'Jair Nolacio Coimbra', '133', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0b8d39fa-dd9b-41e1-a734-20173e8eb7ff', '00000000-0000-0000-0000-000000000001', 'DORIVAL MACHADO DE OLIVEIRA', '58', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('707cee7d-6c5d-4179-88a3-c91bbc2ca6c5', '00000000-0000-0000-0000-000000000001', 'MARCOS SILVA DE SOUZA', '56', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5d211487-f239-4d76-a4f2-54fa0e3c01a5', '00000000-0000-0000-0000-000000000001', 'PAULO ROGÉRIO DE CASTILHO', '55', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c2324e98-a082-4c55-9b1b-6b0a24f8ffff', '00000000-0000-0000-0000-000000000001', 'Odair José Cabulão', '63', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c0287d1d-89f4-450e-a9db-56fe7cc8a0a2', '00000000-0000-0000-0000-000000000001', 'Jeferson da Silva Vieira', '61', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d6f5a4a8-b72d-43d7-84d6-7a1b0f0c34ab', '00000000-0000-0000-0000-000000000001', 'João Dirceu Rasbold', '65', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('58d7f75b-a293-42e5-8f94-46d8f7817a5f', '00000000-0000-0000-0000-000000000001', 'Junior de Souza', '64', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c6b9a873-58bc-49ac-b4fa-dc0b57333c71', '00000000-0000-0000-0000-000000000001', 'Jessica Araujo Andrade Cabreira', '18', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0156bc77-f291-4c87-a629-8d8548484c99', '00000000-0000-0000-0000-000000000001', 'Pedro Adriano Soares de Moura', '66', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('73e6b328-07b7-4334-8965-244c474fb963', '00000000-0000-0000-0000-000000000001', 'IZAIAS VALDEZ FRANCO', '67', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7466b32c-b96c-4c6e-a3e7-6de7388aea82', '00000000-0000-0000-0000-000000000001', 'RENAN MARTINES DIAS', '140', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1fe0f694-7141-4a86-bf67-bb52ed29f076', '00000000-0000-0000-0000-000000000001', 'JEDER SANTOS DE OLIVEIRA', '20', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('230af15f-c7c4-4375-b6e7-e353bf708c17', '00000000-0000-0000-0000-000000000001', 'MARCOS GONÇALVES DA SILVA', '69', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8e7dcd06-d360-47ed-bc0b-b1f053137da5', '00000000-0000-0000-0000-000000000001', 'Odemir Coene de Moares', '21', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bb4ecdc7-cbc6-40a6-b4cb-aa8c809dd4e5', '00000000-0000-0000-0000-000000000001', 'ELISANGELA DA SILVA', '43', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('83c95e07-2b34-4dc4-a37c-354882886b68', '00000000-0000-0000-0000-000000000001', 'MAYARA LIMA DONOMAE', '460', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('63d77d64-cbd0-427e-b560-872104ec120c', '00000000-0000-0000-0000-000000000001', 'MAURICIO HIDEKI TAKARA', '24', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c637d3e4-906c-4e81-94f3-5a380c78c053', '00000000-0000-0000-0000-000000000001', 'VAINER VASCONCELOS PINHEIRO', '75', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1ee2481a-0231-4384-8346-acd1ccf4110c', '00000000-0000-0000-0000-000000000001', 'WILSON HANSEN', '76', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6e042520-ce65-4442-8372-52d6881fb74d', '00000000-0000-0000-0000-000000000001', 'CARLOS JOSE DA SILVA', '1390', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('28f1547e-888e-4460-8820-1c872ca3ca8b', '00000000-0000-0000-0000-000000000001', 'WANILTON DE ARAUJO CAMARGO', '79', 'MESTRE DE OBRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bce394f7-88f2-401b-801f-62fcab6d929f', '00000000-0000-0000-0000-000000000001', 'RENATO APARECIDO INACIO DA SILVA', '80', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a1bc58be-9b2f-4330-9adb-12a88eed83d5', '00000000-0000-0000-0000-000000000001', 'LEANDRO SOARES QUINTANA', '81', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ab403618-bf59-4cfb-88b9-3357b5f64a8e', '00000000-0000-0000-0000-000000000001', 'GIOVANE SEBASTIÃO BARBOSA', '25', 'ENTREGADOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c3492b86-8f9b-4c49-b310-f40ad63f4981', '00000000-0000-0000-0000-000000000001', 'HANDERSON CARDOZO DOS SANTOS', '27', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('794be8d6-6268-4296-afa6-568a88b25b7b', '00000000-0000-0000-0000-000000000001', 'UANDERSON VANZELLA', '84', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b6ec8703-dd9a-4138-be92-b06c403e2429', '00000000-0000-0000-0000-000000000001', 'CARLOS ANDRE HENRIQUE DOS SANTOS', '82', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('30ffe371-db31-46a5-9670-aa906b261b7a', '00000000-0000-0000-0000-000000000001', 'EDVANDRO FERREIRA BATISTA', '85', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('903587ca-cdf9-4ef2-956d-a7a8306f194a', '00000000-0000-0000-0000-000000000001', 'LUCIANO FLORES', '86', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3b43cc58-19e2-4c44-b40f-7a5036b21378', '00000000-0000-0000-0000-000000000001', 'RODOLFO FELIPE MARECO PALERMO', '88', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('99f4fd33-8255-453e-8960-24f0a6348a15', '00000000-0000-0000-0000-000000000001', 'ADAM NICOLAU MACHADO DA SILVA', '87', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('27d383dd-1746-4aba-812a-3d24df9111ef', '00000000-0000-0000-0000-000000000001', 'ADENILSO JOSE MARTELLI', '90', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('71527e37-60e2-4f6d-aefe-84a93410ffee', '00000000-0000-0000-0000-000000000001', 'EZEQUIEL PROENCA GOMES', '91', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('39513a6d-9b0b-4c60-9545-aa14574d7b57', '00000000-0000-0000-0000-000000000001', 'RONAN CARLOS MIRANDA', '94', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('10c29720-efa5-4d72-a894-9f686b2c6c2b', '00000000-0000-0000-0000-000000000001', 'OSMAR BERNARDO PEREIRA', '28', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6c241edb-b996-4db3-80d6-66b7a671103d', '00000000-0000-0000-0000-000000000001', 'NOEL FERREIRA DOS SANTOS', '92', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0dc92342-e646-4338-8771-efddc7c991b9', '00000000-0000-0000-0000-000000000001', 'ALCIDES CORRALES', '93', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b76c07ca-ae6c-436f-abe8-e2ed7464f8cf', '00000000-0000-0000-0000-000000000001', 'ERIVAN FERREIRA', '98', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('65b8fc72-0d2b-41e4-a515-eefd670238ca', '00000000-0000-0000-0000-000000000001', 'JAIR COSTA DE OLIVEIRA', '97', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('432f0a1f-6020-450f-a004-081066ae6359', '00000000-0000-0000-0000-000000000001', 'NIVALDO CENTURIAO ZARATINI', '96', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('67a6246b-987d-4032-9398-6f1b85b4cbc2', '00000000-0000-0000-0000-000000000001', 'HANDERSON CARDOZO DOS SANTOS', '290', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('19f56323-8788-4fcc-a68c-604f19e8685f', '00000000-0000-0000-0000-000000000001', 'EURICO RODRIGUES LIMA', '30', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('00049c82-8601-4626-ba4a-7f1f067170bb', '00000000-0000-0000-0000-000000000001', 'VALDENIS DOS SANTOS MAGALHAES', '103', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e208cdbe-9ce1-47a8-84ff-fcab66110910', '00000000-0000-0000-0000-000000000001', 'JOAO DIRCEU RASBOLD', '104', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d8a4e09c-8757-4435-9790-5f4b22383a9f', '00000000-0000-0000-0000-000000000001', 'UILSON RAMAO BELO', '1030', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5d11e99f-ad5b-4ebc-b28e-b6f9b3f57940', '00000000-0000-0000-0000-000000000001', 'ANTONIO APARECIDO PEREIRA', '199', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2de38284-640b-4bb8-95e0-277e4ab9f174', '00000000-0000-0000-0000-000000000001', 'GUSTAVO FERNANDES DA SILVA', '32', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e5617647-6f9b-4284-813c-e50cbec0847c', '00000000-0000-0000-0000-000000000001', 'RAIMUNDO MORALES MACHADO', '33', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e6e059fb-9dd0-48f7-80e2-a4f25728165e', '00000000-0000-0000-0000-000000000001', 'GABRIEL DE ALENCASTRO MENEZES', '107', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('48a6a7b9-43c3-47b0-b8a8-9a522e125d1a', '00000000-0000-0000-0000-000000000001', 'GERALDO J C CUNHA FILHO', '1008', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bdc0560a-6153-47bb-8c78-7bb51e0a1880', '00000000-0000-0000-0000-000000000001', 'JOSE ANTONIO DOMINGUES', '73', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f3b34a89-f18d-4265-8318-9a42543c105e', '00000000-0000-0000-0000-000000000001', 'JHULIA APARECIDA COELHO SALES', '340', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6c505217-1ba8-4319-95eb-089fccf164bd', '00000000-0000-0000-0000-000000000001', 'MANOEL MACHADO LEONARDO FILHO', '1090', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('21f6cfb3-5c13-4320-832c-5d317e459a1e', '00000000-0000-0000-0000-000000000001', 'PAULINO FRANCISCO DE OLVEIRA', '142', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4a983281-0787-474d-824f-f770e3823186', '00000000-0000-0000-0000-000000000001', 'ANDERSON BORGES CORREA', '15', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8ea35f08-4e33-4d44-ba39-902be6d509d0', '00000000-0000-0000-0000-000000000001', 'DAVI ROCHA', '95', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d2cd8297-22d7-4d2c-b4cd-878d81c77c52', '00000000-0000-0000-0000-000000000001', 'ADAIR FELIPE ROSA', '155', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2237c431-b88e-4935-b50a-866040978e81', '00000000-0000-0000-0000-000000000001', 'JOAO VALDIR PIMENTEL CAVALHEIRO', '36', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c7173021-c6dd-446d-8105-a81b35482afa', '00000000-0000-0000-0000-000000000001', 'DANIEL PAULINO DE SOUZA', '1160', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('63e7451e-4afd-482d-874d-122ee4caab5b', '00000000-0000-0000-0000-000000000001', 'ANDERSON LUIZ DE MIRANDA', '1150', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b7e94025-815f-47f9-90a5-4a110931d775', '00000000-0000-0000-0000-000000000001', 'EDISON LOVERA PALHANO', '1130', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8799dd33-e74a-46bb-a536-231bb55e5292', '00000000-0000-0000-0000-000000000001', 'JOAO MARCOS FERMINO', '1170', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('85afc412-1f09-452a-9bf8-201ffd95fdec', '00000000-0000-0000-0000-000000000001', 'MARCIO APARECIDO FLORES', '1180', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6dd27465-517f-470c-b3e6-85222b9752be', '00000000-0000-0000-0000-000000000001', 'CLEBERSON RAMAO ALMEIDA', '151', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4fd127dd-f808-460d-b780-2c9a919807ab', '00000000-0000-0000-0000-000000000001', 'ERONILDA CRISTINA MENDES', '1210', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f8eab464-b438-4d0d-87fe-a67ab833f108', '00000000-0000-0000-0000-000000000001', 'FERNANDO RUSTICK DA SILVA', '1220', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('01d4dbf3-6510-48cf-82aa-c2475a163fb5', '00000000-0000-0000-0000-000000000001', 'WEVERTTON ALVES DOMINGUES', '1240', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('000876c8-e663-4d25-ac89-d8a1d9eb2081', '00000000-0000-0000-0000-000000000001', 'L60F F06', 'L60F F06', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('205d79b8-f503-46ff-9dcf-cbed2dfcfd71', '00000000-0000-0000-0000-000000000001', 'CB 2425', 'CB 2425', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('03467fc9-4d7b-46d2-b98f-71001d7ec0cf', '00000000-0000-0000-0000-000000000001', 'CB 26260', 'CB 26260', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('82a7120a-e479-48e5-a7a1-5c9445a464df', '00000000-0000-0000-0000-000000000001', 'L60F F03 FARELO', 'L60F F03 FARELO', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bd73759b-2199-433e-bfe8-4096d767180c', '00000000-0000-0000-0000-000000000001', 'JOHN DEERE GRUA', 'JOHN DEERE GRUA', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a64ac8c8-3fca-4f1d-bf19-e204033967dc', '00000000-0000-0000-0000-000000000001', 'ARNOBIO AGUEIRO', '380', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bf1a6625-06f6-4755-9a8d-93d3ebaa5435', '00000000-0000-0000-0000-000000000001', 'EDVANDO DOS SANTOS ANDRADE', '1260', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e19b5194-97ce-470d-80ce-8deedf8c51f8', '00000000-0000-0000-0000-000000000001', 'RODRIGO BORBA BARBOSA', '49', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a2d34297-7fef-49c1-bbba-7f4ed21770ab', '00000000-0000-0000-0000-000000000001', 'DORIVAL DOUGLAS DA SILVA', '1290', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('149560ea-7fab-4caa-843a-ffdd03b91fd7', '00000000-0000-0000-0000-000000000001', 'CB 31320', 'CB 31320', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('af614d24-8058-473e-a148-2e3f96985d9d', '00000000-0000-0000-0000-000000000001', 'VALDENIS DOS SANTOS MAGALHAES', '1280', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('602c254c-75ff-4b6b-a65b-ed64e12b6973', '00000000-0000-0000-0000-000000000001', 'ADAO SILVEIRA MARQUES', '150', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6250be44-a2b0-4186-9fe0-2f470e7c2836', '00000000-0000-0000-0000-000000000001', 'BRUNO MIRANDA DE LIRA', '40', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bc7486ae-f1ff-49fb-aae7-390372f2eb57', '00000000-0000-0000-0000-000000000001', 'MINI CARREGADEIRA', 'MINI', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('246a70e2-91e8-4e6d-9a06-d093dda37bd2', '00000000-0000-0000-0000-000000000001', 'VALDENIR ARRUDA FRANCO', '136', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b4afd1d4-1899-4288-8cf1-70bf76e038ba', '00000000-0000-0000-0000-000000000001', 'FABIO JUNIOR ALVES', '135', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c42bf7d7-8346-49c2-bd3a-626541707c99', '00000000-0000-0000-0000-000000000001', 'EDVALDO DANTAS SANTOS', '134', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7225d3d7-1c1a-4514-bfa5-a0f7ee0e7788', '00000000-0000-0000-0000-000000000001', 'EC SDLG FROTA 04', 'EC SDLG FROTA 04', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5bc71243-e2c8-44c0-870a-83493fabb026', '00000000-0000-0000-0000-000000000001', 'EC SDLG FROTA 03', 'EC SDLG FROTA 03', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c70eec17-27ff-41bb-be73-27aa7eec7fb1', '00000000-0000-0000-0000-000000000001', 'JOSÉ FRANCISCO SILVA DOS SANTOS', '139', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dad86b5a-a97f-4403-a2f3-18d5ce106060', '00000000-0000-0000-0000-000000000001', 'L60F F02', 'L60F F02', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1814e0a2-9980-4477-b504-08c04ffa053f', '00000000-0000-0000-0000-000000000001', 'PC 930K', 'PC 930K', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('64a9a3bf-3eb0-4538-8034-91c82b1ab4eb', '00000000-0000-0000-0000-000000000001', 'EC EC140 F01', 'EC EC140 F01', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('15976a11-10aa-4ce9-9b31-b24f4d4e2840', '00000000-0000-0000-0000-000000000001', 'MOTONIVELADORA VOLVO 01', 'MN 01 VOLVO', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f36a564e-ed6e-4235-8f08-487b59a536f4', '00000000-0000-0000-0000-000000000001', 'EDILSON APARECIDO TOBIAS', '137', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f6e6afe5-b5cf-4d22-94fd-6cb1be4c7d6f', '00000000-0000-0000-0000-000000000001', 'NIVALDO FRANCO DA SILVA', '145', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2904b16a-a3d1-45d2-ad93-3be6fff4d8c7', '00000000-0000-0000-0000-000000000001', 'JOSE APARECIDO MACEDO DA SILVA', '1400', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('006b2fc9-6246-4070-9d62-9542d8857688', '00000000-0000-0000-0000-000000000001', 'AURY DE LIMA BARBOSA FILHO', '146', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('70eab9eb-68a9-4c09-bce1-afb6dad93cda', '00000000-0000-0000-0000-000000000001', 'JOSE AUGUSTO DE LIMA PEREIRA', '147', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('76ddfc3c-fffe-4246-9cbb-13c2e6602361', '00000000-0000-0000-0000-000000000001', 'LEOCARLOS SOARES BECKER', '1460', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e06a7ded-25d3-4a26-b191-f98a3162ac4a', '00000000-0000-0000-0000-000000000001', 'ABEL RODRIGO VIDAL', '149', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('972e3d43-65bf-45f9-befb-3283ee726420', '00000000-0000-0000-0000-000000000001', 'MN 08 782012', 'MN 08 782012', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8f16df89-26d3-4b58-a302-4abe837cf5ac', '00000000-0000-0000-0000-000000000001', 'MN 02 782011', 'MN 02 782011', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('90d139fe-1e3e-474e-8429-4005b56645ad', '00000000-0000-0000-0000-000000000001', 'VALDECI BEZERRA DA SILVA FARIAS', '138', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('35bb8a5b-4dfe-472e-9dfb-4d07f6f9be99', '00000000-0000-0000-0000-000000000001', 'JOSE MANOEL DE ANDRADE', '152', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b177c295-ca8a-4d3e-9f79-67e6f324d2e6', '00000000-0000-0000-0000-000000000001', 'MARCOS ROBERTO DA CUNHA VENIAL', '1420', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0a3ed654-34db-4d24-b135-81e19d03fbda', '00000000-0000-0000-0000-000000000001', 'JOAO MARQUES DOS SANTOS', '1450', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0d722a80-f773-44e3-825e-74e1a781d3b7', '00000000-0000-0000-0000-000000000001', 'CLEUDIMAR SANTANNA', '1430', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9c507ae2-f877-4b5e-a4fa-2e33efa654a3', '00000000-0000-0000-0000-000000000001', 'WEVERSON CHARLEY PINTO DA SILVA', '1550', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9b5332ff-714f-469a-be8c-5172f1e1a0bc', '00000000-0000-0000-0000-000000000001', 'CICERO FERREIRA DOS SANTOS', '153', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e6df46c6-7557-46ea-9b6f-29e9d90eed2d', '00000000-0000-0000-0000-000000000001', 'EC EC220D F02', 'EC EC220D F02', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('084ca00c-672a-4090-8361-d4610e06a086', '00000000-0000-0000-0000-000000000001', 'F05 KOMATSU', 'F05 KOMATSU', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('59514347-0241-40da-93b5-1927bd787282', '00000000-0000-0000-0000-000000000001', 'CLAUMIR COLETA DE SOUZA', '400', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ac6277c3-85e5-4d1c-adff-581c9f8aa8ae', '00000000-0000-0000-0000-000000000001', 'DAMIAO PINTO DE ALMEIDA', '156', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d190b1d9-63e0-435c-ae9c-c044ce1e23ea', '00000000-0000-0000-0000-000000000001', 'ILTON ANTONIO DOS SANTOS', '159', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cbde72fe-d3ed-4893-8ac3-17a22d91f320', '00000000-0000-0000-0000-000000000001', 'HELIO DOS REIS', '158', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('16708132-a927-4ba0-b5ac-075e6cf6d93e', '00000000-0000-0000-0000-000000000001', 'ERICK TEIXEIRA DE CALDAS CORDEIRO', '162', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('84059cc9-74b5-4295-bc7a-4146bea8cbf1', '00000000-0000-0000-0000-000000000001', 'JHULIANO DE MATOS ROSIM', '161', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d6b34350-1617-4891-b2ac-834a12fbc1a6', '00000000-0000-0000-0000-000000000001', 'TAINARA CARDOSO RIBEIRO', '12', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f7ff7863-11bb-408c-bac2-f0fc05301a90', '00000000-0000-0000-0000-000000000001', 'EDERSON SILVA PEREIRA', '160', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('41301940-8f3a-4f30-b232-237b09dbead6', '00000000-0000-0000-0000-000000000001', 'PAULO TOMAZ DE AQUINO', '166', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a715f5db-62ed-459b-b26b-b7e43c16790b', '00000000-0000-0000-0000-000000000001', 'DERCIO PEREIRA ANJOS', '164', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d1c8c287-be2f-4b87-affa-7e3c2b1a4520', '00000000-0000-0000-0000-000000000001', 'REINALDO RAFAEL DE BRITO', '170', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('05d6b2fc-d957-40a7-adab-ffaa7a199240', '00000000-0000-0000-0000-000000000001', 'ENOCK MOREIRA DE MENEZES JUNIOR', '165', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a5044ef5-47f7-49ea-9cb8-141c5b5b94d3', '00000000-0000-0000-0000-000000000001', 'DANIELA CIRIACO DA SILVA CAMPOS', '14', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3e86c97d-899c-4b96-ace0-909c8fc883e0', '00000000-0000-0000-0000-000000000001', 'ISOLINO VILHALBA DE OLIVEIRA', '210', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('faca2996-a159-4f91-bfcf-1b14ea88212b', '00000000-0000-0000-0000-000000000001', 'ALEXSANDRO WILDNER', '200', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9b45d72e-9bb6-4100-b5c6-56d6e23f7494', '00000000-0000-0000-0000-000000000001', 'PAULO HENRIQUE BITTENCOURT FERREIRA', '50', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('45d80b54-2121-4e76-83b1-492486d713a3', '00000000-0000-0000-0000-000000000001', 'MAGNO ANDRE BEZERRA CHAMORRO', '51', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4d01c0e2-15af-48c6-b820-2cc3f490b897', '00000000-0000-0000-0000-000000000001', 'ALEXSANDRO SILVA RIBEIRO DE SANTANA', '52', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4782760a-4588-4f35-b025-b869cd62a809', '00000000-0000-0000-0000-000000000001', 'EDENILSON LIMA MAURENCIO', '53', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0d92af1f-0ff1-4999-912b-f7d71cffa537', '00000000-0000-0000-0000-000000000001', 'LEONIDIO GONÇALVES ROCHA', '46', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f06e863b-0969-4963-b741-686eec898156', '00000000-0000-0000-0000-000000000001', 'KAUAN MARTINS ROJAS', '19', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f2bd18c4-e48a-46aa-93b3-44aa7677a0e9', '00000000-0000-0000-0000-000000000001', 'ANDERSON JOSE SANTOS', '1', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4d1ab1d7-247a-461e-8252-498ee1862b7c', '00000000-0000-0000-0000-000000000001', 'FERNANDO HENRIQUE DE MELO', '1700', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('109bc2cb-432a-4cef-9734-4164e3336731', '00000000-0000-0000-0000-000000000001', 'LILIANE PRIMO RISSATO', '1600', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('adb5000c-0323-4c92-9917-63b706a5c60d', '00000000-0000-0000-0000-000000000001', 'MARCOS PEREIRA SOBRINHO', '54', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1acf9955-8400-411e-b425-6e144a71c50c', '00000000-0000-0000-0000-000000000001', 'JOSE APARECIDO ARCANGELO', '610', 'FUNILEIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e964392d-83d4-4305-a1f3-42b34541db8b', '00000000-0000-0000-0000-000000000001', 'LUCAS MOREIRA ROSA', '62', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8ea75bd7-a767-4d79-8533-8cca9b94318b', '00000000-0000-0000-0000-000000000001', 'BRUNO FERNANDO DOS SANTOS CANTEIRO', '31', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9a30d88e-60af-416d-93a5-8cba3ba64e82', '00000000-0000-0000-0000-000000000001', 'BRENO MATIA RIBEIRO', '560', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('535bb902-3e42-4117-bf91-5ba7330ecd69', '00000000-0000-0000-0000-000000000001', 'TATIANE DIAS JARA GARCIA', '190', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('efe1f0f9-df75-4517-8d66-c9948c2b2727', '00000000-0000-0000-0000-000000000001', 'CARLOS JOSE MENDES', '180', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0e82b7a7-41d0-4799-9d99-f774af104a83', '00000000-0000-0000-0000-000000000001', 'ALEX BARBOSA', '171', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3db7cbed-db68-4e4e-bda3-9ee236866a2f', '00000000-0000-0000-0000-000000000001', 'EDSON DA SILVA BATISTA', '68', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('22117f56-d001-41b7-a097-32c696b62aed', '00000000-0000-0000-0000-000000000001', 'JORDELINO MARQUES MIRANDA', '620', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('32d015d6-c483-4536-9212-67430fef7ffe', '00000000-0000-0000-0000-000000000001', 'REGES AUGUSTO FRUBEL CAVILHAS', '630', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fd21ee0c-fabd-48ec-95ff-c35ddf4c80f5', '00000000-0000-0000-0000-000000000001', 'BONIFACIO ITURVE', '71', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ec8d0263-6607-449a-8edd-1a2433ce0cd6', '00000000-0000-0000-0000-000000000001', 'JEFFERSON DANILO DE OLIVEIRA AZEVEDO', '192', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('566501d0-1f01-4495-9daa-3074f8ad22be', '00000000-0000-0000-0000-000000000001', 'DAVI MORAES', '74', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fb54b172-9e1f-4faa-a70a-6a23de9cfcba', '00000000-0000-0000-0000-000000000001', 'LIDIO BORGES PEREIRA', '72', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('faed17bc-29ab-4d7b-a8be-74984d9be55f', '00000000-0000-0000-0000-000000000001', 'LUCIANO BARBOSA ARCE', '77', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('94945288-1ca5-46fc-88b8-04deefc7f255', '00000000-0000-0000-0000-000000000001', 'OZEIAS DORNELES FERREIRA', '78', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('16eedca9-7c34-44f9-953d-586d75a5a49a', '00000000-0000-0000-0000-000000000001', 'TAISSA AZAMBUJA BRONEL', '99', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('08bb13be-ea27-4c2d-bce9-99f0b7c2e489', '00000000-0000-0000-0000-000000000001', 'RONALDO ALMEIDA DOS SANTOS', '83', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('55668ac7-af98-4654-9ed3-0b29e360bec3', '00000000-0000-0000-0000-000000000001', 'WALMIR DA SILVA', '89', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2f898364-376a-49d5-a754-5edb8024a064', '00000000-0000-0000-0000-000000000001', 'VALDEMIR CASTELLINI', '132', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6cd90607-b3f6-48e8-b18c-27d196ce9acc', '00000000-0000-0000-0000-000000000001', 'LEONIDAS DA CUNHA VENIAL', '109', 'MESTRE DE OBRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('db25f872-e11a-4f00-b018-24d53c798667', '00000000-0000-0000-0000-000000000001', 'JOSE BERALDO DA SILVA NETO', '1011', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('81c63e50-8cf2-4e2e-aac7-fa0f9917c88e', '00000000-0000-0000-0000-000000000001', 'EDER FRANCISCO DA SILVA', '178', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('00e9f04a-a0e0-44e8-abc3-d1020ad098fc', '00000000-0000-0000-0000-000000000001', 'MARCIO RIOS YAMADA', '179', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('06a10dc4-c70c-4a53-a12a-090b827c18b8', '00000000-0000-0000-0000-000000000001', 'CARLOS MAGNO VAES DA SILVA', '222', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('17bd4f37-3fad-488e-9aef-23a520bb27c4', '00000000-0000-0000-0000-000000000001', 'NELSON ALVES CARDOSO', '1234', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9538a2e3-4d59-4a79-a17f-98764e64074e', '00000000-0000-0000-0000-000000000001', 'CICERO GONÇALVES DA SILVA', '1235', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ba660263-953c-4f66-98bc-b1f6a805f008', '00000000-0000-0000-0000-000000000001', 'REGINALDO BARBOSA DO PRADO', '8084', 'FUNILEIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ebb8e4d4-779c-470d-911a-290901fc04df', '00000000-0000-0000-0000-000000000001', 'EDMILSON FRANCO', '1330', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('51e5c6c0-966e-4f1b-83e6-9c5beb4c2228', '00000000-0000-0000-0000-000000000001', 'JHULIANO DE MATOS ROSIM', '770', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f9b5c837-385b-47af-809c-c68ddd92dbed', '00000000-0000-0000-0000-000000000001', 'GILSON MARCOS VERON BRANDAO', '1044', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('45325f55-b82f-4435-b441-e4530b93b5bc', '00000000-0000-0000-0000-000000000001', 'JOAO CARLOS LOURENÇO DE OLIVEIRA', '1045', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6c760d38-a5c8-4cfb-8a61-cbd08610a526', '00000000-0000-0000-0000-000000000001', 'PEDRO RIBEIRO DA SILVA', '1046', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('89ce5c79-c507-4daf-ac35-60adbe99cd1b', '00000000-0000-0000-0000-000000000001', 'SIDNEY MACHADO DE SOUZA', '1047', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('20a2667a-9ca8-4e34-ac31-c59a2bed116a', '00000000-0000-0000-0000-000000000001', 'WELLINGTON CORREIA DE ARAUJO', '456', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7a36cb1f-e1f6-4849-b1cf-ceb9a8ae428f', '00000000-0000-0000-0000-000000000001', 'VINICIUS DA SILVA RIBEIRO ARANDA', '457', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('419a9c9e-0e29-4c3d-bd56-192ead0d0157', '00000000-0000-0000-0000-000000000001', 'RONALD SANTANA LIMA', '234', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('12681938-5d75-40dc-b0c2-864e008f3000', '00000000-0000-0000-0000-000000000001', 'GUSTAVO GODOI ASSUNÇAO RIBEIRO', '235', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0facae22-84b8-4ffd-9c32-7b6aaf94be8d', '00000000-0000-0000-0000-000000000001', 'DANIEL FERREIRA LOBO', '236', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1b680e0f-6052-424e-b5f9-7412c74c2c98', '00000000-0000-0000-0000-000000000001', 'CLEBER MORAES SIDES', '237', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('237089e5-b2fc-4720-b2e6-1bb23318e240', '00000000-0000-0000-0000-000000000001', 'ARNALDO DE LIMA BATISTA', '238', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f8e66f23-211c-440d-abb6-812c73286afd', '00000000-0000-0000-0000-000000000001', 'DAIANE MARTINS NOVACHINSKI', '239', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('031ce59e-824a-4e71-bfa8-236ae02c66b9', '00000000-0000-0000-0000-000000000001', 'OSORIO CARVALHO NETO', '240', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('007db91d-437d-4a7e-a87b-e5086a9a6f02', '00000000-0000-0000-0000-000000000001', 'DANIEL VASCONCELOS OLIVEIRA', '241', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6a2c4592-42cf-4428-a13a-76d06ba9a453', '00000000-0000-0000-0000-000000000001', 'EUDES BABETTO ROCHA FERBONIO', '1452', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('bd167b01-315e-4024-ae2b-827b3e5e6d58', '00000000-0000-0000-0000-000000000001', 'ENIO SILVA ROSA FILHO', '1010', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5aa684ce-15fd-4dce-b662-238fb814b401', '00000000-0000-0000-0000-000000000001', 'CLAUDINEI PEREIRA DE SOUZA', '1012', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c86fed27-b466-4584-bcee-b846181743e4', '00000000-0000-0000-0000-000000000001', 'CARLA LUCAS MENDES SILVA', '2345', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3b56a00c-2367-47c6-b37f-a2f837dd7bb9', '00000000-0000-0000-0000-000000000001', 'LUIZ CARLOS PEREIRA SOARES', '2346', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('262bb949-90f7-40f2-9f20-abcc4805bcf1', '00000000-0000-0000-0000-000000000001', 'DAVI MESSIAS ALVES', '2347', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9c0e60c3-72de-4933-be1c-accb180bf07a', '00000000-0000-0000-0000-000000000001', 'ALINE ANIELEM WINCLER DUARTE', '2348', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('185f960f-68d4-4a77-a6d4-80ea71cd6ae8', '00000000-0000-0000-0000-000000000001', 'ANDRE GABRIEL SANTOS CAMPOS', '2349', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b07346cf-0773-4faf-ae73-92ddc9db0c70', '00000000-0000-0000-0000-000000000001', 'SHEILA CRISTINA BARBOSA TORRES', '2350', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e8819e34-1356-4270-bd89-8d7089fbb21e', '00000000-0000-0000-0000-000000000001', 'ISAQUE RODRIGUES DE SOUZA', '2351', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('46dd22b5-86d0-4ed8-8b45-ea3ba98b83b9', '00000000-0000-0000-0000-000000000001', 'JOSUE BALBUENA CANDADO', '2353', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a7608e30-500d-404b-bdaa-a9e725792ad5', '00000000-0000-0000-0000-000000000001', 'LUIS ANTONIO CARDOSO DE SOUZA', '2354', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('74b070f5-0556-48ca-a7cc-0b33328682cb', '00000000-0000-0000-0000-000000000001', 'MARCOS LOPES RAMAI', '2355', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9ac60ad3-b093-40cc-9ffe-c59ed08431f0', '00000000-0000-0000-0000-000000000001', 'DANIEL PARREIRA DE AZEVEDO', '2356', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('67ab06bd-fb51-4e58-a33a-59434d930475', '00000000-0000-0000-0000-000000000001', 'AGNALDO PEREIRA', '2357', 'ENTREGADOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('43cef120-24c3-40d6-8977-a6b684a4786a', '00000000-0000-0000-0000-000000000001', 'ORANGEL MANUEL PEREZ RAMOS', '2587', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fc97b2d2-2a88-49c3-b49b-7152c2f87c40', '00000000-0000-0000-0000-000000000001', 'FRANCISCO BISPO NETO', '2458', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('491402c6-2a17-4375-8614-8325ed21cc54', '00000000-0000-0000-0000-000000000001', 'LUIZ FERNANDO MARCONDES RIBERO', '2459', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('336dfa56-726f-4d9c-975e-fe7f6763e371', '00000000-0000-0000-0000-000000000001', 'CARLOS ALBERTO VILALBA CAMPOS', '2578', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9b31481d-1f9a-4a8e-adfe-37ddca2b7cdf', '00000000-0000-0000-0000-000000000001', 'PAULO CEZAR PIMENTEL MARQUES', '2579', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('751ea03c-ceb0-4b7f-b3be-7a362e6f960f', '00000000-0000-0000-0000-000000000001', 'CB 31320 II', 'CB 31320 II', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aa14bd37-8d4e-4a45-951f-1bb9b712a658', '00000000-0000-0000-0000-000000000001', 'WANILTON CAVALHEIRO OLIVEIRA', '2589', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b362d320-e83d-4d37-859d-f9c0e95ad207', '00000000-0000-0000-0000-000000000001', 'DAYANE ROJAS MARTINELLI SANTANA', '2358', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('96abf6f6-a9cd-4391-a9ed-7e779db18112', '00000000-0000-0000-0000-000000000001', 'JOSIVAN NASCIMENTO DE SOUSA', '2359', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('89bf11a4-09a6-4808-b203-7e8b42dfe54e', '00000000-0000-0000-0000-000000000001', 'JOSE LINDOMAR DOS SANTOS SEGUNDO', '2560', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e506a44c-eafd-4b8b-8e78-6720d5903df3', '00000000-0000-0000-0000-000000000001', 'MAYANA APARECIDA BERTA', '1500', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b4d16663-4c12-4393-aa6c-98e280a612b2', '00000000-0000-0000-0000-000000000001', 'HENRIQUE OLIVEIRA THOMAZ SOUSA', '2489', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b66d0310-2815-42a9-8ec5-17fa78a8c391', '00000000-0000-0000-0000-000000000001', 'JOSE WILSON DE OLIVEIRA RAIL FILHO', '2479', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('86e96480-9683-4b1d-ab59-21b4f7aa4126', '00000000-0000-0000-0000-000000000001', 'IZABELA FERNANDES ARAUJO', '2496', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6ac03c70-3b5f-443c-aaac-05f4f95fe705', '00000000-0000-0000-0000-000000000001', 'EDUARDO MAXIMO ANTONIO', '2497', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('407772cf-04bc-4315-8a7c-934e41735aaf', '00000000-0000-0000-0000-000000000001', 'CLAUDINEIA DE OLIVEIRA', '2490', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0d038347-1f37-403b-9325-c3f1205b9915', '00000000-0000-0000-0000-000000000001', 'GENEZIO DA COSTA', '2491', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('134c525b-6acc-4a54-a75b-e3b9554edf20', '00000000-0000-0000-0000-000000000001', 'VICTOR VARGAS VIEIRA', '2360', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('43f71300-6101-4cff-a2cd-1065eccfdc02', '00000000-0000-0000-0000-000000000001', 'DOUGLAS HENRIQUE BADIA DE SOUZA', '2361', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('32a6ce84-3e65-4146-b325-bd9ded12ae9a', '00000000-0000-0000-0000-000000000001', 'VALDINEI CARDOSO BARBOSA', '2362', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6695166d-f1b6-48ed-989c-a4b4d2e6b4e2', '00000000-0000-0000-0000-000000000001', 'DONIZETTE DA SILVA PEREIRA GOMES', '2363', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0107b288-1226-4fcf-a9c7-a50cf7aa730d', '00000000-0000-0000-0000-000000000001', 'ADISON ARAUJO SILVA', '2364', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4367c915-1e69-4f71-8163-1465325409d1', '00000000-0000-0000-0000-000000000001', 'GIOVANY MOREIRA MARCELINO', '2366', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f951a762-5792-49d2-b68c-b91e2d2cafff', '00000000-0000-0000-0000-000000000001', 'MARIO MARCIO DOS SANTOS', '2370', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('013f5982-6f93-4e96-9db0-6323e095819f', '00000000-0000-0000-0000-000000000001', 'ALEXANDRE GUSTAVO DA SILVA', '2598', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f4fbad40-cd07-462d-81eb-11767ac4e95f', '00000000-0000-0000-0000-000000000001', 'ELVIS CLEITON STEILDEL CAVALCANTI', '2599', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aa3d2956-6ace-4e9d-bce2-b16a61fdf9bc', '00000000-0000-0000-0000-000000000001', 'DILVO GARCIA REZENDE', '5269', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dfd13b57-675d-46a2-bc1f-00315a7a61e6', '00000000-0000-0000-0000-000000000001', 'JOSE HENRIQUE COSTA DO NASCIMENTO', '2566', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('15725455-9435-42d3-be68-0deeedbe9f76', '00000000-0000-0000-0000-000000000001', 'TALISSON RENAN DA SILVA OLIVEIRA', '2519', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('54841e16-f3da-4f2c-b913-38a33776ab79', '00000000-0000-0000-0000-000000000001', 'ANTONIO CARLOS PAULO DE MACEDO', '2590', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1d1b23c8-42bb-4171-ad35-0d6017a6e1a7', '00000000-0000-0000-0000-000000000001', 'KELLY DAIANE DOS SANTOS', '2389', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c0f98ef5-60a5-4a0c-adc6-c04bcd260876', '00000000-0000-0000-0000-000000000001', 'FRANCESAR AUGUSTO MARQUES', '2369', 'ENTREGADOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('978cada2-2d27-479c-b6c0-bc6884b63edc', '00000000-0000-0000-0000-000000000001', 'CICERO MARQUES DOS SANTOS', '2399', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0bc430e5-a058-41a3-b93b-a3bf977ddaa8', '00000000-0000-0000-0000-000000000001', 'JONES CARVALHO DA ROSA', '2385', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f0d43f12-e197-4d58-a82b-05c9619dce65', '00000000-0000-0000-0000-000000000001', 'GUILHERME FERREIRA DE ANDRADE', '65985', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('15567c0e-fdd0-45f1-bad1-04d4a0b836b4', '00000000-0000-0000-0000-000000000001', 'Henrique Pereira Nahabedian', '89544', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9cdb082c-47c6-461d-b3e4-e721dcf9691a', '00000000-0000-0000-0000-000000000001', 'Jhonatan Martins de Oliveira', '548714', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('eb4e131b-e998-46a4-bdd0-4c7bcd41b82a', '00000000-0000-0000-0000-000000000001', 'Adrieli Aquino Sanches', '84254', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('87c6b615-5deb-4629-8b2f-a5f73cfc95c2', '00000000-0000-0000-0000-000000000001', 'DIEGO RODRIGUES DANTAS', '56598', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aad4210e-91ef-407d-a8b5-493ec163ac9a', '00000000-0000-0000-0000-000000000001', 'VILMA MORAES DE SOUZA', '2511', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0a1a9adb-b9ea-41aa-9081-460974fe3a7a', '00000000-0000-0000-0000-000000000001', 'ISAIAS MESSIAS GABRIEL', '2512', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a92ab989-d348-4f3e-8655-73475bf8d081', '00000000-0000-0000-0000-000000000001', 'GLEICIELE IARA LIMA', '2513', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('05de3db9-5658-40c2-af97-94ef28346e68', '00000000-0000-0000-0000-000000000001', 'VALDELINO ANGELO DOS SANTOS', '2514', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('101ad8be-b92c-47ee-8295-ce9938ce1689', '00000000-0000-0000-0000-000000000001', 'NILSON VALERIO DE ASSUNCAO', '2515', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a775d7a5-0bdb-4141-abb7-14c25839ff92', '00000000-0000-0000-0000-000000000001', 'DEBORA MENDONÇA RODRIGUES', '2516', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('15250307-66e5-498f-808c-985b7e3b2291', '00000000-0000-0000-0000-000000000001', 'IGOR WILLIAN ORTEGA CAMARA', '2517', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('93dde50f-8d11-4265-a785-01ffbcd23728', '00000000-0000-0000-0000-000000000001', 'PIETRA DE SOUZA SALUM', '9856', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3f23c324-991b-42d2-97fe-1cfa0fdfc7a1', '00000000-0000-0000-0000-000000000001', 'GERCI PORTILHO DE OLIVEIRA', '8456', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7290b1eb-d293-4860-a979-b82720440397', '00000000-0000-0000-0000-000000000001', 'JAIRO ANDRE KRONBAUER', '5472', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('96b51afb-81dd-4317-a712-d6d984072efb', '00000000-0000-0000-0000-000000000001', 'ALICE VITORIA GARCIA PEREIRA DE OLIVEIRA', '64855', 'OPERADOR (A) DE CAIXA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6d24c710-fe1b-4e5e-9be8-8f099b487de8', '00000000-0000-0000-0000-000000000001', 'JOSE ALFREDO FONTEN LEZAMA', '7854', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('dd1ad4ee-4441-4b74-9952-4adfbfeb3611', '00000000-0000-0000-0000-000000000001', 'PAULO VERMIEIRO DO NASCIMENTO', '16514', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0896bf05-62cb-48e7-9177-6bf9232f72f3', '00000000-0000-0000-0000-000000000001', 'LUCAS RODRIGUES JUSTINO BONFIM', '87654', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1c07ae1b-b836-4504-927f-e21bbe25d1e7', '00000000-0000-0000-0000-000000000001', 'RUI NELSON CORREIA DOS SANTOS DE CARVALHO', '45468', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b86d8015-20f4-4ac0-bc30-d09d034c6bce', '00000000-0000-0000-0000-000000000001', 'IVALDO JOSE DE LIMA', '154354', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e5486f34-ffa7-45d3-b373-b2b1325c1aed', '00000000-0000-0000-0000-000000000001', 'EMERSON ALEX MATOS SANTANA', '45268', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('89d52e96-4f3a-4675-8fac-e571ba8ea141', '00000000-0000-0000-0000-000000000001', 'RAFAEL GONZAGA SCHMIDT', '4138', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2eb40f5a-9305-4092-ae96-58e19470fc82', '00000000-0000-0000-0000-000000000001', 'EZEQUIEL DE MORAIS GONZAGA', '1532', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e804c2cd-f88e-4a9e-b106-70dfb8848b39', '00000000-0000-0000-0000-000000000001', 'EFRAIM DA SILVA SOUSA', '4587', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fb55f469-1e50-4851-a186-08c7494efde4', '00000000-0000-0000-0000-000000000001', 'CAIO HENRIQUE DE OLIVEIRA', '4698', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5a4f2c0a-37f5-47f9-9380-d628fb5fde6a', '00000000-0000-0000-0000-000000000001', 'CRISTIANO GONZAGA DA ROCHA', '5179', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d283ecbe-1000-49f0-aba2-3e7bedc4b5b6', '00000000-0000-0000-0000-000000000001', 'RODRIGO DE OLIVEIRA PITTERI', '6589', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('78a27865-9894-4044-9332-cabdab697eeb', '00000000-0000-0000-0000-000000000001', 'FABIANE CASSARI DE OLIVEIRA', '4564', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b2ad36de-89ce-4c3d-b837-8882817311f3', '00000000-0000-0000-0000-000000000001', 'PEDRO CARLINHOS PEREIRA', '2677', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e774ed6d-fb4d-4816-8b10-e5f687b3ac43', '00000000-0000-0000-0000-000000000001', 'IGOR GOMES PEDROSO', '2591', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f6becd1a-511e-4d35-a0e5-4baecd2bb254', '00000000-0000-0000-0000-000000000001', 'ANA PAULA GONCALVES LIMA', '2592', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5f7c356f-90e5-4480-ac04-df6f6505647d', '00000000-0000-0000-0000-000000000001', 'GLAUCE COUTINHO ARSAMENDIA', '2594', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('74d98683-506c-4bc1-9d2a-a0f2abed3812', '00000000-0000-0000-0000-000000000001', 'ROGERIO BARBOSA AQUINO', '2595', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ac04a0eb-76ca-4da5-9a3e-3cabd42d512d', '00000000-0000-0000-0000-000000000001', 'BRUNO BERBEL RODRIGUES', '2596', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e305100c-6ddb-4266-8165-f8b8cd6edcab', '00000000-0000-0000-0000-000000000001', 'DANILO SANTOS DA CRUZ', '1111', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('91b512f3-3ac3-4f53-98e7-52e552694fce', '00000000-0000-0000-0000-000000000001', 'SANDRO VELAZQUEZ ATANAGILDO', '1112', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8950c7b0-69f1-480e-b89e-c7f434bc6fff', '00000000-0000-0000-0000-000000000001', 'PAULO ALBUQUERQUE SILVA', '2398', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4c394fac-6703-4b94-8c14-da10d6f31802', '00000000-0000-0000-0000-000000000001', 'NEUZA CRISTINE RIBEIRO', '2400', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aa400c0c-960e-4429-b50f-e0ea69f29bb9', '00000000-0000-0000-0000-000000000001', 'ADEMAR DE PAULA', '2401', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('23de7af5-42b1-45e5-bdce-b2b259882794', '00000000-0000-0000-0000-000000000001', 'VALDINOR OSVALDO WENTZ', '2402', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a6658e25-dddc-492b-88c8-a94ea5ff584e', '00000000-0000-0000-0000-000000000001', 'FABIO ROGERIO DOS SANTOS', '2552', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6963918d-3dfb-44a2-a89d-b08259a4703c', '00000000-0000-0000-0000-000000000001', 'ANTONIO DANIEL TORRES LEIVA', '2553', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('17072e08-dfba-41d4-a095-3162d32253d7', '00000000-0000-0000-0000-000000000001', 'ALDENES ALBINO GOMES DA ROCHA', '2554', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ed2aa7e7-6365-4d79-bd1a-91b893d173b9', '00000000-0000-0000-0000-000000000001', 'ADRIANO EVANGELISTA IZIDORO', '2555', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b403d741-f00a-42a4-aa37-5e8e6f8bc3c2', '00000000-0000-0000-0000-000000000001', 'MARCELO FRANCISCO FERREIRA', '2556', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7ea74a44-61fb-4d17-8d21-dc9d8d956806', '00000000-0000-0000-0000-000000000001', 'ANTONIO IRINEU DOS SANTOS', '1322', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('854a92a2-f9d9-4ba4-b360-41c2cf349234', '00000000-0000-0000-0000-000000000001', 'GERALDO FERREIRA DA SILVA', '1323', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5b40e3b0-c866-41c7-b71b-d02865154b93', '00000000-0000-0000-0000-000000000001', 'WAGNER SILVA DE OLIVEIRA', '1324', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f5896498-0b91-4a2b-9b6a-823005955a51', '00000000-0000-0000-0000-000000000001', 'ODAIR CANDIDO DE SOUZA', '2557', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c9112716-2cbc-49ee-b77e-46066aa6dd5b', '00000000-0000-0000-0000-000000000001', 'JUNIOR JOSE SOLANO MORA', '2558', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8d486a44-2a77-4429-91a6-63c11424da4c', '00000000-0000-0000-0000-000000000001', 'FERNANDO DOS SANTOS PEREIRA', '1325', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7c8b391f-e1e9-4d25-bbde-b6610fef817f', '00000000-0000-0000-0000-000000000001', 'MARCELO TEIXEIRA SIMOES', '1326', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e14bea29-2c9b-4e78-a130-b26ced65ae30', '00000000-0000-0000-0000-000000000001', 'IVO GOMES DE VASCONCELOS', '1327', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0788f596-ba12-4c1a-ae18-9321cb5773cc', '00000000-0000-0000-0000-000000000001', 'RAFAEL CLAUS PEREIRA', '1328', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0213dbc4-4ebe-4942-846c-5a61c59f7204', '00000000-0000-0000-0000-000000000001', 'JOAO FRANCISCO DE ALMEIDA', '2559', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a13a2ede-da34-4dfa-99aa-5471f1af6e26', '00000000-0000-0000-0000-000000000001', 'DOUGLAS ALVES TABORDA', '2561', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('79120df2-f539-47c4-93d2-7d8bb6774b62', '00000000-0000-0000-0000-000000000001', 'ARI WAGNER PEDROSO DA ROCHA', '2562', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e56ffd87-e5d4-46c8-8f32-e19c6f47d752', '00000000-0000-0000-0000-000000000001', 'GILSON FERREIRA SILVA', '2588', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ad24b422-82a4-42f0-8bd0-d8ecce2f9585', '00000000-0000-0000-0000-000000000001', 'APARECIDO SEBASTIAO DA SILVA', '2570', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('09ab0e1e-5265-4e1d-9204-26306496e66f', '00000000-0000-0000-0000-000000000001', 'LUIS AUGUSTO FONSECA PEIXOTO', '2571', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('612e4f21-3373-495f-ba65-c22309772f46', '00000000-0000-0000-0000-000000000001', 'RAFAEL ESPINDOLA PINHEIRO', '2425', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1a0ca419-ea1e-4950-806f-1264dde9b8b1', '00000000-0000-0000-0000-000000000001', 'UEMERSON BATISTA ARRUDA DE MORAIS', '2626', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9880eb6d-24d8-4fa9-841d-43c82714b1a1', '00000000-0000-0000-0000-000000000001', 'ANSELMO GARCIA DE REZENDE', '2600', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('686589d1-d526-47cd-a2d4-125726f0b069', '00000000-0000-0000-0000-000000000001', 'PAULO SERGIO DE SOUZA', '2601', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('94f7875e-637c-483c-baf1-2a82b867ffd4', '00000000-0000-0000-0000-000000000001', 'LEONIDAS DA CUNHA VENIAL', '1255', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b1cbb7f6-90a5-4d62-b3bb-aeda63df99a8', '00000000-0000-0000-0000-000000000001', 'JEFERSON GABRIEL SANTOS DOS SANTOS', '2602', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('556b95a6-983b-49c9-8be6-5ad1b3c72031', '00000000-0000-0000-0000-000000000001', 'SILVIO SANDRO ALMEIDA GONÇALVES', '555222', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('75ef47d8-5faa-4787-af9d-bed869d9033d', '00000000-0000-0000-0000-000000000001', 'MARCELINO GOMEZ CARDOZO', '2111', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('15649efe-2e37-4643-b0c1-c8f1636efeec', '00000000-0000-0000-0000-000000000001', 'RENATO ROSEMIR DE OLIVEIRA JUNIOR', '2627', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('228effa4-f612-47e0-944a-c4f3b6ac4f08', '00000000-0000-0000-0000-000000000001', 'ALMIR JOSE DE SOUZA', '2233', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('109e6cf9-e98b-4699-b75f-585bfdb688b7', '00000000-0000-0000-0000-000000000001', 'MARCELO MARQUES DA SILVA', '11221', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('676ed6da-4ef8-4a08-a7c1-c32f0dd11b7a', '00000000-0000-0000-0000-000000000001', 'MARCELO JOSE DE FREITAS', '1233', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('aaec1056-b146-4df1-ae41-7d9cd98bb30e', '00000000-0000-0000-0000-000000000001', 'SIDINEY FRANCISCO DE SOUZA', '1545', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('33b196f2-f090-4fe7-8d97-44ac5229082f', '00000000-0000-0000-0000-000000000001', 'ANTONIO LEONIDES VIEIRA', '12455', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('16259e8a-899d-4f39-b107-0254cbf6ef0b', '00000000-0000-0000-0000-000000000001', 'ALEX DOS SANTOS SILVA', '2828', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7eb4b030-148c-4bd8-82a2-eb75dc9a7c90', '00000000-0000-0000-0000-000000000001', 'ANDRE REIS ROCHA', '2829', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('247e0f2c-39f7-4c64-8aa9-200554087d28', '00000000-0000-0000-0000-000000000001', 'HEVERTON RODRIGUES NUNES', '2830', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7dc9c45c-ab96-4a2c-b9df-d2802efb9867', '00000000-0000-0000-0000-000000000001', 'LEANDRO DE PAULA DOS ANJOS', '2831', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b37d12be-ac71-4832-9a12-9990ea7ddd16', '00000000-0000-0000-0000-000000000001', 'MARCIO GONCALVES BENITEZ', '2832', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('27bdd381-619b-42c7-b3ad-1b749fc3fabe', '00000000-0000-0000-0000-000000000001', 'JOAO ANTONIO PAULINO', '2222', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a36dfcec-ab91-4824-9b08-95ef99e9fbaf', '00000000-0000-0000-0000-000000000001', 'SOLON ALMEIDA SOARES', '2330', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0677789a-1345-4231-834f-97dccfd75d3c', '00000000-0000-0000-0000-000000000001', 'CB 1418', '1418', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9e598c19-67ee-4553-8268-7311eb3863ff', '00000000-0000-0000-0000-000000000001', 'FERNANDO DA SILVA DIAS', '2525', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e54e19c4-3e8b-47be-a937-3bb03be08af0', '00000000-0000-0000-0000-000000000001', 'LUCAS MATEUS DOS SANTOS SILVA', '2662', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a67a372e-7063-4594-9036-9428bd3a960f', '00000000-0000-0000-0000-000000000001', 'JADER DOS SANTOS VASCONCELOS', '2655', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e38560db-6d3a-4013-b8cb-e3a278044979', '00000000-0000-0000-0000-000000000001', 'MATEUS DELFIM VALENZUELA', '26559', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a12bd45e-dd10-4012-9a08-e8e32c46357f', '00000000-0000-0000-0000-000000000001', 'LIEGE DA SILVA BARROS', '1000', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7b06d79c-ead1-4ecc-8a21-d3b5d7a53568', '00000000-0000-0000-0000-000000000001', 'MATEUS DOS SANTOS OLIVEIRA', '500', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b203f3fa-5d95-4394-8b4d-a8093d6275ff', '00000000-0000-0000-0000-000000000001', 'DEIVID BENITES LIMA BARRIOS', '55548', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3870c09b-07a5-446f-92c5-27fd2abb3801', '00000000-0000-0000-0000-000000000001', 'GEOVANI BIANCHINI ALVES', '2503', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('871626de-933d-4d5a-a185-0d5846a591b8', '00000000-0000-0000-0000-000000000001', 'SEBASTIAO TADEU ORTIZ DE FREITAS', '111544', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e2c9e024-4991-4970-be9a-ce8e8892151d', '00000000-0000-0000-0000-000000000001', 'ENMANUEL JESUS ESTRADA CONTRERAS', '5504', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('792a70c4-c335-47e2-badd-300034627d5d', '00000000-0000-0000-0000-000000000001', 'RAFAEL CARNEIRO DA SILVA', '2833', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('67c22e79-1b09-4afb-b8b4-be42b88dd463', '00000000-0000-0000-0000-000000000001', 'ARIOVALDO DE ALMEIDA RODRIGUES', '2577', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('471b3743-92ae-4d96-b3c0-a5c2bee1c7fa', '00000000-0000-0000-0000-000000000001', 'FRANTIESCO BATISTA VASQUES', '2501', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3288085a-3920-4988-8c1b-1c963e6c8c20', '00000000-0000-0000-0000-000000000001', 'NILO DOS SANTOS', '1221', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('2ccfc645-49bc-4f71-9828-e661cfd60eba', '00000000-0000-0000-0000-000000000001', 'EMERSON FRANCISCO ICASSATTI', '5656', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e33985eb-e3c5-4c24-8882-b58dbd4cbf4d', '00000000-0000-0000-0000-000000000001', 'JOSE ROMARIO COSTA DA SOLIDADE', '5657', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5cc5f90e-7410-42b1-aa90-7266ccb1fbad', '00000000-0000-0000-0000-000000000001', 'ALINO VITOR NASCIMENTO DE ALENCAR', '3939', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('14d5e533-e2ef-45ed-b789-cf4a6e045c7e', '00000000-0000-0000-0000-000000000001', 'EVERTON LOPES DOS SANTOS', '2241', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ff4bd1da-76ee-43d4-827a-d9cb43a23291', '00000000-0000-0000-0000-000000000001', 'ANGELA KAROLINY PEIXOTO DE AGUIAR', '2480', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c5b40fda-e4f9-4208-ba2d-359e4cef3daa', '00000000-0000-0000-0000-000000000001', 'MARCOS DOS SANTOS BARBOSA', '2888', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('219dea00-3902-4c6d-a076-396bb177b0f8', '00000000-0000-0000-0000-000000000001', 'CRISTIANE PATRICIA DE OLIVEIRA SILVA', '2990', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('93c33bb7-12e8-42e2-a305-79d449f2989e', '00000000-0000-0000-0000-000000000001', 'ANDRE MARTINS PAEL', '2658', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('857b903c-9e2a-4444-b52b-5a4937946280', '00000000-0000-0000-0000-000000000001', 'LUIZ HENRIQUE AGUIAR DE FREITAS', '2632', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('04302a05-4476-4672-9b4a-6a50f82aab01', '00000000-0000-0000-0000-000000000001', 'WILLIAN DA SILVA ALVES', '2597', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('82a9219f-393b-4f15-b788-4c2be327ab78', '00000000-0000-0000-0000-000000000001', 'JOAO ALVES DA SILVA', '2603', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e1cb4730-9a23-43f9-ab15-29efca615e89', '00000000-0000-0000-0000-000000000001', 'DOUGLAS DE REZENDE', '2604', 'FUNILEIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('04923458-0fdd-4185-8d2f-93f56c29dc7d', '00000000-0000-0000-0000-000000000001', 'GUSTAVO SOZZI DE SOUZA', '2606', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6ae1d3e1-6afc-485c-b548-cb83e7d396b9', '00000000-0000-0000-0000-000000000001', 'ISABELY KAIANY GONSALES RODRIGUEZ', '2607', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('11747385-864e-4039-98dd-fea1fe0faded', '00000000-0000-0000-0000-000000000001', 'LEVI DE OLIVEIRA', '2660', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('87464ce6-c0bc-4db8-9c3d-c6e4cd0eb174', '00000000-0000-0000-0000-000000000001', 'RAFAEL CALCA DE OLIVEIRA', '2663', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('135aa111-a694-49fb-adf7-101e2f725a19', '00000000-0000-0000-0000-000000000001', 'DANIEL JOSE LOPEZ COROY', '2666', 'FUNILEIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4354d50b-f420-4c96-9d2c-dd8c6734d7cc', '00000000-0000-0000-0000-000000000001', 'EVANDRO FERREIRA DE SOUZA', '2664', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('37a733b5-2a30-487b-8596-4c4dafe12f31', '00000000-0000-0000-0000-000000000001', 'PAULO ROBERTO TREVISAN', '2667', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7c5d9b35-90c0-4805-a73b-eae6934929fd', '00000000-0000-0000-0000-000000000001', 'PEDRO WELLINGTON GARCIA DE OLIVEIRA', '2668', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('97a102c7-f479-4e8e-b1a3-0fdf9eb350f9', '00000000-0000-0000-0000-000000000001', 'EDNA SILVA', '2669', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a054a804-7433-46ea-ade6-e26e2293a17c', '00000000-0000-0000-0000-000000000001', 'THIAGO DUTRA', '2670', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('312bb735-d52a-4be3-8f2e-35ce1f571a65', '00000000-0000-0000-0000-000000000001', 'ADRIANO XAVIER LOPES CORREIA', '2678', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1fac3196-27a4-4ca5-bc04-01c58e8bdd70', '00000000-0000-0000-0000-000000000001', 'ELIER COSTA DA SILVA', '2671', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d964dc1a-d913-4e7f-af0f-c3fe08a09d18', '00000000-0000-0000-0000-000000000001', 'BRUNO ALTAMIR HOLSBACH VENIAL', '2679', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d71714ac-333b-45ca-b0ba-643cf29f2738', '00000000-0000-0000-0000-000000000001', 'FABRICIO AREBALO ESPINDOLA', '2690', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('108bdc18-45f1-40b8-a340-0999347a86e7', '00000000-0000-0000-0000-000000000001', 'KARINA FEITOZA GOMES', '2701', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f2480e82-c281-4969-ba7d-d198bc295804', '00000000-0000-0000-0000-000000000001', 'ALANNA EDUARDA MARQUES DA SILVA', '2707', 'VENDEDOR', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4bca6e76-e10e-4558-85fc-f911d0af7499', '00000000-0000-0000-0000-000000000001', 'DIEGO BRUNO NUNES DE OLIVEIRA', '2706', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('0467d2dc-0d5a-48a7-b19c-8dd9d863cd6a', '00000000-0000-0000-0000-000000000001', 'ALEXANDRE DA CUNHA FERREIRA FILHO', '2909', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ddc71cbc-01cd-4641-bf17-a3a602f3919c', '00000000-0000-0000-0000-000000000001', 'SEBASTIAO VIEIRA DIAS', '2910', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('630365d4-3297-4b3a-a188-86179844004d', '00000000-0000-0000-0000-000000000001', 'PAULO TEODORO DA ROCHA', '2911', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('01db0037-c7e7-401a-a0cc-1692c5d18c7e', '00000000-0000-0000-0000-000000000001', 'GUSTAVO DA SILVA FRANCA', '2912', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('23473d9c-f51e-4380-b14c-457df2bdbd86', '00000000-0000-0000-0000-000000000001', 'IAGO DA SILVA RODRIGUES CORREA', '2913', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ffa1ea99-c294-4f68-b157-1e39521f9917', '00000000-0000-0000-0000-000000000001', 'MARCOS PAULO SOARES DA SILVA', '2914', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('b50ca522-7fc0-44d8-a95a-9a8a0f51c64d', '00000000-0000-0000-0000-000000000001', 'NELSON SILVERIO', '22222', 'GERENTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f017d4cf-55c5-491d-a0aa-c39e35871318', '00000000-0000-0000-0000-000000000001', 'CLEBER OERTA DA SILVA', '2908', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('8ca43f07-d952-4ac2-ade6-8ec62cbbba3b', '00000000-0000-0000-0000-000000000001', 'KAROLAYNE APARECIDA DE MORAES', '2915', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cfe5b0dc-9a73-4b02-b6bd-03c55f9323ba', '00000000-0000-0000-0000-000000000001', 'MARCELO LOPES RODRIGUES', '2919', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('acd0ffc4-dc6a-43de-a2f8-d9a5713e4c3d', '00000000-0000-0000-0000-000000000001', 'JOSE VALDENIR TEIXEIRA RIPARDO', '1930', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9fdecb87-00ec-4497-9a9b-644175a4ecf2', '00000000-0000-0000-0000-000000000001', 'VICTOR OLIVEIRA MIRANDA', '2920', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('34ddad07-b1db-4877-84a6-a803a4f1aede', '00000000-0000-0000-0000-000000000001', 'GABRIELA FERREIRA LUIZ', '2922', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('911dc98c-b84c-41cc-ac58-6d8275b7ffb6', '00000000-0000-0000-0000-000000000001', 'ELIAS LOPES MARTINS', '27883', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d620dc84-45b5-47fe-a678-1931c49e6f98', '00000000-0000-0000-0000-000000000001', 'JERISON RIOS ROJAS', '2710', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('741ba2ba-6c82-4795-bd5b-702cc58895ab', '00000000-0000-0000-0000-000000000001', 'AUGUSTO LUIZ DA SILVA', '2800', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e0b5d48a-0035-4866-8baf-106ce3652ef7', '00000000-0000-0000-0000-000000000001', 'EDUARDO DUARTE DA SILVA', '2801', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('f6510e82-e375-40d7-9a83-71a7fda15c9d', '00000000-0000-0000-0000-000000000001', 'MAXSSUEL BATISTA DE ANDRADE', '2916', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('50209dd1-8d91-46f5-9c1b-c0704d2e787f', '00000000-0000-0000-0000-000000000001', 'JHON ROGERS SALES COLMAN', '2917', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('19a8622b-24d6-4f30-8c39-7d49b4a82c6e', '00000000-0000-0000-0000-000000000001', 'EDGAR MARINHO', '2899', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3c78c710-7b4a-44ca-81f4-0fa5987653b8', '00000000-0000-0000-0000-000000000001', 'LUCAS BARBAES FERREIRA', '2901', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('eeb5b00c-fb9f-4377-b8a0-dbaaa3394bc8', '00000000-0000-0000-0000-000000000001', 'GERFSON LIMA FERREIRA', '2528', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9db32f13-341a-4679-a7f1-8bc3c641f4e9', '00000000-0000-0000-0000-000000000001', 'APARECIDO DO NASCIMENTO', '2691', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('27e5db15-6520-4b8f-97a1-fc0a76d7e395', '00000000-0000-0000-0000-000000000001', 'DEBORA ALVES DE ARAUJO FERREIRA', '2889', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('cf03db0f-8310-4c24-8acc-66aa645a8b08', '00000000-0000-0000-0000-000000000001', 'ERIKA MARQUES DOS SANTOS', '2890', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1e070acf-c361-4758-aba4-a7729f0a9d69', '00000000-0000-0000-0000-000000000001', 'FRANCISCO LEANDRO DE LIMA OLIVEIRA', '2891', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('73e745fa-e5aa-4065-8c73-9a4694428201', '00000000-0000-0000-0000-000000000001', 'Viviane Tereza de Souza Silva', '289', 'AUXILIAR ADIMINISTRATIVO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9091d0b3-962f-4728-9dfd-c81d41665793', '00000000-0000-0000-0000-000000000001', 'RAMAO GABRIEL DELFIM VALENZUELA', '287', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('358f9426-f51c-4465-a8a9-16da53e11533', '00000000-0000-0000-0000-000000000001', 'ADRIANO DA SILVA GALVÃO', '288', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('fb535710-f0f7-4119-b09f-8ddbfe3cf5ca', '00000000-0000-0000-0000-000000000001', 'ALTAIR APARECIDO DA SILVA', '290-0', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('9a6219a7-5a0c-40b3-bf33-4488ad04c043', '00000000-0000-0000-0000-000000000001', 'ITALO ALMEIDA ALVES', '291', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('045698b9-3fdd-4cc3-9c18-9c341ccfaf49', '00000000-0000-0000-0000-000000000001', 'DIEGO DE SOUZA CAVALCANTE', '47', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d8044bd2-e36d-47d7-8e5d-4153516a9d58', '00000000-0000-0000-0000-000000000001', 'Lucas Ronfim', '292', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('afccf321-c2f8-403f-a6dd-ec35356e2553', '00000000-0000-0000-0000-000000000001', 'LUCIANO FERREIRA DA SILVA', '13', 'MESTRE DE OBRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('256c597b-0d4b-4e7b-88d2-9c204f3a28c5', '00000000-0000-0000-0000-000000000001', 'JOSÉ ADVALDO RIBEIRO', '294', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('11a8661e-44e3-4293-9a6e-5076e9b7779a', '00000000-0000-0000-0000-000000000001', 'Donizette da Silva Pereira Gomes', '295', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('afec56e5-32bc-4bc9-94f6-1adbe30dc8a2', '00000000-0000-0000-0000-000000000001', 'José Ricardo de Oliveira Costa', '296', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('a1eb793e-64f5-43c8-b820-111e23c949f1', '00000000-0000-0000-0000-000000000001', 'EDIVALDO TOBIAS DA SILVA', '299', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4574bd85-39a1-42c1-ae31-beb38aad798a', '00000000-0000-0000-0000-000000000001', 'ADRIAN NEVES DOS SANTOS', '297', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('02a96bd3-5f1e-44e6-9fe4-800b8013eaa9', '00000000-0000-0000-0000-000000000001', 'ALAN JUNIOR PAREDES', '298', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('c0f4b39e-e8fa-4873-b2ba-2d729e2f4752', '00000000-0000-0000-0000-000000000001', 'Lucas Henrique Magro Assunção', '305', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('7f92f5ff-dc77-4f65-bf19-e68e5deafc8c', '00000000-0000-0000-0000-000000000001', 'Simon Luis Rojas Silva', '304', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ad401dc3-b565-4ec2-a7d0-e2326ad8b9eb', '00000000-0000-0000-0000-000000000001', 'Weverson de Lima Silva', '308', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('4135c3f1-9848-4e4e-a0a6-7f0c42e6ffba', '00000000-0000-0000-0000-000000000001', 'Ramerson Santos Rodrigues', '306', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('af08f87d-d4fe-41a4-9b81-4f44bb10a8bd', '00000000-0000-0000-0000-000000000001', 'Everton da Silva Lisboa', '310', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ff0b4050-6b10-4c79-a8ae-b8ff9df8640a', '00000000-0000-0000-0000-000000000001', 'Pedro Antonio da Silva', '311', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3cd0cfa5-f684-4fe8-ac0a-924f6c559581', '00000000-0000-0000-0000-000000000001', 'EDMAR DE ALMEIDA SOARES', '312', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('e52fb783-2eb9-4f75-884e-141cdd452067', '00000000-0000-0000-0000-000000000001', 'Edson Pires Santana', '307', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('1952c399-d4e8-4573-8841-f9b303f6fe8c', '00000000-0000-0000-0000-000000000001', 'Reinaldo', '100', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('df5d4c7b-fb6a-4ac6-8ff6-da48fac72ad4', '00000000-0000-0000-0000-000000000001', 'Arculano Gonçalves da Luz', '314', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('88a511f3-6a8c-47fb-8571-dba0a1ae948d', '00000000-0000-0000-0000-000000000001', 'CAIO FELIPE DOS SANTOS', '317', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('5e8c6fd4-1dd2-4f7a-a312-ebc6f42ecdc9', '00000000-0000-0000-0000-000000000001', 'OSVALDO MALDONADO VILHARVA', '315', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('3aa50c87-6b4a-4240-ac61-2c9bceaa9d2b', '00000000-0000-0000-0000-000000000001', 'FRANCISCO DE ASSIS JUNIOR', '318', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('53ae8a66-6183-44c4-955a-455f6708ee1e', '00000000-0000-0000-0000-000000000001', 'MARCELINO GOMEZ CARDOZO', '316', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('d58a8bf6-5229-4c2e-81d1-edda03ab9764', '00000000-0000-0000-0000-000000000001', 'IVANESIO BALT', '319', 'MOTORISTA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ef7a2a9b-8aa9-4fb0-aff7-621605632c17', '00000000-0000-0000-0000-000000000001', 'EDER FRANCISCO DA SILVA', '320', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('933301d4-d439-406c-bdfd-cb5d17bb0bf7', '00000000-0000-0000-0000-000000000001', 'RODSON ARIEL DE OLIVEIRA', '7300', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('6b52299b-11d2-4697-854f-abd696694eb4', '00000000-0000-0000-0000-000000000001', 'PAULO HENRIQUE FERREIRA PEREIRA DOS SANTOS', '321', 'OPERADOR PÁ-CARREGADEIRA', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('efbadc4f-b27e-4fe5-bd75-5a43f229697c', '00000000-0000-0000-0000-000000000001', 'MATHEUS SAMPAIO MARTINS', '20052', 'AJUDANTE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('59aaf0af-abd3-4284-a98f-81c5bb8c9bb2', '00000000-0000-0000-0000-000000000001', 'CARLOS LUIS GUERRA RIVERA', '54.0', 'AJUDANTE DE PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('968d6b7b-7374-4496-bfc0-acd88d607e77', '00000000-0000-0000-0000-000000000001', 'EDGAR JOSE SALAZAR GOMEZ', '53.0', 'PEDREIRO', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('891295d3-50c8-4c79-a38c-c874b57ec235', '00000000-0000-0000-0000-000000000001', 'GABRIEL DE SOUZA MATOS', '324', 'ALMOXARIFE', NOW());
INSERT INTO employees (id, company_id, full_name, registration_number, job_title, created_at) 
VALUES ('ad0b9bf4-8653-48a5-bff0-b3bc8c5cc6cf', '00000000-0000-0000-0000-000000000001', 'ANDERSON ALVES CORREIA', '325', 'AUXILIAR DE MANUTENÇÃO', NOW());
