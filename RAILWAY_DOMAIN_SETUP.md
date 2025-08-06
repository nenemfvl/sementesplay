# Configuração do Domínio no Railway (Opcional)

## Quando Usar o Railway

O Railway é usado principalmente para o banco de dados PostgreSQL. Para o domínio principal, use o Vercel.

## Configuração de Banco de Dados

### 1. Acesse o Railway
- Vá para https://railway.app/
- Faça login na sua conta

### 2. Verifique o Banco de Dados
- O banco PostgreSQL já está configurado
- A URL está em: `DATABASE_URL=postgresql://postgres:xwCTAkuOdnHAOFRTOIwjMNHwZPRuswGM@metro.proxy.rlwy.net:26738/railway`

### 3. Configurações de Domínio (se necessário)

Se você quiser usar o Railway para hospedar a aplicação (não recomendado):

#### Adicione Domínio Personalizado:
1. Vá para o projeto no Railway
2. Clique em "Settings"
3. Vá para "Domains"
4. Adicione: `api.sementesplay.com.br`

#### Configure DNS:
```
Tipo: CNAME
Nome: api
Valor: [URL do Railway]
TTL: 3600
```

## Recomendação

**Use apenas o Vercel para o domínio principal:**
- ✅ `sementesplay.com.br` → Vercel
- ✅ `www.sementesplay.com.br` → Vercel
- ✅ `api.sementesplay.com.br` → Railway (opcional)

**Railway apenas para:**
- ✅ Banco de dados PostgreSQL
- ✅ APIs específicas (se necessário)

## Comandos para Verificar

```bash
# Verificar se o banco está funcionando
npm run db:studio

# Verificar migrações
npx prisma migrate status
``` 