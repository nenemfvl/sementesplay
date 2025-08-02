# 🔗 Integração com APIs Externas - SementesPLAY

Este documento explica como configurar as integrações com APIs externas para verificar status de live dos criadores.

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Google Cloud Console (YouTube)
- Conta de desenvolvedor na Twitch
- Variáveis de ambiente configuradas

## 🎥 YouTube API

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**

### 2. Criar Credenciais

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API Key"
3. Copie a chave da API

### 3. Configurar Variável de Ambiente

```bash
YOUTUBE_API_KEY=sua_chave_api_aqui
```

## 🟣 Twitch API

### 1. Registrar Aplicação

1. Acesse [Twitch Developer Console](https://dev.twitch.tv/console)
2. Faça login e clique em "Register Your Application"
3. Preencha os dados:
   - **Name**: SementesPLAY
   - **OAuth Redirect URLs**: http://localhost:3000/api/auth/callback/twitch
   - **Category**: Application Integration

### 2. Obter Credenciais

1. Após registrar, você receberá:
   - **Client ID**
   - **Client Secret**

### 3. Configurar Variáveis de Ambiente

```bash
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_CLIENT_SECRET=seu_client_secret_aqui
```

## 📱 Instagram e TikTok

Para Instagram e TikTok, utilizamos web scraping com Puppeteer. Não são necessárias APIs específicas, mas o sistema pode ser bloqueado por:

- Rate limiting
- Captchas
- Mudanças na estrutura HTML

### Fallback Automático

Se o web scraping falhar, o sistema automaticamente usa dados simulados para demonstração.

## ⚙️ Configuração Completa

### 1. Arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```env
# YouTube API
YOUTUBE_API_KEY=AIzaSyC...

# Twitch API
TWITCH_CLIENT_ID=abc123...
TWITCH_CLIENT_SECRET=xyz789...

# Outras configurações
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3000
```

### 2. Vercel (Produção)

Para deploy na Vercel, configure as variáveis de ambiente no dashboard:

1. Acesse o projeto na Vercel
2. Vá para "Settings" > "Environment Variables"
3. Adicione todas as variáveis acima

## 🔧 Testando as Integrações

### 1. Teste YouTube

```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=CHANNEL_ID&type=video&eventType=live&key=YOUR_API_KEY"
```

### 2. Teste Twitch

```bash
curl -H "Client-ID: YOUR_CLIENT_ID" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     "https://api.twitch.tv/helix/streams?user_login=USERNAME"
```

## 📊 Monitoramento

### Logs

O sistema registra logs para cada verificação:

- ✅ Sucesso: `Criador X está ao vivo no YouTube`
- ⚠️ Aviso: `YouTube API Key não configurada, usando simulação`
- ❌ Erro: `Erro ao verificar YouTube: [detalhes]`

### Métricas

- Tempo de resposta das APIs
- Taxa de sucesso por plataforma
- Fallbacks para simulação

## 🚀 Otimizações

### 1. Cache

Implemente cache Redis para reduzir chamadas às APIs:

```typescript
// Exemplo de cache
const cacheKey = `live_status:${platform}:${username}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)
```

### 2. Rate Limiting

Configure rate limits para evitar exceder quotas:

```typescript
// YouTube: 10,000 unidades/dia
// Twitch: 800 requests/minuto
```

### 3. Webhooks

Para Twitch, considere usar webhooks para atualizações em tempo real:

```typescript
// Webhook para mudanças de status
app.post('/webhook/twitch', (req, res) => {
  // Processar mudança de status
})
```

## 🔒 Segurança

### 1. Proteção de Chaves

- Nunca commite chaves de API no código
- Use variáveis de ambiente
- Rotacione chaves regularmente

### 2. Rate Limiting

- Implemente rate limiting no servidor
- Monitore uso das APIs
- Configure alertas para quotas

### 3. Validação

- Valide todas as entradas
- Sanitize dados das APIs
- Implemente timeouts

## 📞 Suporte

Para problemas com as integrações:

1. Verifique os logs do servidor
2. Teste as APIs individualmente
3. Consulte a documentação oficial:
   - [YouTube Data API](https://developers.google.com/youtube/v3)
   - [Twitch API](https://dev.twitch.tv/docs/api)

## 🔄 Atualizações

### Versões das APIs

- **YouTube Data API v3**: Estável
- **Twitch Helix API**: Estável
- **Instagram/TikTok**: Web scraping (pode quebrar)

### Manutenção

- Monitore mudanças nas APIs
- Atualize selectors de web scraping
- Teste regularmente as integrações 