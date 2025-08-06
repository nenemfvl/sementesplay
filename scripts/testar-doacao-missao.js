// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function testarDoacaoMissao() {
  try {
    console.log('=== TESTE DE DOAÇÃO E MISSÕES ===')
    
    // 1. Buscar usuário para doar
    const doador = await prisma.usuario.findFirst({
      where: { sementes: { gt: 0 } }
    })
    
    if (!doador) {
      console.log('Nenhum usuário com sementes encontrado')
      return
    }
    
    console.log(`Usuário doador: ${doador.nome} (${doador.sementes} sementes)`)
    
    // 2. Buscar criador para receber doação
    const criador = await prisma.criador.findFirst({
      include: { usuario: true }
    })
    
    if (!criador) {
      console.log('Nenhum criador encontrado')
      return
    }
    
    console.log(`Criador: ${criador.usuario.nome}`)
    
    // 3. Verificar missões antes da doação
    console.log('\n--- ANTES DA DOAÇÃO ---')
    const missoesAntes = await prisma.missaoUsuario.findMany({
      where: { usuarioId: doador.id },
      include: { missao: true }
    })
    
    console.log(`Missões do usuário: ${missoesAntes.length}`)
    missoesAntes.forEach(mu => {
      console.log(`- ${mu.missao.titulo}: ${mu.progresso}/${mu.missao.objetivo}`)
    })
    
    // 4. Fazer doação via API
    console.log('\n--- FAZENDO DOAÇÃO ---')
    const doacao = await prisma.doacao.create({
      data: {
        doadorId: doador.id,
        criadorId: criador.id,
        quantidade: 1,
        mensagem: 'Teste de missão',
        data: new Date()
      }
    })
    
    console.log(`Doação criada: ${doacao.id}`)
    
    // 5. Atualizar sementes do doador
    await prisma.usuario.update({
      where: { id: doador.id },
      data: { sementes: { decrement: 1 } }
    })
    
    // 6. Atualizar sementes do criador
    await prisma.usuario.update({
      where: { id: criador.usuarioId },
      data: { sementes: { increment: 1 } }
    })
    
    // 7. Simular a função de atualizar missões
    console.log('\n--- ATUALIZANDO MISSÕES ---')
    await atualizarMissoesConquistas(doador.id, 'doacao', 1)
    
    // 8. Verificar missões depois da doação
    console.log('\n--- DEPOIS DA DOAÇÃO ---')
    const missoesDepois = await prisma.missaoUsuario.findMany({
      where: { usuarioId: doador.id },
      include: { missao: true }
    })
    
    console.log(`Missões do usuário: ${missoesDepois.length}`)
    missoesDepois.forEach(mu => {
      console.log(`- ${mu.missao.titulo}: ${mu.progresso}/${mu.missao.objetivo} (${mu.concluida ? 'Concluída' : 'Em progresso'})`)
    })
    
    // 9. Verificar conquistas
    const conquistas = await prisma.conquistaUsuario.findMany({
      where: { usuarioId: doador.id },
      include: { conquista: true }
    })
    
    console.log(`\nConquistas do usuário: ${conquistas.length}`)
    conquistas.forEach(cu => {
      console.log(`- ${cu.conquista.titulo} (${cu.concluida ? 'Concluída' : 'Em progresso'})`)
    })
    
    console.log('\n=== FIM DO TESTE ===')
    
  } catch (error) {
    console.error('Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Função para atualizar missões (copiada da API)
async function atualizarMissoesConquistas(usuarioId, tipoAcao, valor) {
  try {
    console.log('Atualizando missões para usuário:', usuarioId, 'tipo:', tipoAcao, 'valor:', valor)
    
    // Buscar missões ativas relacionadas à ação
    const missoes = await prisma.missao.findMany({
      where: {
        ativa: true,
        tipo: tipoAcao
      }
    })

    console.log('Missões encontradas:', missoes.length)

    for (const missao of missoes) {
      console.log('Processando missão:', missao.titulo, 'objetivo:', missao.objetivo)
      
      // Verificar se o usuário já tem progresso nesta missão
      let missaoUsuario = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuarioId
        }
      })

      if (!missaoUsuario) {
        console.log('Criando novo progresso para missão:', missao.titulo)
        // Criar novo progresso
        missaoUsuario = await prisma.missaoUsuario.create({
          data: {
            missaoId: missao.id,
            usuarioId: usuarioId,
            progresso: 0,
            concluida: false
          }
        })
      }

      console.log('Progresso atual:', missaoUsuario.progresso, 'concluída:', missaoUsuario.concluida)

      // Atualizar progresso baseado no tipo de ação
      let novoProgresso = missaoUsuario.progresso
      let concluida = missaoUsuario.concluida

      switch (tipoAcao) {
        case 'doacao':
          novoProgresso += 1 // Contar número de doações
          console.log('Novo progresso após doação:', novoProgresso, 'objetivo:', missao.objetivo)
          if (novoProgresso >= missao.objetivo && !concluida) {
            console.log('Missão completada! Criando conquista...')
            concluida = true
            // Criar conquista se a missão for completada
            await criarConquistaSeNecessario(usuarioId, missao.titulo)
          }
          break
        case 'valor_doacao':
          if (valor) {
            novoProgresso += valor // Somar valor das doações
            console.log('Novo progresso após valor:', novoProgresso, 'objetivo:', missao.objetivo)
            if (novoProgresso >= missao.objetivo && !concluida) {
              console.log('Missão completada! Criando conquista...')
              concluida = true
              await criarConquistaSeNecessario(usuarioId, missao.titulo)
            }
          }
          break
      }

      // Atualizar missão do usuário
      await prisma.missaoUsuario.update({
        where: { id: missaoUsuario.id },
        data: {
          progresso: novoProgresso,
          concluida: concluida,
          dataConclusao: concluida && !missaoUsuario.concluida ? new Date() : missaoUsuario.dataConclusao
        }
      })
      
      console.log('Missão atualizada - progresso:', novoProgresso, 'concluída:', concluida)
    }
  } catch (error) {
    console.error('Erro ao atualizar missões:', error)
  }
}

// Função para criar conquista
async function criarConquistaSeNecessario(usuarioId, tituloMissao) {
  try {
    console.log('Tentando criar conquista para missão:', tituloMissao, 'usuário:', usuarioId)
    
    // Mapear missões para conquistas
    const mapeamentoConquistas = {
      'Primeira Doação': 'Primeira Doação',
      'Doador Frequente': 'Doador Frequente',
      'Apoiador de Criadores': 'Apoiador de Criadores'
    }

    const nomeConquista = mapeamentoConquistas[tituloMissao]
    console.log('Nome da conquista mapeada:', nomeConquista)
    
    if (!nomeConquista) {
      console.log('Nenhuma conquista mapeada para missão:', tituloMissao)
      return
    }

    // Buscar conquista
    const conquista = await prisma.conquista.findFirst({
      where: { titulo: nomeConquista }
    })

    console.log('Conquista encontrada:', conquista)

    if (conquista) {
      // Verificar se o usuário já tem esta conquista
      const conquistaExistente = await prisma.conquistaUsuario.findFirst({
        where: {
          conquistaId: conquista.id,
          usuarioId: usuarioId
        }
      })

      console.log('Conquista existente para usuário:', conquistaExistente)

      if (!conquistaExistente) {
        console.log('Criando nova conquista para usuário...')
        // Criar conquista para o usuário
        const novaConquista = await prisma.conquistaUsuario.create({
          data: {
            conquistaId: conquista.id,
            usuarioId: usuarioId,
            dataConquista: new Date()
          }
        })
        console.log('Conquista criada com sucesso:', novaConquista)
      } else {
        console.log('Usuário já possui esta conquista')
      }
    } else {
      console.log('Conquista não encontrada no banco de dados:', nomeConquista)
    }
  } catch (error) {
    console.error('Erro ao criar conquista:', error)
  }
}

// testarDoacaoMissao() 