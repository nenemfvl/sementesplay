import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { CheckIcon, XMarkIcon, GiftIcon, CurrencyDollarIcon, FlagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Notificacoes from '../../components/Notificacoes'
import { auth } from '../../lib/auth'

export default function PainelAdmin() {
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [distribuindo, setDistribuindo] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Simulação: buscar usuário admin logado
    const currentUser = auth.getUser && auth.getUser()
    setUser(currentUser)
    if (!currentUser || Number(currentUser.nivel) < 5) {
      window.location.href = '/login'
      return
    }
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/painel')
    const data = await res.json()
    setDados(data)
    setLoading(false)
  }

  const aprovarRepasse = async (repasseId: string) => {
    if (!window.confirm('Aprovar este repasse?')) return
    await fetch('/api/admin/aprovar-repasse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repasseId })
    })
    carregarDados()
  }

  const rejeitarRepasse = async (repasseId: string) => {
    if (!window.confirm('Rejeitar este repasse?')) return
    // Aqui pode-se implementar endpoint de rejeição se desejar
    alert('Funcionalidade de rejeição não implementada')
  }

  const distribuirFundo = async () => {
    if (!window.confirm('Distribuir fundo de sementes para criadores e usuários?')) return
    setDistribuindo(true)
    await fetch('/api/admin/distribuir-fundo', { method: 'POST' })
    setDistribuindo(false)
    carregarDados()
  }

  const processarDenuncia = async (denunciaId: string, acao: 'aprovar' | 'rejeitar') => {
    const confirmacao = acao === 'aprovar' 
      ? 'Aprovar esta denúncia? O conteúdo pode ser removido.'
      : 'Rejeitar esta denúncia?'
    
    if (!window.confirm(confirmacao)) return

    try {
      const response = await fetch('/api/admin/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ denunciaId, acao })
      })

      if (response.ok) {
        alert(`Denúncia ${acao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso!`)
        carregarDados()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao processar denúncia:', error)
      alert('Erro ao processar denúncia')
    }
  }

  return (
    <>
      <Head>
        <title>Painel Admin - SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark p-8">
        <div className="bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded mb-4 text-blue-200">
          <strong>Fluxo do sistema:</strong><br />
          • Usuários compram em sites parceiros usando o cupom <b>sementesplay20</b>.<br />
          • Parceiros devem repassar 20% do valor ao SementesPLAY e enviar comprovante.<br />
          • Admin aprova repasses para liberar cashback e alimentar o fundo de sementes.<br />
          • O fundo é distribuído a cada ciclo para criadores e usuários.<br />
          • Dúvidas? Consulte o suporte ou documentação.
        </div>
        {user && <Notificacoes usuarioId={user.id} />}
        <h1 className="text-3xl font-bold text-sss-white mb-8">Painel Administrativo</h1>
        {loading ? (
          <div className="text-sss-white">Carregando...</div>
        ) : (
          <div className="space-y-10">
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <h2 className="text-xl font-bold text-sss-accent mb-4">Compras aguardando repasse</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sss-light">
                      <th className="text-left p-2 text-gray-400 font-medium">Parceiro</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Valor</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.comprasAguardando.length === 0 ? (
                      <tr><td colSpan={3} className="text-gray-400 p-4">Nenhuma compra aguardando repasse.</td></tr>
                    ) : dados.comprasAguardando.map((compra: any) => (
                      <tr key={compra.id} className="border-b border-sss-light/50">
                        <td className="p-2">{compra.parceiro?.nomeCidade || '-'}</td>
                        <td className="p-2">R$ {compra.valorCompra.toFixed(2)}</td>
                        <td className="p-2">{new Date(compra.dataCompra).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <h2 className="text-xl font-bold text-sss-accent mb-4">Repasses pendentes</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sss-light">
                      <th className="text-left p-2 text-gray-400 font-medium">Parceiro</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Valor</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Compra</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Comprovante</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.repassesPendentes.length === 0 ? (
                      <tr><td colSpan={5} className="text-gray-400 p-4">Nenhum repasse pendente.</td></tr>
                    ) : dados.repassesPendentes.map((repasse: any) => (
                      <tr key={repasse.id} className="border-b border-sss-light/50">
                        <td className="p-2">{repasse.parceiro?.nomeCidade || '-'}</td>
                        <td className="p-2">R$ {repasse.valor.toFixed(2)}</td>
                        <td className="p-2">R$ {repasse.compra?.valorCompra.toFixed(2)}</td>
                        <td className="p-2">
                          {repasse.comprovanteUrl ? (
                            <a href={repasse.comprovanteUrl} target="_blank" rel="noopener noreferrer" className="text-sss-accent underline">Ver</a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-2 flex gap-2">
                          <button onClick={() => aprovarRepasse(repasse.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1"><CheckIcon className="w-4 h-4" />Aprovar</button>
                          <button onClick={() => rejeitarRepasse(repasse.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Rejeitar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <h2 className="text-xl font-bold text-sss-accent mb-4">Fundo de Sementes Atual</h2>
              {dados.fundoAtual ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <GiftIcon className="w-6 h-6 text-blue-400" />
                    <span className="text-sss-white font-semibold">R$ {dados.fundoAtual.valorTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={distribuirFundo} disabled={distribuindo} className="bg-sss-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50">
                    {distribuindo ? 'Distribuindo...' : 'Distribuir Fundo' }
                  </button>
                </div>
              ) : (
                <div className="text-gray-400">Nenhum fundo de sementes pendente de distribuição.</div>
              )}
            </div>

            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <h2 className="text-xl font-bold text-sss-accent mb-4 flex items-center gap-2">
                <FlagIcon className="w-6 h-6" />
                Denúncias Pendentes ({dados.denunciasPendentes?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sss-light">
                      <th className="text-left p-2 text-gray-400 font-medium">Denunciante</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Tipo</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Conteúdo</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Motivo</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Data</th>
                      <th className="text-left p-2 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!dados.denunciasPendentes || dados.denunciasPendentes.length === 0 ? (
                      <tr><td colSpan={6} className="text-gray-400 p-4">Nenhuma denúncia pendente.</td></tr>
                    ) : dados.denunciasPendentes.map((denuncia: any) => (
                      <tr key={denuncia.id} className="border-b border-sss-light/50">
                        <td className="p-2">
                          <div className="text-sm">
                            <div className="text-sss-white">{denuncia.denunciante?.nome || 'Anônimo'}</div>
                            <div className="text-gray-400 text-xs">{denuncia.denunciante?.email || '-'}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            denuncia.conteudo ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {denuncia.conteudo ? 'Criador' : 'Parceiro'}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            <div className="text-sss-white">
                              {denuncia.conteudo?.titulo || denuncia.conteudoParceiro?.titulo || 'Título não disponível'}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {denuncia.conteudo?.criador?.nome || denuncia.conteudoParceiro?.parceiro?.nome || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            <div className="text-sss-white">{denuncia.tipo}</div>
                            <div className="text-gray-400 text-xs">{denuncia.motivo}</div>
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-400">
                          {new Date(denuncia.dataCriacao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2 flex gap-2">
                          <button 
                            onClick={() => processarDenuncia(denuncia.id, 'aprovar')} 
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                          >
                            <CheckIcon className="w-3 h-3" />
                            Aprovar
                          </button>
                          <button 
                            onClick={() => processarDenuncia(denuncia.id, 'rejeitar')} 
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                          >
                            <XMarkIcon className="w-3 h-3" />
                            Rejeitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 