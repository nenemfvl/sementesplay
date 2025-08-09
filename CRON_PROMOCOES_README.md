# 🚀 SISTEMA DE PROMOÇÕES AUTOMÁTICAS - SementesPLAY

## 📋 **Visão Geral**

Sistema automático que promove/rebaixa criadores baseado em sua posição no ranking, garantindo que os melhores criadores tenham os níveis mais altos.

## 🎯 **Regras de Promoção**

### **Sistema de Níveis**
- **criador-supremo** 🏆: Elite dos criadores
- **criador-parceiro** 🤝: Criadores de destaque
- **criador-comum** ⭐: Criadores ativos
- **criador-iniciante** 🌱: Criadores básicos

### **Critérios de Promoção**
```
1º lugar → criador-supremo (garantido)
Top 1-50 → criador-supremo
Top 51-100 → criador-parceiro  
Top 101-150 → criador-comum
Top 151+ → criador-iniciante
```

## 🔧 **Como Funciona**

### **1. Cálculo de Pontuação**
A pontuação total é calculada somando:
- **Sementes Recebidas** (doações)
- **Pontos do Usuário** (atividades gerais)
- **Pontos por Visualizações** (conteúdos × 0.1)
- **Pontos por Enquetes** (quantidade × 5)
- **Pontos por Recados Públicos** (quantidade × 2)

### **2. Ranking e Promoção**
- Criadores são ordenados por pontuação total
- Níveis são atribuídos baseados na posição
- Promoções/rebaixamentos são aplicados automaticamente

## 🚀 **APIs Disponíveis**

### **Promoção Manual (Admin)**
```
POST /api/admin/promover-niveis
```
- **Uso**: Para administradores executarem promoções manualmente
- **Segurança**: Apenas para admins
- **Retorno**: Lista de promoções e rebaixamentos aplicados

### **Promoção Automática (Cron)**
```
POST /api/cron/promover-niveis-automatico?secret=CRON_SECRET
```
- **Uso**: Para cron jobs executarem promoções automaticamente
- **Segurança**: Requer `CRON_SECRET` no header ou query
- **Retorno**: Resumo das promoções executadas

## ⚙️ **Configuração**

### **Variável de Ambiente**
```env
CRON_SECRET=sua_chave_secreta_aqui
```

### **Configuração do Cron (Railway/Vercel)**
```bash
# Executar a cada 24 horas
0 0 * * * curl -X POST "https://seu-dominio.vercel.app/api/cron/promover-niveis-automatico?secret=CRON_SECRET"

# Executar a cada 12 horas
0 */12 * * * curl -X POST "https://seu-dominio.vercel.app/api/cron/promover-niveis-automatico?secret=CRON_SECRET"

# Executar a cada 6 horas
0 */6 * * * curl -X POST "https://seu-dominio.vercel.app/api/cron/promover-niveis-automatico?secret=CRON_SECRET"
```

## 🧪 **Scripts de Teste**

### **1. Simular Promoções**
```bash
node scripts/testar-promocao.js
```
- Mostra como seriam as promoções sem aplicá-las
- Útil para verificar a lógica antes de executar

### **2. Ranking com Níveis**
```bash
node scripts/ranking-com-niveis.js
```
- Mostra ranking atual com sugestões de nível
- Compara níveis atuais vs. sugeridos

## 📊 **Monitoramento**

### **Logs Automáticos**
- Todas as promoções são logadas no console
- Logs podem ser salvos no banco (se tabela `logSistema` existir)
- Timestamps de todas as execuções

### **Métricas**
- Total de criadores processados
- Número de promoções aplicadas
- Número de rebaixamentos
- Criadores sem mudanças

## 🔒 **Segurança**

### **Proteções Implementadas**
- **API Admin**: Apenas para administradores
- **API Cron**: Requer `CRON_SECRET` válido
- **Validação**: Verificação de dados antes da atualização
- **Tratamento de Erros**: Falhas não afetam outros criadores

### **Recomendações**
- Use `CRON_SECRET` forte e único
- Monitore logs regularmente
- Teste em ambiente de desenvolvimento primeiro
- Faça backup antes de executar promoções em massa

## 🚨 **Considerações Importantes**

### **Antes de Implementar**
1. **Backup**: Faça backup do banco de dados
2. **Teste**: Execute em ambiente de teste primeiro
3. **Horário**: Escolha horário de baixo tráfego
4. **Notificação**: Informe usuários sobre mudanças

### **Durante a Execução**
1. **Monitoramento**: Acompanhe logs em tempo real
2. **Verificação**: Confirme que as mudanças foram aplicadas
3. **Rollback**: Tenha plano de reversão se necessário

### **Após a Execução**
1. **Validação**: Verifique se os níveis estão corretos
2. **Notificação**: Informe usuários sobre suas promoções
3. **Análise**: Revise métricas e ajuste se necessário

## 📈 **Benefícios**

### **Para o Sistema**
- **Ranking Consistente**: Níveis sempre refletem performance real
- **Motivação**: Criadores se esforçam para subir de nível
- **Automatização**: Sem necessidade de intervenção manual
- **Transparência**: Critérios claros e objetivos

### **Para os Criadores**
- **Reconhecimento**: Níveis refletem esforço e qualidade
- **Motivação**: Objetivo claro para evolução
- **Justiça**: Sistema imparcial baseado em métricas
- **Status**: Diferenciação baseada em performance real

## 🔮 **Futuras Melhorias**

### **Funcionalidades Planejadas**
- **Notificações**: Alertas automáticos sobre promoções
- **Badges**: Conquistas visuais para cada nível
- **Benefícios**: Vantagens específicas por nível
- **Histórico**: Rastreamento de evolução do criador
- **Dashboard**: Interface para acompanhar progresso

### **Otimizações Técnicas**
- **Cache**: Armazenar rankings calculados
- **Batch Updates**: Atualizações em lote para melhor performance
- **Webhooks**: Notificações em tempo real
- **Analytics**: Métricas detalhadas de evolução

---

**🎯 Sistema implementado e pronto para uso!**
