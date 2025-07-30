# Painel de Parceiros - SementesPLAY

## Visão Geral

O Painel de Parceiros é uma interface exclusiva para donos de cidades FiveM que são parceiros do SementesPLAY. Este painel permite gerenciar códigos de cashback, acompanhar estatísticas de vendas e visualizar relatórios detalhados.

## Funcionalidades Implementadas

### 🎯 Dashboard Principal

- **Estatísticas em Tempo Real**: Total de vendas, comissões, códigos ativos e usuários ativos
- **Transações Recentes**: Lista das últimas 5 transações com códigos do parceiro
- **Visão Geral**: Resumo completo da performance da cidade

### 💳 Gestão de Códigos de Cashback

- **Geração de Códigos**: Interface para criar códigos únicos com valores personalizados
- **Listagem de Códigos**: Visualização de todos os códigos gerados com status (ativo/usado)
- **Cópia de Códigos**: Funcionalidade para copiar códigos para a área de transferência
- **Histórico**: Data de geração e uso dos códigos

### 📊 Transações

- **Histórico Completo**: Todas as transações que usaram códigos do parceiro
- **Detalhes da Transação**: Usuário, valor, status e data
- **Filtros**: Por status (aprovada, pendente, rejeitada)

### 📈 Relatórios
- **Relatório de Vendas**: Total de vendas, comissões e transações do mês
- **Relatório de Códigos**: Quantidade de códigos gerados, ativos e usados
- **Métricas de Performance**: Análise detalhada da performance da cidade

### ⚙️ Configurações
- **Informações da Cidade**: Nome da cidade e comissão mensal
- **Dados do Parceiro**: Informações básicas do perfil

## APIs Implementadas

### `/api/parceiros/perfil`
- **Método**: GET
- **Parâmetros**: `usuarioId`
- **Retorno**: Dados completos do parceiro incluindo informações do usuário

### `/api/parceiros/codigos`
- **Método**: GET
- **Parâmetros**: `usuarioId`
- **Retorno**: Lista de todos os códigos de cashback do parceiro

### `/api/parceiros/transacoes`
- **Método**: GET
- **Parâmetros**: `usuarioId`
- **Retorno**: Histórico de transações que usaram códigos do parceiro

### `/api/parceiros/estatisticas`
- **Método**: GET
- **Parâmetros**: `usuarioId`
- **Retorno**: Estatísticas calculadas (vendas, comissões, códigos, etc.)

### `/api/parceiros/gerar-codigo`
- **Método**: POST
- **Body**: `{ valor, quantidade, usuarioId }`
- **Retorno**: Códigos gerados com sucesso

## Estrutura do Banco de Dados

### Tabela `parceiros`
```sql
- id: String (PK)
- usuarioId: String (FK para usuarios)
- nomeCidade: String
- comissaoMensal: Float
- totalVendas: Float
- codigosGerados: Int
```

### Tabela `codigos_cashback`
```sql
- id: String (PK)
- parceiroId: String (FK para parceiros)
- codigo: String (único)
- valor: Float
- usado: Boolean
- dataGeracao: DateTime
- dataUso: DateTime (opcional)
```

## Como Usar

### 1. Acesso ao Painel
- Faça login como usuário do tipo "parceiro"
- Acesse `/painel-parceiro` ou use a aba no dashboard
- O sistema verifica automaticamente se o usuário é parceiro

### 2. Gerar Códigos
- Vá para a aba "Códigos Cashback"
- Clique em "Gerar Códigos"
- Defina o valor e quantidade desejados
- Os códigos são gerados automaticamente com valores únicos

### 3. Acompanhar Estatísticas
- Use o dashboard principal para visão geral
- Acesse "Relatórios" para análises detalhadas
- Monitore transações em tempo real

### 4. Gerenciar Códigos
- Visualize todos os códigos gerados
- Copie códigos para distribuição
- Acompanhe quais foram usados

## Scripts de Teste

### Criar Parceiro de Teste
```bash
npx ts-node scripts/add-parceiro.ts
```

Este script cria:
- Usuário parceiro: `parceiro@teste.com` / `123456`
- Cidade: "Cidade Teste FiveM"
- Comissão: R$ 500,00
- Códigos de exemplo: TESTE001, TESTE002, TESTE003, TESTE004

## Segurança

- **Controle de Acesso**: Apenas usuários do tipo "parceiro" podem acessar
- **Validação de Dados**: Todas as entradas são validadas
- **Códigos Únicos**: Sistema garante que não há códigos duplicados
- **Logs de Auditoria**: Todas as ações são registradas

## Próximas Funcionalidades

- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações em tempo real
- [ ] Integração com sistemas de pagamento
- [ ] Dashboard avançado com gráficos
- [ ] Sistema de comissões automáticas
- [ ] API para integração com cidades FiveM

## Suporte

Para dúvidas ou problemas com o painel de parceiros, entre em contato:
- Email: parceiros@sementesplay.com
- Discord: [Link do servidor]
- Documentação: [Link da documentação completa] 