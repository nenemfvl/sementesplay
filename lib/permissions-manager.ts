import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PermissionsManager {
  /**
   * Remove permissões de criador e volta para usuário comum
   */
  static async removeCriadorPermissions(usuarioId: string) {
    try {
      // Atualizar o nível do usuário para 'comum'
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          nivel: 'comum'
        }
      })

      // Log da ação
      await prisma.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'PERMISSAO_REMOVIDA',
          detalhes: 'Permissões de criador removidas - usuário voltou para nível comum',
          nivel: 'warning'
        }
      })

      console.log(`Permissões de criador removidas para usuário ${usuarioId}`)
      return true
    } catch (error) {
      console.error('Erro ao remover permissões de criador:', error)
      return false
    }
  }

  /**
   * Remove permissões de parceiro e volta para usuário comum
   */
  static async removeParceiroPermissions(usuarioId: string) {
    try {
      // Atualizar o nível do usuário para 'comum'
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          nivel: 'comum'
        }
      })

      // Log da ação
      await prisma.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'PERMISSAO_REMOVIDA',
          detalhes: 'Permissões de parceiro removidas - usuário voltou para nível comum',
          nivel: 'warning'
        }
      })

      console.log(`Permissões de parceiro removidas para usuário ${usuarioId}`)
      return true
    } catch (error) {
      console.error('Erro ao remover permissões de parceiro:', error)
      return false
    }
  }

  /**
   * Remove permissões de admin e volta para usuário comum
   */
  static async removeAdminPermissions(usuarioId: string) {
    try {
      // Atualizar o nível do usuário para 'comum'
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          nivel: 'comum'
        }
      })

      // Log da ação
      await prisma.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'PERMISSAO_REMOVIDA',
          detalhes: 'Permissões de admin removidas - usuário voltou para nível comum',
          nivel: 'warning'
        }
      })

      console.log(`Permissões de admin removidas para usuário ${usuarioId}`)
      return true
    } catch (error) {
      console.error('Erro ao remover permissões de admin:', error)
      return false
    }
  }

  /**
   * Verifica e corrige inconsistências de permissões
   */
  static async checkAndFixPermissions() {
    try {
      // Verificar usuários que têm nível de criador mas não têm registro na tabela criadores
      const criadoresInconsistentes = await prisma.usuario.findMany({
        where: {
          OR: [
            { nivel: 'criador-iniciante' },
            { nivel: 'criador-comum' },
            { nivel: 'criador-parceiro' },
            { nivel: 'criador-supremo' }
          ],
          criador: null
        }
      })

      // Verificar usuários que têm nível de parceiro mas não têm registro na tabela parceiros
      const parceirosInconsistentes = await prisma.usuario.findMany({
        where: {
          nivel: 'parceiro',
          parceiro: null
        }
      })

      // Verificar usuários que têm nível de admin mas não deveriam
      const adminsInconsistentes = await prisma.usuario.findMany({
        where: {
          nivel: '5',
          AND: [
            { criador: null },
            { parceiro: null }
          ]
        }
      })

      // Corrigir inconsistências
      for (const usuario of criadoresInconsistentes) {
        await this.removeCriadorPermissions(usuario.id)
      }

      for (const usuario of parceirosInconsistentes) {
        await this.removeParceiroPermissions(usuario.id)
      }

      for (const usuario of adminsInconsistentes) {
        await this.removeAdminPermissions(usuario.id)
      }

      const totalCorrigidos = criadoresInconsistentes.length + parceirosInconsistentes.length + adminsInconsistentes.length

      if (totalCorrigidos > 0) {
        console.log(`Corrigidas ${totalCorrigidos} inconsistências de permissões`)
        
        // Log geral da verificação
        await prisma.logAuditoria.create({
          data: {
            usuarioId: 'system',
            acao: 'VERIFICACAO_PERMISSOES',
            detalhes: `Verificação automática corrigiu ${totalCorrigidos} inconsistências de permissões`,
            nivel: 'info'
          }
        })
      }

      return {
        criadoresCorrigidos: criadoresInconsistentes.length,
        parceirosCorrigidos: parceirosInconsistentes.length,
        adminsCorrigidos: adminsInconsistentes.length,
        total: totalCorrigidos
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error)
      return {
        criadoresCorrigidos: 0,
        parceirosCorrigidos: 0,
        adminsCorrigidos: 0,
        total: 0,
        error: error.message
      }
    }
  }

  /**
   * Verifica se um usuário tem permissões consistentes
   */
  static async checkUserPermissions(usuarioId: string) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: {
          criador: true,
          parceiro: true
        }
      })

      if (!usuario) {
        return { error: 'Usuário não encontrado' }
      }

      const inconsistencias = []

      // Verificar se tem nível de criador mas não tem registro
      if (['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo'].includes(usuario.nivel) && !usuario.criador) {
        inconsistencias.push('Nível de criador sem registro na tabela criadores')
      }

      // Verificar se tem nível de parceiro mas não tem registro
      if (usuario.nivel === 'parceiro' && !usuario.parceiro) {
        inconsistencias.push('Nível de parceiro sem registro na tabela parceiros')
      }

      // Verificar se tem nível de admin mas não deveria
      if (usuario.nivel === '5' && !usuario.criador && !usuario.parceiro) {
        inconsistencias.push('Nível de admin sem justificativa')
      }

      return {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          nivel: usuario.nivel,
          temCriador: !!usuario.criador,
          temParceiro: !!usuario.parceiro
        },
        inconsistencias,
        temInconsistencias: inconsistencias.length > 0
      }
    } catch (error) {
      console.error('Erro ao verificar permissões do usuário:', error)
      return { error: error.message }
    }
  }
} 