@echo off
echo.
echo ========================================
echo    ATUALIZANDO PRISMA - SementesPLAY
echo ========================================
echo.

echo 🔄 Gerando cliente Prisma...
npx prisma generate

echo.
echo 🔄 Aplicando migrações...
npx prisma migrate deploy

echo.
echo 🔄 Verificando status do banco...
npx prisma db push

echo.
echo ✅ Prisma atualizado com sucesso!
echo.
echo 🚀 Para abrir o Prisma Studio, execute:
echo    npx prisma studio
echo.
pause 