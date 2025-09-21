# 📊 Sistema de Fundo de Distribuição - SementesPLAY

## ⚠️ ATENÇÃO: DIRETRIZES CRÍTICAS

Este documento contém informações **ESSENCIAIS** para evitar problemas com o sistema de fundos. **LEIA ANTES DE MODIFICAR QUALQUER CÓDIGO RELACIONADO A FUNDOS.**

## 🎯 Conceitos Importantes

### O que é o Fundo de Distribuição?
- **25%** de cada repasse de parceiro vai para um fundo comum
- O fundo é distribuído periodicamente entre todos os usuários
- Apenas **UM FUNDO** deve estar ativo por vez (`distribuido: false`)

### Estados do Fundo
- **Ativo** (`distribuido: false`): Recebendo contribuições dos repasses
- **Distribuído** (`distribuido: true`): Já foi distribuído, não deve mais receber valores

## 🚨 PROBLEMAS COMUNS E COMO EVITAR

### ❌ ERRO GRAVE: Buscar Fundo Sem Filtros
```javascript
// ❌ NUNCA FAÇA ISSO:
const fundo = await prisma.fundoSementes.findFirst()

// ✅ SEMPRE FAÇA ISSO:
const fundo = await prisma.fundoSementes.findFirst({
  where: { distribuido: false },
  orderBy: { dataInicio: 'desc' }
})
```

**Por quê?** Sem filtros, você pode pegar um fundo já distribuído e "perder" os valores dos novos repasses.

### ❌ ERRO GRAVE: Criar Múltiplos Fundos Ativos
```javascript
// ❌ EVITE CRIAR FUNDOS DESNECESSÁRIOS:
// Sempre verifique se já existe um fundo ativo antes de criar
```

## ✅ BOAS PRÁTICAS

### 1. Use as Funções Utilitárias
```javascript
import { 
  buscarFundoAtivo, 
  adicionarAoFundoAtivo, 
  adicionarAoFundoAtivoTx 
} from '../../../lib/fundo-utils'

// Em transações:
const fundoAtualizado = await adicionarAoFundoAtivoTx(tx, valorPctFundo, cicloAtual)

// Fora de transações:
const fundoAtualizado = await adicionarAoFundoAtivo(valorPctFundo, cicloAtual)
```

### 2. Sempre Use Transações para Repasses
```javascript
await prisma.$transaction(async (tx) => {
  // 1. Atualizar repasse
  // 2. Creditar sementes ao usuário
  // 3. Atualizar fundo (usando função utilitária)
  await adicionarAoFundoAtivoTx(tx, pctFundo, cicloAtual)
})
```

### 3. Log de Atualizações do Fundo
```javascript
console.log(`💰 Fundo ${fundo.id} atualizado: +R$ ${valor} (Total: R$ ${fundo.valorTotal})`)
```

## 🔍 SISTEMA DE MONITORAMENTO

### Verificação Manual
```bash
# Verificar integridade
curl https://sementesplay.com.br/api/admin/verificar-integridade-fundo
```

### Verificação Automática
- **Cron job diário**: `0 6 * * *` (6h da manhã)
- **Endpoint**: `/api/cron/verificar-integridade-fundo`
- **Ação**: Detecta e corrige problemas automaticamente

### Alertas Automáticos
O sistema cria notificações automáticas para:
- ❌ Nenhum fundo ativo encontrado → **Cria automaticamente**
- ⚠️ Múltiplos fundos ativos → **Notifica admin**
- ⚠️ Inconsistência de valores → **Notifica admin**

## 📋 CHECKLIST ANTES DE DEPLOY

Quando modificar código relacionado a fundos, verifique:

- [ ] Está usando `where: { distribuido: false }` ao buscar fundos?
- [ ] Está usando as funções utilitárias de `lib/fundo-utils.ts`?
- [ ] Está fazendo log das atualizações do fundo?
- [ ] Testou o endpoint de verificação de integridade?
- [ ] Verificou se não está criando fundos desnecessários?

## 🚨 EM CASO DE PROBLEMAS

### Sintomas de Problema
- Fundo com valor R$ 0,00 mas houve repasses pagos
- Múltiplos fundos ativos
- Diferença entre valor esperado e real do fundo

### Ações Imediatas
1. **Verificar integridade**: `GET /api/admin/verificar-integridade-fundo`
2. **Executar cron manualmente**: `GET /api/cron/verificar-integridade-fundo`
3. **Se necessário, corrigir manualmente** usando scripts de correção

### Contatos de Emergência
- Sistema monitora automaticamente
- Notificações são criadas para admins
- Logs detalhados no console para debug

## 📊 FLUXO DE DISTRIBUIÇÃO CORRETO

```
Repasse Pago (R$ 1,00)
├── 50% → Usuário (R$ 0,50 em sementes)
├── 25% → Sistema SementesPLAY (R$ 0,25)
└── 25% → Fundo Ativo (R$ 0,25) ✅
```

## 🔗 Arquivos Relacionados

- `lib/fundo-utils.ts` - Funções utilitárias
- `pages/api/mercadopago/webhook.ts` - Processamento de pagamentos
- `pages/api/admin/verificar-integridade-fundo.ts` - Verificação manual
- `pages/api/cron/verificar-integridade-fundo.ts` - Verificação automática
- `pages/api/admin/distribuir-fundo.ts` - Distribuição do fundo

---

**⚠️ IMPORTANTE**: Este sistema é crítico para a economia do SementesPLAY. Qualquer erro pode resultar em perda de valores significativos. Sempre teste em ambiente de desenvolvimento antes de fazer deploy.
