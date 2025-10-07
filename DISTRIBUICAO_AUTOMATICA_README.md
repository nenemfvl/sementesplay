# 🤖 Sistema de Distribuição Automática de Fundo - SementesPLAY

## 📋 **Visão Geral**

O sistema de distribuição automática garante que o fundo de sementes seja distribuído automaticamente quando um ciclo termina, sem necessidade de intervenção manual.

## 🔧 **Como Funciona**

### **1. Monitoramento Automático**
- **Cron Job**: Executa todos os dias às **2h da manhã**
- **Verificação**: Checa se há fundo pendente de distribuição
- **Condição**: Só distribui se o período do fundo já terminou

### **2. Processo de Distribuição**
```
Ciclo Termina → Cron Job Executa → Verifica Fundo → Distribui Automaticamente → Cria Novo Fundo
```

### **3. Critérios de Distribuição**
- **50%** para **criadores** (baseado em quantidade de conteúdo)
- **50%** para **usuários** (baseado em compras de parceiros)
- **Se não há usuários elegíveis**: Todo valor vai para criadores

## 📁 **Arquivos do Sistema**

### **APIs Principais**
- `pages/api/cron/distribuir-fundo-automatico.ts` - Lógica de distribuição
- `pages/api/cron/verificar-distribuicao-fundo.ts` - Cron job principal

### **Configuração**
- `vercel.json` - Configuração do cron job
- `CRON_SECRET` - Variável de ambiente para segurança

### **Scripts de Teste**
- `scripts/testar-distribuicao-automatica.js` - Teste completo do sistema
- `scripts/configurar-fundo-teste.js` - Criação de fundo para teste

## ⚙️ **Configuração**

### **1. Variáveis de Ambiente**
```bash
CRON_SECRET=sua_chave_secreta_aqui
NEXT_PUBLIC_BASE_URL=https://sementesplay.com.br
```

### **2. Cron Job no Vercel**
```json
{
  "path": "/api/cron/verificar-distribuicao-fundo",
  "schedule": "0 2 * * *"
}
```
**Horário**: Todos os dias às 2h da manhã

## 🧪 **Como Testar**

### **1. Configurar Fundo de Teste**
```bash
node scripts/configurar-fundo-teste.js
```

### **2. Testar Distribuição**
```bash
node scripts/testar-distribuicao-automatica.js
```

### **3. Testar API Diretamente**
```bash
curl -X POST https://sementesplay.com.br/api/cron/distribuir-fundo-automatico
```

## 📊 **Logs e Monitoramento**

### **Logs do Sistema**
- ✅ Fundo encontrado e distribuído
- ⏰ Fundo ainda no período ativo
- ❌ Erro na distribuição
- 📧 Notificações enviadas

### **Verificação Manual**
```bash
# Verificar fundos
node scripts/verificar-fundos-simples.js

# Verificar distribuições
node scripts/verificar-distribuicao-completa.js
```

## 🔒 **Segurança**

### **Autenticação**
- **Cron Job**: Usa `CRON_SECRET` para autenticação
- **API**: Verifica token de autorização
- **Logs**: Registra todas as operações

### **Transações**
- **Atomicidade**: Usa transações do Prisma
- **Rollback**: Em caso de erro, nada é alterado
- **Consistência**: Garante integridade dos dados

## 🚨 **Troubleshooting**

### **Problemas Comuns**

#### **1. Cron Job Não Executa**
- Verificar configuração no `vercel.json`
- Verificar variável `CRON_SECRET`
- Verificar logs da Vercel

#### **2. Distribuição Não Acontece**
- Verificar se há fundo pendente
- Verificar se período já terminou
- Verificar logs de erro

#### **3. Usuários Não Recebem**
- Verificar se há compras de parceiros
- Verificar status das compras (`cashback_liberado`)
- Verificar período das compras

### **Comandos de Debug**
```bash
# Verificar fundos
node scripts/verificar-fundos-simples.js

# Verificar compras
node scripts/verificar-compras.js

# Testar distribuição
node scripts/testar-distribuicao-automatica.js
```

## 📈 **Métricas**

### **Distribuições Automáticas**
- **Total de distribuições**: Contador no banco
- **Valor distribuído**: Soma das distribuições
- **Usuários beneficiados**: Contagem por tipo
- **Tempo de execução**: Logs de performance

### **Notificações**
- **Criadores**: Notificação com valor recebido
- **Usuários**: Notificação com valor recebido
- **Admins**: Log de distribuição concluída

## 🎯 **Benefícios**

### **Para Administradores**
- ✅ **Zero intervenção manual**
- ✅ **Distribuição pontual**
- ✅ **Logs detalhados**
- ✅ **Notificações automáticas**

### **Para Usuários**
- ✅ **Recebimento automático**
- ✅ **Notificações em tempo real**
- ✅ **Transparência total**
- ✅ **Histórico completo**

---

**⚠️ IMPORTANTE**: Este sistema é crítico para a economia do SementesPLAY. Sempre teste em ambiente de desenvolvimento antes de fazer deploy em produção.
