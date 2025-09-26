# 🐛 Debug - Sistema de Compra de Sementes via PIX

## 🔍 **Problemas Identificados e Corrigidos**

### ❌ **Problemas Encontrados:**
1. **Logs insuficientes** - Difícil identificar onde o erro estava ocorrendo
2. **URL do webhook dinâmica** - Pode não estar chegando corretamente ao MercadoPago
3. **Tratamento de erros limitado** - Não mostrava detalhes suficientes dos erros

### ✅ **Correções Implementadas:**

#### 1. **Melhorados os Logs de Debug** (`pages/api/pagamentos/index.ts`)
```typescript
// Adicionados logs detalhados em cada etapa:
- Verificação do Access Token
- Dados enviados para o MercadoPago
- Resposta do MercadoPago
- Processamento do pagamento
```

#### 2. **URL do Webhook Dinâmica**
```typescript
// Antes:
notification_url: 'https://sementesplay.com.br/api/mercadopago/webhook'

// Depois:
notification_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sementesplay.com.br'}/api/mercadopago/webhook`
```

#### 3. **Endpoint de Debug Criado** (`pages/api/debug/test-mercadopago.ts`)
- Testa configuração do MercadoPago
- Verifica conectividade com a API
- Mostra informações de debug

#### 4. **Tratamento de Erros Melhorado**
- Logs mais detalhados dos erros
- Informações de debug incluídas nas respostas
- Status codes específicos

---

## 🧪 **Como Testar o Sistema**

### **1. Verificar Configuração**
```bash
# Acesse diretamente no navegador ou via curl:
GET /api/debug/test-mercadopago

# Deve retornar:
{
  "success": true,
  "message": "Configuração do MercadoPago está funcionando",
  "config": { ... },
  "apiTest": {
    "status": "SUCCESS",
    "pixAvailable": true
  }
}
```

### **2. Testar Compra via Interface**
1. Acesse a página da carteira: `/carteira`
2. Clique em "Fazer Pagamento"
3. Digite um valor (ex: R$ 5,00)
4. Clique em "Gerar PIX"
5. Verifique se aparece o QR Code

### **3. Verificar Logs no Vercel**
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto SementesPLAY
3. Vá em **Functions** → **View Function Logs**
4. Procure pelos logs com emojis: 🔍, 📦, 📡, ✅, ❌

### **4. Testar Localmente** (Opcional)
```bash
# Executar script de teste
cd scripts
node test-compra-sementes.js
```

---

## 🚨 **Possíveis Problemas e Soluções**

### **❌ "MERCADOPAGO_ACCESS_TOKEN não configurado"**
**Solução:**
1. Acesse o Vercel Dashboard
2. Vá em Settings → Environment Variables
3. Adicione: `MERCADOPAGO_ACCESS_TOKEN = APP_USR-...`
4. Faça redeploy

### **❌ "Erro na API do MercadoPago"**
**Verificar:**
- Se o Access Token é válido
- Se a conta MercadoPago está ativa
- Logs específicos no console

### **❌ "Dados PIX não disponíveis"**
**Possíveis causas:**
- Resposta inesperada do MercadoPago
- Problema na estrutura da resposta
- Token inválido

### **❌ Webhook não funcionando**
**Verificar:**
1. URL do webhook no MercadoPago
2. Logs do endpoint `/api/mercadopago/webhook`
3. Se o domínio está acessível publicamente

---

## 📊 **Monitoramento Contínuo**

### **Logs a Observar:**
```
🔍 Verificando configuração do MercadoPago
📦 Dados do pagamento para MercadoPago
📡 Resposta do MercadoPago
✅ Pagamento criado no MercadoPago
❌ Erro na API do Mercado Pago (se houver)
```

### **Métricas Importantes:**
- Taxa de sucesso na geração de PIX
- Tempo de resposta do MercadoPago
- Webhooks recebidos vs. pagamentos criados
- Erros de configuração

---

## ✅ **Fluxo Completo Funcionando**

1. **Usuário clica em "Fazer Pagamento"** → `pages/carteira.tsx`
2. **Frontend faz POST** → `/api/pagamentos`
3. **API verifica configuração** → Logs detalhados
4. **Cria pagamento no BD** → Status: 'pendente'
5. **Chama MercadoPago API** → Gera PIX
6. **Retorna QR Code** → Usuário pode pagar
7. **MercadoPago notifica** → `/api/mercadopago/webhook`
8. **Processa pagamento** → `/api/mercadopago/verificar-pagamento`
9. **Credita sementes** → Transação atômica
10. **Atualiza carteira** → Movimentação registrada

---

## 🎯 **Próximos Passos**

1. **Testar em produção** com valores baixos
2. **Monitorar logs** por 24-48h
3. **Ajustar timeouts** se necessário
4. **Implementar retry** para webhooks perdidos
5. **Adicionar alertas** para falhas críticas
