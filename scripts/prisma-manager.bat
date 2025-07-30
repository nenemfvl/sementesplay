@echo off
title Prisma Manager - SementesPLAY

:menu
cls
echo.
echo ========================================
echo    PRISMA MANAGER - SementesPLAY
echo ========================================
echo.
echo Escolha uma opção:
echo.
echo 1. 🔄 Atualizar Prisma (Generate + Deploy)
echo 2. 🗄️  Abrir Prisma Studio
echo 3. 📊 Verificar status do banco
echo 4. 🧹 Resetar banco (CUIDADO!)
echo 5. 📝 Criar nova migração
echo 6. 🚪 Sair
echo.
set /p choice="Digite sua escolha (1-6): "

if "%choice%"=="1" goto update
if "%choice%"=="2" goto studio
if "%choice%"=="3" goto status
if "%choice%"=="4" goto reset
if "%choice%"=="5" goto migrate
if "%choice%"=="6" goto exit
goto menu

:update
cls
echo.
echo ========================================
echo    ATUALIZANDO PRISMA
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
pause
goto menu

:studio
cls
echo.
echo ========================================
echo    ABRINDO PRISMA STUDIO
echo ========================================
echo.
echo 🗄️ Iniciando Prisma Studio...
echo 🌐 Acesse: http://localhost:5555
echo.
npx prisma studio
goto menu

:status
cls
echo.
echo ========================================
echo    STATUS DO BANCO
echo ========================================
echo.
echo 📊 Verificando status...
npx prisma db pull
echo.
echo 📋 Migrações aplicadas:
npx prisma migrate status
echo.
pause
goto menu

:reset
cls
echo.
echo ========================================
echo    RESETAR BANCO DE DADOS
echo ========================================
echo.
echo ⚠️  ATENÇÃO: Esta ação irá apagar todos os dados!
echo.
set /p confirm="Tem certeza? Digite 'SIM' para confirmar: "
if not "%confirm%"=="SIM" goto menu
echo.
echo 🧹 Resetando banco...
npx prisma migrate reset --force
echo.
echo ✅ Banco resetado com sucesso!
echo.
pause
goto menu

:migrate
cls
echo.
echo ========================================
echo    CRIAR NOVA MIGRAÇÃO
echo ========================================
echo.
set /p name="Nome da migração: "
echo.
echo 📝 Criando migração: %name%
npx prisma migrate dev --name %name%
echo.
pause
goto menu

:exit
cls
echo.
echo 👋 Até logo!
echo.
exit 