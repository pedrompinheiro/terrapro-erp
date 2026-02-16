# Instruções para Correção do GPS (Selsyn)

O sistema de rastreamento está configurado, mas a **Chave de API (Token)** atual está retornando erro **403 Forbidden** (Acesso Negado).

Isso significa que a chave expirou ou foi revogada pela Selsyn.

## Como Resolver

1.  Acesse o painel da Selsyn ou entre em contato com o suporte deles.
2.  Solicite uma nova **API Key** para integração.
3.  Abra o arquivo `.env.local` na raiz do projeto.
4.  Substitua o valor de `VITE_SELSYN_API_KEY`:

```env
# .env.local
VITE_SELSYN_API_KEY=SUA_NOVA_CHAVE_AQUI
```

5.  Reinicie o servidor (`CTRL+C` e `npm run dev:all`).

## Teste Rápido

Você pode testar se a chave está funcionando rodando este comando no terminal:

```bash
curl -v "https://api.appselsyn.com.br/keek/rest/v1/integracao/operador/posicao" -H "x-api-key: SUA_CHAVE"
```

Se retornar um JSON com dados, está funcionando. Se retornar `{"message":"Acesso não autorizado."}`, a chave ainda está inválida.
