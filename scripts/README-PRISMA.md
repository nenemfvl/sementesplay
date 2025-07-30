# 🗄️ Scripts do Prisma - SementesPLAY

Scripts para facilitar o gerenciamento do Prisma com um clique.

## 📁 Arquivos Disponíveis

### Windows (.bat)
- `update-prisma.bat` - Atualização rápida do Prisma
- `prisma-manager.bat` - Gerenciador completo com menu

### Linux/Mac (.sh)
- `update-prisma.sh` - Atualização rápida do Prisma

## 🚀 Como Usar

### Windows - Atualização Rápida
```bash
# Duplo clique no arquivo ou execute no terminal:
scripts/update-prisma.bat
```

### Windows - Gerenciador Completo
```bash
# Duplo clique no arquivo ou execute no terminal:
scripts/prisma-manager.bat
```

**Opções disponíveis:**
1. 🔄 **Atualizar Prisma** - Generate + Deploy + Push
2. 🗄️ **Abrir Prisma Studio** - Interface visual do banco
3. 📊 **Verificar status** - Status das migrações
4. 🧹 **Resetar banco** - Apaga todos os dados (CUIDADO!)
5. 📝 **Criar migração** - Nova migração com nome personalizado
6. 🚪 **Sair**

### Linux/Mac
```bash
# Dar permissão de execução:
chmod +x scripts/update-prisma.sh

# Executar:
./scripts/update-prisma.sh
```

## ⚡ Comandos Executados

### Atualização Rápida
```bash
npx prisma generate    # Gera cliente Prisma
npx prisma migrate deploy  # Aplica migrações
npx prisma db push     # Sincroniza schema
```

### Prisma Studio
```bash
npx prisma studio      # Abre interface web em http://localhost:5555
```

## 🔧 Comandos Manuais

Se preferir usar comandos diretamente:

```bash
# Gerar cliente
npx prisma generate

# Aplicar migrações
npx prisma migrate deploy

# Sincronizar schema
npx prisma db push

# Abrir Studio
npx prisma studio

# Ver status
npx prisma migrate status

# Resetar banco
npx prisma migrate reset --force
```

## 📝 Dicas

- **Sempre** execute `prisma generate` após mudanças no schema
- Use `prisma migrate dev` para desenvolvimento local
- Use `prisma migrate deploy` para produção
- O Prisma Studio é ótimo para visualizar e editar dados
- Faça backup antes de resetar o banco!

## 🆘 Solução de Problemas

### Erro de conexão
```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL

# Testar conexão
npx prisma db pull
```

### Migrações com conflito
```bash
# Resetar migrações
npx prisma migrate reset --force

# Ou resolver manualmente
npx prisma migrate resolve --applied nome_migracao
```

### Cliente desatualizado
```bash
# Regenerar cliente
npx prisma generate --force
``` 