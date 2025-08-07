# 🔄 Configuração do Cron Job para Atualização Automática de Níveis

## 📋 Visão Geral

O sistema de níveis dos criadores agora é atualizado automaticamente via cron job, eliminando a necessidade de atualizações manuais.

## 🎯 Funcionalidade

- **Atualização automática** dos níveis baseada no ranking
- **Execução programada** via cron job
- **Logs detalhados** para auditoria
- **Segurança** com token de autenticação

## ⚙️ Configuração

### 1. Variável de Ambiente

Adicione no seu arquivo `.env`:

```env
CRON_SECRET=sua-chave-secreta-aqui
```

### 2. Configuração do Cron Job

#### Opção A: Cron Job no Servidor (Recomendado)

Adicione ao crontab do servidor:

```bash
# Atualizar níveis todos os dias às 00:00 BRT
0 0 * * * curl -X POST https://seu-dominio.com/api/cron/atualizar-niveis-automatico \
  -H "Authorization: Bearer sua-chave-secreta-aqui" \
  -H "Content-Type: application/json"
```

#### Opção B: Vercel Cron Jobs

Se estiver usando Vercel, adicione no `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/atualizar-niveis-automatico",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### Opção C: Railway Cron Jobs

Se estiver usando Railway, configure no painel:

- **Schedule**: `0 0 * * *`
- **Command**: `curl -X POST $RAILWAY_STATIC_URL/api/cron/atualizar-niveis-automatico -H "Authorization: Bearer $CRON_SECRET"`

### 3. Teste Manual

Para testar a API manualmente:

```bash
curl -X GET https://seu-dominio.com/api/cron/atualizar-niveis-automatico
```

## 📊 Monitoramento

### Logs de Execução

A API gera logs detalhados:

```
🕛 Iniciando atualização automática de níveis...
📅 Data/Hora: 01/01/2024 00:00:00
✅ Atualização automática concluída: 5 mudanças em 25 criadores
📊 Resumo da atualização automática:
- Total de criadores processados: 25
- Níveis atualizados: 5
- Timestamp: 2024-01-01T03:00:00.000Z
```

### Resposta da API

```json
{
  "success": true,
  "message": "Níveis atualizados para 5 criadores",
  "mudancas": 5,
  "totalCriadores": 25,
  "timestamp": "2024-01-01T03:00:00.000Z",
  "timezone": "America/Sao_Paulo"
}
```

## 🔒 Segurança

- **Token de autenticação** obrigatório para execução
- **Logs de auditoria** para rastreamento
- **Validação de método** HTTP
- **Tratamento de erros** robusto

## 🚀 Benefícios

1. **Zero intervenção manual** - Tudo automático
2. **Consistência** - Níveis sempre atualizados
3. **Performance** - Não impacta doações
4. **Auditoria** - Logs completos
5. **Flexibilidade** - Configurável via cron

## 🔧 Troubleshooting

### Erro 401 - Não autorizado
- Verifique se o `CRON_SECRET` está configurado corretamente
- Confirme se o token está sendo enviado no header

### Erro 405 - Método não permitido
- Use apenas `POST` para execução automática
- Use `GET` apenas para testes

### Erro 500 - Erro interno
- Verifique os logs do servidor
- Confirme se o banco de dados está acessível

## 📝 Notas Importantes

- A atualização manual após doações foi **removida** para melhor performance
- O cron job deve rodar **diariamente** para manter os níveis atualizados
- Configure **monitoramento** para verificar se o cron está funcionando
- Mantenha **backup** dos logs para auditoria

## 🎯 Próximos Passos

1. Configure o cron job no seu servidor
2. Teste a execução manual
3. Monitore os logs por alguns dias
4. Configure alertas se necessário
